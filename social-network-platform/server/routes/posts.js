const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const postController = require('../controllers/postController');

// @route   GET api/posts
router.get('/', auth, postController.getPosts);

// @route   GET api/posts/search
router.get('/search', auth, postController.searchPosts);

// @route   POST api/posts (with image upload)
router.post('/', auth, upload.single('image'), postController.createPost);

// @route   POST api/posts/:id/like
router.post('/:id/like', auth, postController.toggleLike);

// @route   POST api/posts/:id/comment
router.post('/:id/comment', auth, postController.addComment);

module.exports = router;
