const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'processed'],
      default: 'pending',
    },
    eligibilityReason: {
      likesCount: Number,
      requiredLikes: Number,
      uniquePurchasers: Number,
      requiredPurchasers: Number,
    },
    adminNote: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    stripeRefundId: String,
    processedAt: Date,
  },
  { timestamps: true }
);

refundSchema.index({ user: 1, status: 1 });
refundSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Refund', refundSchema);
