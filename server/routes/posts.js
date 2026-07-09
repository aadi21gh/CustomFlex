const express = require('express');
const router = express.Router();
const {
  createPost, getFeed, getPost, toggleLike, toggleBookmark,
  addComment, getComments, deleteComment, getUserPosts, deletePost, incrementShare,
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadPost } = require('../middleware/upload');

router.get('/', optionalAuth, getFeed);
router.post('/', protect, uploadPost.array('images', 5), createPost);
router.get('/user/:userId', getUserPosts);
router.delete('/comments/:commentId', protect, deleteComment);
router.get('/:id', optionalAuth, getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);
router.post('/:id/share', incrementShare);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
