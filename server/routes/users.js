const express = require('express');
const router = express.Router();
const {
  getUserProfile, updateProfile, updateAvatar, changePassword,
  toggleFollow, toggleWishlist, getWishlist, getNotifications,
  markNotificationsRead, getDashboardStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.put('/profile', protect, updateProfile);
router.put('/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);
router.put('/change-password', protect, changePassword);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:designId', protect, toggleWishlist);
router.post('/:id/follow', protect, toggleFollow);
router.get('/:id', getUserProfile);

module.exports = router;
