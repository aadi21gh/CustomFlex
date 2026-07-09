const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'follow',
        'order_placed',
        'order_shipped',
        'order_delivered',
        'refund_eligible',
        'refund_approved',
        'refund_rejected',
        'design_purchased',
        'system',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: String, // frontend route to navigate to
    isRead: { type: Boolean, default: false },
    meta: mongoose.Schema.Types.Mixed, // extra data (postId, orderId, etc.)
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
