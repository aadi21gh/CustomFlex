const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedMaterial: String,
    selectedPrintArea: String,
    selectedSize: String,
    selectedColor: String,
    pricing: {
      basePrice: Number,
      originalBasePrice: Number,
      materialModifier: Number,
      printAreaModifier: Number,
      aiComplexityFee: Number,
      subtotal: Number,
      tax: Number,
      shipping: Number,
      total: Number,
      aiAnalysis: mongoose.Schema.Types.Mixed,
    },
    shippingAddress: {
      fullName: String,
      address: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
      phone: String,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_eligible', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    trackingNumber: String,
    refundEligible: { type: Boolean, default: false },
    refundEligibleAt: Date,
    notes: String,
    // Snapshot of design thumbnail at time of order
    designSnapshot: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CFX-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ design: 1 });

module.exports = mongoose.model('Order', orderSchema);
