const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, toggleUserActive, getOrders, updateOrderStatus,
  getRefunds, processRefund, getPosts, toggleFeaturePost,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/refunds', getRefunds);
router.put('/refunds/:id/process', processRefund);
router.get('/posts', getPosts);
router.put('/posts/:id/feature', toggleFeaturePost);

module.exports = router;
