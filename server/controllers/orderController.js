const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
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

// @desc    Create Razorpay Order
// @route   POST /api/orders/create-razorpay-order (and /create-checkout-session)
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const {
      designId, productId, quantity, material, printArea,
      size, color, deliveryMethod, shippingAddress, couponCode,
      termsAccepted,
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the custom on-demand manufacturing and all-sales-final terms to proceed.',
      });
    }

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

    // Create pending order record in MongoDB
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
        materialModifier: pricing.materialPrice,    // stores addOn amount
        printAreaModifier: pricing.designCharge,    // stores design charge
        aiComplexityFee: 0,
        subtotal: pricing.itemsTotal,
        tax: 0,
        shipping: pricing.deliveryCharge,
        total: pricing.total,
        couponCode: pricing.couponCode,
        couponDiscount: pricing.couponDiscount,
      },
      shippingAddress,
      termsAccepted: true,
      termsAcceptedAt: new Date(),
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
        orderNumber: order.orderNumber,
      });
    }

    // Initialize Razorpay Order (INR — amount in paise)
    const razorpay = getRazorpayInstance();
    const razorpayAmount = Math.round(pricing.total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayAmount,
      currency: 'INR',
      receipt: order.orderNumber || `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id.toString(),
        orderNumber: order.orderNumber || '',
        isCustomItem: 'true',
        policy: 'All Sales Final - Custom Manufactured On-Demand',
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      productName: `${design.title} — ${product.name}`,
      productDescription: `${pricing.materialLabel} | ${pricing.printAreaLabel} | Qty: ${quantity}`,
      user: {
        name: req.user.name || shippingAddress?.fullName,
        email: req.user.email,
        phone: shippingAddress?.phone || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Aliased for backward compatibility
exports.createCheckoutSession = exports.createRazorpayOrder;

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

// @desc    Verify Razorpay payment signature & confirm order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification fields.',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Verify HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Razorpay signature mismatch for order:', order.orderNumber);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Signature mismatch.',
      });
    }

    // Update order status if not already paid
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = 'paid';
      order.razorpayOrderId = razorpay_order_id;
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      await order.save();

      // Increment design purchase count
      await Design.findByIdAndUpdate(order.design, { $inc: { purchaseCount: 1 } });

      // In-app notification
      await Notification.create({
        recipient: req.user.id,
        type: 'order_placed',
        message: `Your order ${order.orderNumber} has been verified and confirmed! 🎉`,
        link: `/dashboard/orders`,
        meta: { orderId: order._id },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm payment fallback
// @route   POST /api/orders/:id/confirm-payment
// @access  Private
exports.confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
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

    // Fetch last 5 processed refunds
    const recentRefunds = await Refund.find({ status: 'processed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name avatar');

    const recentRewards = recentRefunds.map(r => ({
      user: r.user ? r.user.name : 'Creator',
      avatar: r.user ? r.user.avatar : '',
      amount: `₹${r.amount}`,
      time: r.createdAt
    }));

    // Fetch comments to show as testimonials
    const Comment = require('../models/Comment');
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('user', 'name avatar');

    const testimonials = comments.map(c => ({
      name: c.user ? c.user.name : 'Creator',
      handle: `@${c.user ? c.user.name.replace(/\s+/g, '').toLowerCase() : 'creator'}`,
      text: c.text,
      rating: 5
    }));

    // Fetch top featured post for the status card
    const Post = require('../models/Post');
    const featuredPost = await Post.findOne({ isFeatured: true })
      .sort({ likesCount: -1 })
      .populate('design', 'title')
      .populate('order', 'pricing');

    let featuredReward = null;
    if (featuredPost) {
      featuredReward = {
        title: featuredPost.design ? featuredPost.design.title : 'Custom Hoodie Design',
        likes: featuredPost.likesCount || 0,
        requiredLikes: 750,
        buyers: 3,
        requiredBuyers: 2,
        amount: featuredPost.order && featuredPost.order.pricing ? `₹${featuredPost.order.pricing.total}` : '₹4,250'
      };
    }

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDesigns,
        totalOrders,
        totalRewards,
        recentRewards,
        testimonials,
        featuredReward
      }
    });
  } catch (error) {
    next(error);
  }
};
