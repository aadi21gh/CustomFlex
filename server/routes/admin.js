const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, toggleUserActive, getOrders, updateOrderStatus,
  getRefunds, processRefund, getPosts, toggleFeaturePost,
  getRewardConfig, updateRewardConfig, triggerRewardCheck,
  getDesigns,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

/* ── Dashboard ───────────────────────────────────────────────────────────── */
router.get('/stats', getStats);

/* ── Users ───────────────────────────────────────────────────────────────── */
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);

/* ── Orders ──────────────────────────────────────────────────────────────── */
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

/* ── Rewards (Refunds) ───────────────────────────────────────────────────── */
router.get('/refunds', getRefunds);
router.put('/refunds/:id/process', processRefund);

/* ── Reward Configuration ────────────────────────────────────────────────── */
router.get('/reward-config', getRewardConfig);
router.put('/reward-config', updateRewardConfig);
router.post('/reward-config/run-check', triggerRewardCheck);

/* ── Posts ───────────────────────────────────────────────────────────────── */
router.get('/posts', getPosts);
router.put('/posts/:id/feature', toggleFeaturePost);

/* ── Designs ─────────────────────────────────────────────────────────────── */
router.get('/designs', getDesigns);

module.exports = router;
