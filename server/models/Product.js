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
      // e.g. 't-shirt', 'hoodie', 'canvas-print', 'phone-case', 'sneakers', etc.
    },
    description: { type: String },

    /* ── Pricing (all INR) ─────────────────────────────────────────────── */
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0,
    },
    // Optional overrides: if set, these take priority over the priceCalculator defaults
    designCharge: {
      type: Number,
      default: null, // null = use priceCalculator's DESIGN_CHARGES lookup
    },
    deliveryCharge: {
      type: Number,
      default: null, // null = use priceCalculator's DELIVERY_OPTIONS
    },

    /* ── Material options ─────────────────────────────────────────────── */
    // Supported material IDs for this product (subset of MATERIAL_OPTIONS keys)
    supportedMaterials: {
      type: [String],
      default: [],
      // e.g. ['cotton', 'premium-cotton', 'organic-cotton', 'dry-fit']
    },
    defaultMaterial: {
      type: String,
      default: null, // null = use priceCalculator's DEFAULT_MATERIAL
    },

    /* ── Print / design areas ─────────────────────────────────────────── */
    printAreas: [
      {
        name: { type: String, required: true }, // e.g. 'front', 'back', 'full'
        priceModifier: { type: Number, default: 1.0 }, // legacy — kept for compat
        maxWidth: Number,
        maxHeight: Number,
      },
    ],

    /* ── Size & color options ─────────────────────────────────────────── */
    sizes: [String],   // e.g. ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    colors: [String],  // e.g. ['White', 'Black', 'Navy']

    /* ── Media ────────────────────────────────────────────────────────── */
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

    /* ── Meta ─────────────────────────────────────────────────────────── */
    stock: { type: Number, default: 9999 },
    isActive: { type: Boolean, default: true },
    tags: [String], // for search/filter
    emoji: { type: String, default: '🎁' }, // display emoji in UI
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for fast queries
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model('Product', productSchema);
