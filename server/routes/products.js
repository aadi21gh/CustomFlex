const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, getPricingOptions, createProduct, updateProduct, deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', getProducts);
router.get('/pricing-options', getPricingOptions);
router.post('/', protect, adminOnly, createProduct);
router.get('/:id', getProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
