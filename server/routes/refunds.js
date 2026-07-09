const express = require('express');
const router = express.Router();
const { getMyRefunds, getRefund } = require('../controllers/refundController');
const { protect } = require('../middleware/auth');

router.get('/my-refunds', protect, getMyRefunds);
router.get('/:id', protect, getRefund);

module.exports = router;
