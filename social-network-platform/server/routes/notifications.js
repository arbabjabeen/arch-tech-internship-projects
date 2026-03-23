const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET api/notifications
router.get('/', auth, notificationController.getNotifications);

// @route   PUT api/notifications/read
router.put('/read', auth, notificationController.markRead);

module.exports = router;
