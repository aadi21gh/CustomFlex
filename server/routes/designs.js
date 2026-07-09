const express = require('express');
const router = express.Router();
const {
  createDesign, updateDesign, updateThumbnail, getDesign, getMyDesigns,
  getPublicDesigns, deleteDesign, duplicateDesign,
} = require('../controllers/designController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

router.get('/my-designs', protect, getMyDesigns);
router.get('/public', getPublicDesigns);
router.post('/', protect, createDesign);
router.put('/:id', protect, updateDesign);
router.put('/:id/thumbnail', protect, uploadThumbnail.single('thumbnail'), updateThumbnail);
router.post('/:id/duplicate', protect, duplicateDesign);
router.get('/:id', optionalAuth, getDesign);
router.delete('/:id', protect, deleteDesign);

module.exports = router;
