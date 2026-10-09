const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// @desc Register farmer
// @route POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, location, farmName, acreage, mulberryVariety, silkwormBreed } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, phone number, email ID, and password' });
    }

    const primaryPhone = phone.trim();
    const primaryEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: primaryEmail },
        { phone: primaryPhone }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this phone number or email ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: primaryEmail,
      phone: primaryPhone,
      passwordHash,
      location: location || '',
      farmName: farmName || '',
      acreage: acreage || '',
      mulberryVariety: mulberryVariety || '',
      silkwormBreed: silkwormBreed || ''
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
        location: user.location,
        farmName: user.farmName,
        acreage: user.acreage,
        mulberryVariety: user.mulberryVariety,
        silkwormBreed: user.silkwormBreed
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
      return res.status(400).json({ success: false, message: 'Please provide phone number/email ID and password' });
    }

    const conditions = [];
    if (identifier) {
      conditions.push({ email: identifier });
      conditions.push({ phone: identifier });
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
        location: user.location,
        farmName: user.farmName || '',
        acreage: user.acreage || '',
        mulberryVariety: user.mulberryVariety || '',
        silkwormBreed: user.silkwormBreed || ''
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
    const { name, phone, email, location, farmName, acreage, mulberryVariety, silkwormBreed } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (location !== undefined) user.location = location;
    if (farmName !== undefined) user.farmName = farmName;
    if (acreage !== undefined) user.acreage = acreage;
    if (mulberryVariety !== undefined) user.mulberryVariety = mulberryVariety;
    if (silkwormBreed !== undefined) user.silkwormBreed = silkwormBreed;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        farmName: user.farmName,
        acreage: user.acreage,
        mulberryVariety: user.mulberryVariety,
        silkwormBreed: user.silkwormBreed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

