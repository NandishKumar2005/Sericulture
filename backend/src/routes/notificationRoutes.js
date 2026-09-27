const express = require('express');
const router = express.Router();
const { getNotifications, createNotification, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.get('/', getNotifications);
router.post('/', protect, createNotification);
router.post('/read-all', markAsRead);

module.exports = router;
