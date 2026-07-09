const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Design = require('../models/Design');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { calculatePrice } = require('../utils/priceCalculator');

// @desc    Calculate price
// @route   POST /api/orders/calculate-price
// @access  Private/Public (Optional auth)
exports.calculateOrderPrice = async (req, res, next) => {
  try {
    const { category, subcategory, material, printArea, aiComplexityScore, quantity, shippingMethod, designId } = req.body;
    
    let design = null;
    if (designId) {
      design = await Design.findById(designId);
      if (design && !design.isPublic) {
        if (!req.user || design.user.toString() !== req.user.id.toString()) {
          design = null;
        }
      }
    }

    const pricing = calculatePrice({
      category,
      subcategory,
      material,
      printArea,
      aiComplexityScore: design ? (design.aiComplexityScore || 0) : (aiComplexityScore || 0),
      quantity,
      shippingMethod,
      design
    });
    res.status(200).json({ success: true, pricing });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe checkout session
// @route   POST /api/orders/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const {
      designId, productId, quantity, material, printArea, size, color,
      shippingMethod, shippingAddress, aiComplexityScore,
    } = req.body;

    const design = await Design.findById(designId);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const pricing = calculatePrice({
      category: design.category,
      subcategory: product.subcategory,
      material: material || 'standard',
      printArea: printArea || 'front',
      aiComplexityScore: design.aiComplexityScore || aiComplexityScore || 0,
      quantity: quantity || 1,
      shippingMethod: shippingMethod || 'standard',
      design,
    });

    // Create a pending order
    const order = await Order.create({
      user: req.user.id,
      design: designId,
      product: productId,
      quantity: quantity || 1,
      selectedMaterial: material,
      selectedPrintArea: printArea,
      selectedSize: size,
      selectedColor: color,
      pricing,
      shippingAddress,
      designSnapshot: design.thumbnail?.url,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${design.title} — ${product.name}`,
              description: `Material: ${material || 'Standard'} | Print Area: ${printArea || 'Front'} | Qty: ${quantity}`,
              images: design.thumbnail?.url ? [design.thumbnail.url] : [],
            },
            unit_amount: Math.round(pricing.total * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard/orders?success=true&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({ success: true, sessionId: session.id, sessionUrl: session.url, orderId: order._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('design', 'title thumbnail category')
        .populate('product', 'name subcategory')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('design', 'title thumbnail category canvasData')
      .populate('product')
      .populate('user', 'name email avatar');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment (called after successful Stripe payment)
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify session status with Stripe
    if (order.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === 'paid') {
        order.isPaid = true;
        order.paidAt = new Date();
        order.status = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        // Increment design purchase count
        await Design.findByIdAndUpdate(order.design, { $inc: { purchaseCount: 1 } });

        // Notify
        await Notification.create({
          recipient: req.user.id,
          type: 'order_placed',
          message: `Your order ${order.orderNumber} has been confirmed!`,
          link: `/dashboard/orders`,
          meta: { orderId: order._id },
        });
      }
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
