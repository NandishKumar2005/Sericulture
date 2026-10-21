const express = require('express');
const router = express.Router();
const { register, login, updateProfile } = require('../controllers/authController');
const { googleAuth, googleCallback, googleSessionStore, googleSessionPoll } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/google-callback', googleCallback);
router.post('/google-session', googleSessionStore);
router.get('/google-session/:sessionId', googleSessionPoll);
router.put('/profile', protect, updateProfile);

module.exports = router;
