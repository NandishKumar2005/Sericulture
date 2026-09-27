const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SilkwormBatch',
    index: true
  },
  predictionType: {
    type: String,
    enum: ['harvest_window', 'cocoon_yield', 'silk_yield', 'feeding_opt'],
    required: true
  },
  inputData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  prediction: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  confidence: {
    type: Number,
    default: 85
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prediction', predictionSchema);
