const mongoose = require('mongoose');

const silkwormBatchSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  batchName: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  silkwormCount: {
    type: Number,
    required: true
  },
  currentInstar: {
    type: String,
    enum: ['1st instar', '2nd instar', '3rd instar', '4th instar', '5th instar', 'Spinning', 'Harvested'],
    default: '1st instar'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SilkwormBatch', silkwormBatchSchema);
