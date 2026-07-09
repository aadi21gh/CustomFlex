const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

// @desc    Create post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { caption, tags, category, orderId, designId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required' });
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const post = await Post.create({
      user: req.user.id,
      order: orderId || null,
      design: designId || null,
      images,
      caption,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      category,
    });

    await post.populate('user', 'name avatar');

    res.status(201).json({ success: true, message: 'Post created', post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get explore feed
// @route   GET /api/posts
// @access  Public
exports.getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, sort = 'newest', tags, search } = req.query;

    const query = { isPublic: true };
    if (category && category !== 'all') query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) query.caption = { $regex: search, $options: 'i' };

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { likesCount: -1 },
      trending: { viewsCount: -1 },
      featured: { isFeatured: -1, createdAt: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('user', 'name avatar')
        .populate('design', 'title category')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    // If user is logged in, add liked/bookmarked status
    let postsWithStatus = posts;
    if (req.user) {
      const likedPosts = await Like.find({ user: req.user.id, post: { $in: posts.map((p) => p._id) } });
      const likedIds = new Set(likedPosts.map((l) => l.post.toString()));

      postsWithStatus = posts.map((p) => ({
        ...p.toObject(),
        isLiked: likedIds.has(p._id.toString()),
        isBookmarked: p.bookmarks.includes(req.user.id),
      }));
    }

    res.status(200).json({
      success: true,
      posts: postsWithStatus,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar bio followers')
      .populate('design', 'title category thumbnail');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Increment view count
    await Post.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    let isLiked = false;
    let isBookmarked = false;
    if (req.user) {
      const like = await Like.findOne({ user: req.user.id, post: post._id });
      isLiked = !!like;
      isBookmarked = post.bookmarks.includes(req.user.id);
    }

    res.status(200).json({ success: true, post: { ...post.toObject(), isLiked, isBookmarked } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existingLike = await Like.findOne({ user: req.user.id, post: req.params.id });

    if (existingLike) {
      await existingLike.deleteOne();
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: -1 } });
      res.status(200).json({ success: true, isLiked: false, message: 'Unliked' });
    } else {
      await Like.create({ user: req.user.id, post: req.params.id });
      await Post.findByIdAndUpdate(req.params.id, { $inc: { likesCount: 1 } });

      // Notify post owner (not self)
      if (post.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.user,
          sender: req.user.id,
          type: 'like',
          message: `${req.user.name} liked your post`,
          link: `/explore/post/${post._id}`,
          meta: { postId: post._id },
        });
      }

      res.status(200).json({ success: true, isLiked: true, message: 'Liked' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark on post
// @route   POST /api/posts/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isBookmarked = post.bookmarks.includes(req.user.id);

    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== req.user.id);
    } else {
      post.bookmarks.push(req.user.id);
    }

    await post.save();
    res.status(200).json({ success: true, isBookmarked: !isBookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    const { text, parentComment } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      user: req.user.id,
      post: req.params.id,
      text,
      parentComment: parentComment || null,
    });

    await comment.populate('user', 'name avatar');
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });

    // Notify post owner
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.user,
        sender: req.user.id,
        type: 'comment',
        message: `${req.user.name} commented on your post`,
        link: `/explore/post/${post._id}`,
        meta: { postId: post._id, commentId: comment._id },
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post comments
// @route   GET /api/posts/:id/comments
// @access  Public
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.id, parentComment: null })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ post: req.params.id, parentComment: null }),
    ]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('user', 'name avatar')
          .sort({ createdAt: 1 });
        return { ...comment.toObject(), replies };
      })
    );

    res.status(200).json({
      success: true,
      comments: commentsWithReplies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Public
exports.getUserPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: req.params.userId, isPublic: true })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ user: req.params.userId, isPublic: true }),
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

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete images from Cloudinary
    for (const image of post.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await Like.deleteMany({ post: post._id });
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Increment share count
// @route   POST /api/posts/:id/share
// @access  Public
exports.incrementShare = async (req, res, next) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
