const mongoose = require('mongoose');

const designSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Design title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['artwork', 'clothing', 'accessories'],
    },
    canvasData: {
      type: mongoose.Schema.Types.Mixed, // Fabric.js JSON object
      required: [true, 'Canvas data is required'],
    },
    thumbnail: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublic: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
    tags: [{ type: String, lowercase: true }],
    aiElementsUsed: { type: Boolean, default: false },
    aiComplexityScore: { type: Number, default: 0, min: 0, max: 10 },
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
    version: { type: Number, default: 1 },
    purchaseCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

designSchema.index({ user: 1, createdAt: -1 });
designSchema.index({ category: 1, isPublic: 1 });
designSchema.index({ tags: 1 });

module.exports = mongoose.model('Design', designSchema);
