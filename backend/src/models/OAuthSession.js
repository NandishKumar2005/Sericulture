const mongoose = require('mongoose');

const OAuthSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  token:     { type: String },
  user:      { type: Object },
  error:     { type: String },
  ready:     { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // auto-delete after 5 min
});

module.exports = mongoose.model('OAuthSession', OAuthSessionSchema);
