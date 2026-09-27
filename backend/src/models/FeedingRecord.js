const mongoose = require('mongoose');

const feedingRecordSchema = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SilkwormBatch',
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  recommendedQuantity: {
    type: Number,
    required: true
  },
  actualQuantity: {
    type: Number,
    required: true
  },
  numberOfFeedings: {
    type: Number,
    default: 4
  },
  leafQuality: {
    type: mongoose.Schema.Types.Mixed,
    default: "Good"
  },
  estimatedWastage: {
    type: Number,
    default: 5
  },
  actualWastage: {
    type: Number,
    default: 5
  },
  feedingEfficiency: {
    type: Number,
    default: 95
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FeedingRecord', feedingRecordSchema);
