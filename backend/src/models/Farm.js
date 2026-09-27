const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  farmName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: ""
  },
  area: {
    type: Number,
    required: true
  },
  mulberryVariety: {
    type: String,
    default: 'V1'
  },
  plantationAge: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Farm', farmSchema);
