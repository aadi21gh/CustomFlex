const User = require('../models/User');
const Design = require('../models/Design');
const Order = require('../models/Order');
const Post = require('../models/Post');
const Refund = require('../models/Refund');
const RewardConfig = require('../models/RewardConfig');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Notification = require('../models/Notification');
const { checkRefundEligibility } = require('../utils/refundChecker');

/* ══════════════════════════════════════════════════════════════════════════════
   STATISTICS
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getStats = async (req, res, next) => {
  try {
    const [userCount, designCount, orderCount, postCount, pendingRefunds, rewardConfig] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Design.countDocuments(),
      Order.countDocuments(),
      Post.countDocuments(),
      Refund.countDocuments({ status: 'pending' }),
      RewardConfig.getSingleton(),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Reward stats
    const rewardResult = await Refund.aggregate([
      { $match: { status: { $in: ['processed', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    const totalRewardsPaid = rewardResult[0]?.total || 0;
    const totalRewardsCount = rewardResult[0]?.count || 0;

    // Orders over last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyOrders = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, isPaid: true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Category breakdown
    const categoryBreakdown = await Order.aggregate([
      { $match: { isPaid: true } },
      { $lookup: { from: 'designs', localField: 'design', foreignField: '_id', as: 'design' } },
      { $unwind: '$design' },
      { $group: { _id: '$design.category', count: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        userCount,
        designCount,
        orderCount,
        postCount,
        pendingRefunds,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalRewardsPaid: parseFloat(totalRewardsPaid.toFixed(2)),
        totalRewardsCount,
        currency: 'INR',
      },
      rewardConfig,
      dailyOrders,
      categoryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════════════════════════════
   REWARD CONFIG
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get current reward config
// @route   GET /api/admin/reward-config
// @access  Admin
exports.getRewardConfig = async (req, res, next) => {
  try {
    const config = await RewardConfig.getSingleton();
    res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reward config
// @route   PUT /api/admin/reward-config
// @access  Admin
exports.updateRewardConfig = async (req, res, next) => {
  try {
    const {
      likesMode,
      fixedLikesThreshold,
      minUniquePurchasers,
      rewardPercentage,
      cronSchedule,
      sendEligibleEmail,
      sendApprovedEmail,
      description,
    } = req.body;

    const config = await RewardConfig.getSingleton();

    if (likesMode !== undefined)            config.likesMode = likesMode;
    if (fixedLikesThreshold !== undefined)  config.fixedLikesThreshold = fixedLikesThreshold;
    if (minUniquePurchasers !== undefined)  config.minUniquePurchasers = minUniquePurchasers;
    if (rewardPercentage !== undefined)     config.rewardPercentage = rewardPercentage;
    if (cronSchedule !== undefined)         config.cronSchedule = cronSchedule;
    if (sendEligibleEmail !== undefined)    config.sendEligibleEmail = sendEligibleEmail;
    if (sendApprovedEmail !== undefined)    config.sendApprovedEmail = sendApprovedEmail;
    if (description !== undefined)          config.description = description;
    config.lastModifiedBy = req.user.id;

    await config.save();
    res.status(200).json({ success: true, config, message: 'Reward configuration updated.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually trigger reward eligibility check
// @route   POST /api/admin/reward-config/run-check
// @access  Admin
exports.triggerRewardCheck = async (req, res, next) => {
  try {
    const eligibleCount = await checkRefundEligibility();
    res.status(200).json({
      success: true,
      message: `Reward check complete. ${eligibleCount} new eligible order(s) found.`,
      eligibleCount,
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════════════════════════════
   USERS
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, role } = req.query;

    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (role) query.role = role;

    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Admin
exports.toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot deactivate admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════════════════════════════
   ORDERS
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Admin
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email avatar')
        .populate('design', 'title category thumbnail')
        .populate('product', 'name emoji')
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();

    const messages = {
      shipped: `Your order ${order.orderNumber} has been shipped! 🚚 Tracking: ${trackingNumber || 'N/A'}`,
      delivered: `Your order ${order.orderNumber} has been delivered! 🎉`,
      cancelled: `Your order ${order.orderNumber} has been cancelled.`,
    };

    if (messages[status]) {
      await Notification.create({
        recipient: order.user._id,
        type: `order_${status}`,
        message: messages[status],
        link: '/dashboard/orders',
        meta: { orderId: order._id },
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════════════════════════════
   REWARDS (Refunds)
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get all reward requests (admin)
// @route   GET /api/admin/refunds
// @access  Admin
exports.getRefunds = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate('user', 'name email avatar')
        .populate('order', 'orderNumber pricing status')
        .populate('post', 'images caption likesCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Refund.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      refunds,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process reward (approve or reject)
// @route   PUT /api/admin/refunds/:id/process
// @access  Admin
exports.processRefund = async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const refund = await Refund.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email');

    if (!refund) return res.status(404).json({ success: false, message: 'Reward request not found' });

    refund.status = status === 'approved' ? 'approved' : 'rejected';
    refund.adminNote = adminNote;
    refund.reviewedBy = req.user.id;
    refund.reviewedAt = new Date();

    if (status === 'approved' && refund.order?.stripePaymentIntentId) {
      try {
        // Issue Stripe refund (INR — amount in paise)
        const stripeRefund = await stripe.refunds.create({
          payment_intent: refund.order.stripePaymentIntentId,
          amount: Math.round(refund.amount * 100), // paise
        });
        refund.stripeRefundId = stripeRefund.id;
        refund.status = 'processed';
        refund.processedAt = new Date();

        // Update order status
        await Order.findByIdAndUpdate(refund.order._id, { status: 'refunded' });
      } catch (stripeError) {
        console.error('Stripe reward error:', stripeError.message);
        // Keep as 'approved' if Stripe fails — admin can retry
        refund.status = 'approved';
      }
    }

    await refund.save();

    // Notify user (INR currency)
    await Notification.create({
      recipient: refund.user._id,
      type: status === 'approved' ? 'refund_approved' : 'refund_rejected',
      message: status === 'approved'
        ? `🎉 Your reward of ₹${refund.amount.toFixed(0)} has been approved and processed!`
        : `Your reward request has been reviewed. Note: ${adminNote || 'Please contact support.'}`,
      link: '/dashboard/refunds',
      meta: { refundId: refund._id },
    });

    res.status(200).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};

/* ══════════════════════════════════════════════════════════════════════════════
   POSTS
══════════════════════════════════════════════════════════════════════════════ */

// @desc    Get all posts (admin)
// @route   GET /api/admin/posts
// @access  Admin
exports.getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find()
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle post featured
// @route   PUT /api/admin/posts/:id/feature
// @access  Admin
exports.toggleFeaturePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.isFeatured = !post.isFeatured;
    await post.save();
    res.status(200).json({ success: true, isFeatured: post.isFeatured });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all designs (admin)
// @route   GET /api/admin/designs
// @access  Admin
exports.getDesigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [designs, total] = await Promise.all([
      Design.find()
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Design.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      designs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
