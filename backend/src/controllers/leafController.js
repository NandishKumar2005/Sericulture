const axios = require('axios');
const LeafAnalysis = require('../models/LeafAnalysis');
const Farm = require('../models/Farm');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/leaf-analysis/analyse
 *
 * Accepts a base64-encoded leaf image from mobile, proxies to the
 * FastAPI CV endpoint, saves the result to MongoDB, and returns it.
 *
 * Body:
 *   farmId      {string}  required
 *   image       {string}  base64-encoded image (with or without data URI prefix)
 */
exports.analyseLeaf = async (req, res) => {
  try {
    const { farmId, image } = req.body;

    if (!farmId) {
      return res.status(400).json({ success: false, message: 'farmId is required' });
    }
    if (!image) {
      return res.status(400).json({ success: false, message: 'image (base64) is required' });
    }

    // Verify farm belongs to requesting user
    const farm = await Farm.findOne({ _id: farmId, userId: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    // Call FastAPI ML service
    let mlResult;
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict/leaf-quality`,
        { image_base64: image, farm_id: farmId },
        { timeout: 15000 }
      );
      mlResult = response.data;
    } catch (mlError) {
      const detail =
        mlError.response?.data?.detail ||
        mlError.message ||
        'ML service unavailable';
      return res.status(502).json({
        success: false,
        message: `Leaf analysis service error: ${detail}`,
      });
    }

    // Persist to MongoDB
    // imageUrl stored as "base64:<first 60 chars>..." to avoid storing full image
    const imageRef = `base64:${image.substring(0, 60)}...`;

    const saved = await LeafAnalysis.create({
      farmId,
      imageUrl: imageRef,
      qualityScore:      mlResult.quality_score,
      qualityCategory:   mlResult.quality_category,
      maturity:          mlResult.maturity_stage,
      color:             mlResult.color_tone,
      texture:           mlResult.texture,
      damage:            mlResult.visible_damage,
      feedingSuitability: mlResult.feeding_suitability,
      confidence:        mlResult.confidence,
    });

    return res.status(200).json({
      success: true,
      analysisId: saved._id,
      data: {
        ...mlResult,
        analysisId: saved._id,
        analysedAt: saved.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/leaf-analysis/history/:farmId
 *
 * Returns leaf analysis history for a farm, most recent first.
 */
exports.getLeafHistory = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findOne({ _id: farmId, userId: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const records = await LeafAnalysis.find({ farmId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
