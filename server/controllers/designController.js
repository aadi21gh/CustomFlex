const Design = require('../models/Design');
const cloudinary = require('../config/cloudinary');

// @desc    Create new design
// @route   POST /api/designs
// @access  Private
exports.createDesign = async (req, res, next) => {
  try {
    const { title, category, canvasData, tags, width, height, isDraft, isPublic } = req.body;

    if (!title || !category || !canvasData) {
      return res.status(400).json({ success: false, message: 'Title, category and canvas data are required' });
    }

    const design = await Design.create({
      title,
      category,
      canvasData: typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData,
      tags: tags || [],
      width: width || 800,
      height: height || 600,
      isDraft: isDraft !== undefined ? isDraft : true,
      isPublic: isPublic || false,
      user: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Design saved', design });
  } catch (error) {
    next(error);
  }
};

// @desc    Update design
// @route   PUT /api/designs/:id
// @access  Private
exports.updateDesign = async (req, res, next) => {
  try {
    let design = await Design.findById(req.params.id);

    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    if (design.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this design' });
    }

    const { title, canvasData, tags, isDraft, isPublic, aiElementsUsed, aiComplexityScore } = req.body;

    if (title) design.title = title;
    if (canvasData) design.canvasData = typeof canvasData === 'string' ? JSON.parse(canvasData) : canvasData;
    if (tags) design.tags = tags;
    if (isDraft !== undefined) design.isDraft = isDraft;
    if (isPublic !== undefined) design.isPublic = isPublic;
    if (aiElementsUsed !== undefined) design.aiElementsUsed = aiElementsUsed;
    if (aiComplexityScore !== undefined) design.aiComplexityScore = aiComplexityScore;
    design.version += 1;

    await design.save();

    res.status(200).json({ success: true, message: 'Design updated', design });
  } catch (error) {
    next(error);
  }
};

// @desc    Update design thumbnail
// @route   PUT /api/designs/:id/thumbnail
// @access  Private
exports.updateThumbnail = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    if (design.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If uploading via file
    if (req.file) {
      // Delete old thumbnail
      if (design.thumbnail?.publicId) {
        await cloudinary.uploader.destroy(design.thumbnail.publicId);
      }
      design.thumbnail = { url: req.file.path, publicId: req.file.filename };
    }
    // If sending base64 data URL
    else if (req.body.thumbnailDataUrl) {
      if (design.thumbnail?.publicId) {
        await cloudinary.uploader.destroy(design.thumbnail.publicId);
      }
      const result = await cloudinary.uploader.upload(req.body.thumbnailDataUrl, {
        folder: 'customflex/thumbnails',
        transformation: [{ width: 800, height: 600, crop: 'fit', quality: 'auto' }],
      });
      design.thumbnail = { url: result.secure_url, publicId: result.public_id };
    }

    await design.save();
    res.status(200).json({ success: true, thumbnail: design.thumbnail });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single design
// @route   GET /api/designs/:id
// @access  Public/Private
exports.getDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id).populate('user', 'name avatar');

    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });

    // Check if private design belongs to user
    if (!design.isPublic && (!req.user || design.user._id.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'This design is private' });
    }

    res.status(200).json({ success: true, design });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's designs
// @route   GET /api/designs/my-designs
// @access  Private
exports.getMyDesigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, isDraft, search } = req.query;

    const query = { user: req.user.id };
    if (category) query.category = category;
    if (isDraft !== undefined) query.isDraft = isDraft === 'true';
    if (search) query.title = { $regex: search, $options: 'i' };

    const [designs, total] = await Promise.all([
      Design.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Design.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      designs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public designs (explore)
// @route   GET /api/designs/public
// @access  Public
exports.getPublicDesigns = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const { category, tags, sort = 'newest' } = req.query;

    const query = { isPublic: true, isDraft: false };
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };

    const sortOptions = {
      newest: { createdAt: -1 },
      popular: { purchaseCount: -1 },
      oldest: { createdAt: 1 },
    };

    const [designs, total] = await Promise.all([
      Design.find(query)
        .populate('user', 'name avatar')
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(limit),
      Design.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      designs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete design
// @route   DELETE /api/designs/:id
// @access  Private
exports.deleteDesign = async (req, res, next) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) return res.status(404).json({ success: false, message: 'Design not found' });
    if (design.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete thumbnail from Cloudinary
    if (design.thumbnail?.publicId) {
      await cloudinary.uploader.destroy(design.thumbnail.publicId);
    }

    await design.deleteOne();
    res.status(200).json({ success: true, message: 'Design deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate design
// @route   POST /api/designs/:id/duplicate
// @access  Private
exports.duplicateDesign = async (req, res, next) => {
  try {
    const original = await Design.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Design not found' });
    if (!original.isPublic && original.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const duplicate = await Design.create({
      title: `${original.title} (Copy)`,
      category: original.category,
      canvasData: original.canvasData,
      tags: original.tags,
      width: original.width,
      height: original.height,
      user: req.user.id,
      isDraft: true,
      isPublic: false,
    });

    res.status(201).json({ success: true, message: 'Design duplicated', design: duplicate });
  } catch (error) {
    next(error);
  }
};
