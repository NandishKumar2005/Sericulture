const mongoose = require('mongoose');

const plantationSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  plotName: {
    type: String,
    required: true,
    trim: true
  },
  mulberryVariety: {
    type: String,
    default: 'V1'
  },
  area: {
    type: Number,
    required: true
  },
  plantationAge: {
    type: Number,
    default: 1
  },
  plantingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plantation', plantationSchema);
