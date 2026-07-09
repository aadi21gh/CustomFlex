const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['artwork', 'clothing', 'accessories'],
    },
    subcategory: {
      type: String,
      // e.g., 't-shirt', 'hoodie', 'canvas-print', 'phone-case', etc.
    },
    description: { type: String },
    materials: [
      {
        name: { type: String, required: true },
        priceModifier: { type: Number, default: 1.0 },
      },
    ],
    printAreas: [
      {
        name: { type: String, required: true }, // e.g., 'front', 'back', 'left-sleeve'
        priceModifier: { type: Number, default: 1.0 },
        maxWidth: Number,
        maxHeight: Number,
      },
    ],
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    images: [
      {
        url: String,
        publicId: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    mockupTemplate: {
      url: String,
      overlayX: Number,
      overlayY: Number,
      overlayWidth: Number,
      overlayHeight: Number,
    },
    stock: { type: Number, default: 9999 },
    isActive: { type: Boolean, default: true },
    sizes: [String],
    colors: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
