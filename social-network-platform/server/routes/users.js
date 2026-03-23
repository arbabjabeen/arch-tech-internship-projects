const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const userController = require('../controllers/userController');

// @route   GET api/users/me
router.get('/me', auth, userController.getCurrentUser);

// Wrapper to catch multer errors and return JSON
const uploadProfilePicMw = (req, res, next) => {
  upload.single('profilePicture')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// @route   PUT api/users/profile (Bio and Privacy only)
router.put('/profile', auth, userController.updateProfile);

// @route   POST api/users/profile-pic
router.post('/profile-pic', auth, uploadProfilePicMw, userController.uploadProfilePic);

// @route   GET api/users/search
router.get('/search', auth, userController.searchUsers);

// @route   GET api/users/:id
router.get('/:id', auth, userController.getUserProfile);

// @route   POST api/users/friend-request/:id
router.post('/friend-request/:id', auth, userController.sendFriendRequest);

// @route   POST api/users/accept-friend/:id
router.post('/accept-friend/:id', auth, userController.acceptFriendRequest);

module.exports = router;
