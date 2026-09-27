const mongoose = require('mongoose');

const leafAnalysisSchema = new mongoose.Schema({
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  qualityScore: {
    type: Number,
    required: true
  },
  qualityCategory: {
    type: String,
    enum: ['Excellent', 'Good', 'Moderate', 'Poor'],
    default: 'Good'
  },
  maturity: {
    type: String,
    default: 'Optimal'
  },
  color: {
    type: String,
    default: 'Dark Green'
  },
  texture: {
    type: String,
    default: 'Smooth'
  },
  damage: {
    type: mongoose.Schema.Types.Mixed,
    default: 'None'
  },
  feedingSuitability: {
    type: String,
    default: 'Suitable'
  },
  confidence: {
    type: Number,
    default: 90
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeafAnalysis', leafAnalysisSchema);
