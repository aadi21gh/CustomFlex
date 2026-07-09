const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for post images
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customflex/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  },
});

// Cloudinary storage for design thumbnails
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customflex/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'fit', quality: 'auto' }],
  },
});

// Cloudinary storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customflex/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// Cloudinary storage for canvas images (uploaded by user in studio)
const studioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'customflex/studio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
    transformation: [{ quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg\+xml/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const uploadPost = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

const uploadThumbnail = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadStudio = multer({
  storage: studioStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadPost, uploadThumbnail, uploadAvatar, uploadStudio };
