const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc  Google OAuth Sign-In / Sign-Up
// @route POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential token is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Reject unverified Google emails
    if (!payload.email_verified) {
      return res.status(401).json({ success: false, message: 'Google account email is not verified. Please verify your Google email first.' });
    }

    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // New user via Google — create account (no password needed)
      user = await User.create({
        name,
        email: email.toLowerCase(),
        phone: '',
        passwordHash: '',          // no password for Google users
        googleId,
        location: 'Karnataka, India',
        farmName: '',
      });
    } else if (!user.googleId) {
      // Existing email/phone user — link Google account
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        farmName: user.farmName || '',
        acreage: user.acreage || '',
        mulberryVariety: user.mulberryVariety || '',
        silkwormBreed: user.silkwormBreed || '',
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ success: false, message: 'Google sign-in failed. Invalid or expired token.' });
  }
};
