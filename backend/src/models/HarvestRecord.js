const mongoose = require('mongoose');

const harvestRecordSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  plantationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plantation',
    index: true
  },
  harvestDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  leafMaturity: {
    type: Number,
    default: 80
  },
  weather: {
    temp: Number,
    humidity: Number,
    rainfall: Number
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HarvestRecord', harvestRecordSchema);
