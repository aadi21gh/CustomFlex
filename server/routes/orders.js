const express = require('express');
const router = express.Router();
const {
  calculateOrderPrice,
  createRazorpayOrder,
  createCheckoutSession,
  verifyRazorpayPayment,
  getMyOrders,
  getOrder,
  confirmPayment,
  getPublicStats,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/calculate-price', optionalAuth, calculateOrderPrice);
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyRazorpayPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/public-stats', getPublicStats);
router.post('/:id/confirm-payment', protect, confirmPayment);
router.get('/:id', protect, getOrder);

module.exports = router;
