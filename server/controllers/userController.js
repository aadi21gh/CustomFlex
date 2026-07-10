const User = require('../models/User');
const Design = require('../models/Design');
const Order = require('../models/Order');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const Refund = require('../models/Refund');
const RewardConfig = require('../models/RewardConfig');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -emailVerificationToken');

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const postCount = await Post.countDocuments({ user: user._id, isPublic: true });
    const designCount = await Design.countDocuments({ user: user._id, isPublic: true });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        postCount,
        designCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const user = await User.findById(req.user.id);

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (e) {
        console.error('Failed to delete old avatar:', e.message);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    res.status(200).json({ success: true, message: 'Avatar updated', avatar: user.avatar });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user.password) {
      return res.status(400).json({ success: false, message: 'This account uses Google login' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => id.toString() !== req.params.id);
      userToFollow.followers = userToFollow.followers.filter((id) => id.toString() !== req.user.id);
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);

      // Create notification
      await Notification.create({
        recipient: userToFollow._id,
        sender: req.user.id,
        type: 'follow',
        message: `${currentUser.name} started following you`,
        link: `/profile/${req.user.id}`,
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      success: true,
      isFollowing: !isFollowing,
      message: isFollowing ? 'Unfollowed' : 'Following',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to / remove from wishlist
// @route   POST /api/users/wishlist/:designId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const designId = req.params.designId;

    const isWishlisted = user.wishlist.includes(designId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== designId);
    } else {
      user.wishlist.push(designId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      isWishlisted: !isWishlisted,
      message: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      populate: { path: 'user', select: 'name avatar' },
    });

    res.status(200).json({ success: true, designs: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/users/notifications/read
// @access  Private
exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard-stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orderCount, designCount, postCount, totalSpent, totalEarned, pendingRewards, rewardConfig] = await Promise.all([
      Order.countDocuments({ user: userId }),
      Design.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId }),
      Order.aggregate([
        { $match: { user: req.user._id, isPaid: true } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
      Refund.aggregate([
        { $match: { user: req.user._id, status: { $in: ['approved', 'processed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Refund.aggregate([
        { $match: { user: req.user._id, status: { $in: ['pending', 'under_review'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      RewardConfig.getSingleton()
    ]);

    const spent = totalSpent[0]?.total || 0;
    const earned = totalEarned[0]?.total || 0;
    const pendingAmount = pendingRewards[0]?.total || 0;

    const recentOrders = await Order.find({ user: userId })
      .populate('design', 'title thumbnail category')
      .populate('product', 'name emoji')
      .sort({ createdAt: -1 })
      .limit(5);

    // Dynamic reward eligibility tracker for the user's latest paid, non-eligible order
    let refundProgress = null;
    const latestActiveOrder = await Order.findOne({
      user: userId,
      isPaid: true,
      refundEligible: false,
      status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }
    }).populate('design', 'title');

    if (latestActiveOrder) {
      const post = await Post.findOne({ order: latestActiveOrder._id, isPublic: true });
      if (post) {
        const requiredLikes = rewardConfig.likesMode === 'auto'
          ? Math.ceil(latestActiveOrder.pricing.total)
          : rewardConfig.fixedLikesThreshold;

        const otherPurchasers = await Order.distinct('user', {
          design: latestActiveOrder.design,
          isPaid: true,
          _id: { $ne: latestActiveOrder._id }
        });

        const currentBuyers = otherPurchasers.length + 1; // +1 for self
        const requiredBuyers = rewardConfig.minUniquePurchasers;

        const likesMet = post.likesCount >= requiredLikes;
        const buyersMet = currentBuyers >= requiredBuyers;

        let message = '';
        if (!likesMet && !buyersMet) {
          message = `Need ${requiredLikes - post.likesCount} more likes and ${requiredBuyers - currentBuyers} more purchase(s) of this design.`;
        } else if (!likesMet) {
          message = `Purchasers requirement met! Need ${requiredLikes - post.likesCount} more likes.`;
        } else if (!buyersMet) {
          message = `Likes requirement met! Need ${requiredBuyers - currentBuyers} more purchase(s) by others.`;
        } else {
          message = 'Thresholds met! Eligibility will be processed in the next checker cycle.';
        }

        refundProgress = {
          designTitle: latestActiveOrder.design?.title || 'Custom Design',
          likesCount: post.likesCount,
          likeThreshold: requiredLikes,
          uniquePurchasers: currentBuyers,
          requiredPurchasers: requiredBuyers,
          message
        };
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        orderCount,
        designCount,
        postCount,
        totalSpent: parseFloat(spent.toFixed(2)),
        totalRefunded: parseFloat(earned.toFixed(2)),
        pendingRewards: parseFloat(pendingAmount.toFixed(2))
      },
      recentOrders,
      refundProgress
    });
  } catch (error) {
    next(error);
  }
};
