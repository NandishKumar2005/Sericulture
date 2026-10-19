const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.put('/profile', protect, updateProfile);

module.exports = router;
