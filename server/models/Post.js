const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Design',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
      },
    ],
    caption: {
      type: String,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    tags: [{ type: String, lowercase: true }],
    category: {
      type: String,
      enum: ['artwork', 'clothing', 'accessories'],
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ likesCount: -1 });
postSchema.index({ tags: 1 });

module.exports = mongoose.model('Post', postSchema);
