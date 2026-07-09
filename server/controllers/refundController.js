const Refund = require('../models/Refund');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc    Get my refund requests
// @route   GET /api/refunds/my-refunds
// @access  Private
exports.getMyRefunds = async (req, res, next) => {
  try {
    const refunds = await Refund.find({ user: req.user.id })
      .populate('order', 'orderNumber pricing status')
      .populate('post', 'images caption likesCount')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, refunds });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single refund
// @route   GET /api/refunds/:id
// @access  Private
exports.getRefund = async (req, res, next) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('order', 'orderNumber pricing status')
      .populate('post', 'images caption likesCount')
      .populate('user', 'name email avatar')
      .populate('reviewedBy', 'name');

    if (!refund) return res.status(404).json({ success: false, message: 'Refund not found' });
    if (refund.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, refund });
  } catch (error) {
    next(error);
  }
};
