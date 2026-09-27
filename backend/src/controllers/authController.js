const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// @desc Register farmer
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;

    if (!name || (!email && !phone) || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone/email, and password' });
    }

    const primaryPhone = phone ? phone.trim() : '';
    const primaryEmail = email ? email.trim().toLowerCase() : `${primaryPhone.replace(/[^0-9a-zA-Z]/g, '') || Date.now()}@sericulture.org`;

    const existingUser = await User.findOne({
      $or: [
        { email: primaryEmail },
        ...(primaryPhone ? [{ phone: primaryPhone }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: primaryEmail,
      phone: primaryPhone || primaryEmail,
      passwordHash,
      location: location || ''
    });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Login farmer
// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const identifier = (email || phone || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide phone/email and password' });
    }

    const conditions = [];
    if (identifier) {
      conditions.push({ email: identifier });
      conditions.push({ phone: identifier });
    }
    if (req.body.phone && typeof req.body.phone === 'string') {
      conditions.push({ phone: req.body.phone.trim() });
    }
    if (req.body.email && typeof req.body.email === 'string') {
      conditions.push({ email: req.body.email.trim().toLowerCase() });
    }

    const user = await User.findOne({ $or: conditions });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update Profile details
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { name, phone, location } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (location !== undefined) user.location = location;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
