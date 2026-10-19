const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  passwordHash: {
    type: String,
    default: ''
  },
  googleId: {
    type: String,
    default: ''
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: ""
  },
  farmName: {
    type: String,
    default: ""
  },
  acreage: {
    type: String,
    default: ""
  },
  mulberryVariety: {
    type: String,
    default: ""
  },
  silkwormBreed: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

