const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Design = require('../models/Design');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Refund = require('../models/Refund');
const { calculatePrice } = require('../utils/priceCalculator');

// @desc    Calculate price (transparent pricing engine — no AI)
// @route   POST /api/orders/calculate-price
// @access  Public (optional auth)
exports.calculateOrderPrice = async (req, res, next) => {
  try {
    const {
      category, subcategory, material, printArea,
      quantity, deliveryMethod, designId, productId,
      couponCode,
    } = req.body;

    // Optionally fetch product for any price overrides
    let customBasePrice = null;
    let customDesignCharge = null;
    let customDeliveryCharge = null;

    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        customBasePrice = product.basePrice || null;
        customDesignCharge = product.designCharge !== undefined ? product.designCharge : null;
        customDeliveryCharge = product.deliveryCharge !== undefined ? product.deliveryCharge : null;
      }
    }

    const pricing = calculatePrice({
      category,
      subcategory,
      material,
      printArea,
      quantity: parseInt(quantity) || 1,
      deliveryMethod: deliveryMethod || 'standard',
      customBasePrice,
      customDesignCharge,
      customDeliveryCharge,
      couponCode,
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
      designId, productId, quantity, material, printArea,
      size, color, deliveryMethod, shippingAddress, couponCode,
    } = req.body;

    const design = await Design.findById(designId);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const pricing = calculatePrice({
      category: design.category,
      subcategory: product.subcategory,
      material: material || product.defaultMaterial || 'standard',
      printArea: printArea || 'front',
      quantity: parseInt(quantity) || 1,
      deliveryMethod: deliveryMethod || 'standard',
      customBasePrice: product.basePrice || null,
      customDesignCharge: product.designCharge !== undefined ? product.designCharge : null,
      customDeliveryCharge: product.deliveryCharge !== undefined ? product.deliveryCharge : null,
      couponCode,
    });

    // Create pending order record
    const order = await Order.create({
      user: req.user.id,
      design: designId,
      product: productId,
      quantity: parseInt(quantity) || 1,
      selectedMaterial: material,
      selectedPrintArea: printArea,
      selectedSize: size,
      selectedColor: color,
      pricing: {
        basePrice: pricing.basePrice,
        originalBasePrice: pricing.basePrice,
        materialModifier: pricing.materialPrice,    // repurposed field: stores addOn amount
        printAreaModifier: pricing.designCharge,    // repurposed field: stores design charge
        aiComplexityFee: 0,                         // no longer used — always 0
        subtotal: pricing.itemsTotal,
        tax: 0,
        shipping: pricing.deliveryCharge,
        total: pricing.total,
        couponCode: pricing.couponCode,
        couponDiscount: pricing.couponDiscount,
      },
      shippingAddress,
      designSnapshot: design.thumbnail?.url,
    });

    // Check if order is completely free (total is 0)
    if (pricing.total === 0) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'paid';
      await order.save();

      // Increment design purchase count
      await Design.findByIdAndUpdate(order.design, { $inc: { purchaseCount: 1 } });

      // In-app notification
      await Notification.create({
        recipient: req.user.id,
        type: 'order_placed',
        message: `Your order ${order.orderNumber} has been confirmed! 🎉`,
        link: `/dashboard/orders`,
        meta: { orderId: order._id },
      });

      return res.status(200).json({
        success: true,
        isFree: true,
        orderId: order._id,
        successUrl: `${process.env.CLIENT_URL}/dashboard/orders?success=true&orderId=${order._id}`,
      });
    }

    // Create Stripe checkout session (INR)
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
            currency: 'inr',
            product_data: {
              name: `${design.title} — ${product.name}`,
              description: [
                `Material: ${pricing.materialLabel}`,
                `Print Area: ${pricing.printAreaLabel}`,
                `Qty: ${quantity}`,
                `Delivery: ${pricing.deliveryLabel}`,
              ].join(' | '),
              images: design.thumbnail?.url ? [design.thumbnail.url] : [],
            },
            // Stripe uses smallest currency unit — paise for INR
            unit_amount: Math.round(pricing.total * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard/orders?success=true&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.status(200).json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order._id,
    });
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
        .populate('product', 'name subcategory emoji')
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

        // In-app notification
        await Notification.create({
          recipient: req.user.id,
          type: 'order_placed',
          message: `Your order ${order.orderNumber} has been confirmed! 🎉`,
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

// @desc    Get public statistics
// @route   GET /api/orders/public-stats
// @access  Public
exports.getPublicStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDesigns = await Design.countDocuments();
    const totalOrders = await Order.countDocuments({ isPaid: true });

    // Sum of processed/approved refunds
    const refunds = await Refund.find({ status: { $in: ['approved', 'processed'] } });
    const totalRewards = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDesigns,
        totalOrders,
        totalRewards,
      }
    });
  } catch (error) {
    next(error);
  }
};
