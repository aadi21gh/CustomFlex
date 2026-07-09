const express = require('express');
const router = express.Router();
const { uploadStudio } = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');

// @desc    Upload image to studio (for canvas use)
// @route   POST /api/upload/studio
// @access  Private
router.post('/studio', protect, uploadStudio.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(200).json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
  });
});

// @desc    Upload base64 image (canvas export for thumbnail)
// @route   POST /api/upload/base64
// @access  Private
router.post('/base64', protect, async (req, res, next) => {
  try {
    const { dataUrl, folder = 'customflex/studio' } = req.body;
    if (!dataUrl) return res.status(400).json({ success: false, message: 'No data URL provided' });

    const result = await cloudinary.uploader.upload(dataUrl, {
      folder,
      transformation: [{ quality: 'auto' }],
    });

    res.status(200).json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate AI image via Stability AI
// @route   POST /api/upload/ai-generate
// @access  Private
router.post('/ai-generate', protect, async (req, res, next) => {
  try {
    const { prompt, width = 512, height = 512, steps = 30 } = req.body;

    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });
    if (!process.env.STABILITY_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI image generation is not configured. Please add STABILITY_API_KEY to your .env file.' });
    }

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: Math.min(height, 1024),
        width: Math.min(width, 1024),
        steps: Math.min(steps, 50),
        samples: 1,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ success: false, message: error.message || 'AI generation failed' });
    }

    const data = await response.json();
    const base64Image = data.artifacts[0]?.base64;

    if (!base64Image) {
      return res.status(500).json({ success: false, message: 'No image generated' });
    }

    // Upload to Cloudinary
    const dataUrl = `data:image/png;base64,${base64Image}`;
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'customflex/ai-generated',
      transformation: [{ quality: 'auto' }],
    });

    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
