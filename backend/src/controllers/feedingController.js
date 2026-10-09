const axios = require('axios');
const FeedingRecord = require('../models/FeedingRecord');
const SilkwormBatch = require('../models/SilkwormBatch');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/feeding/optimise
 */
exports.optimiseFeeding = async (req, res) => {
  try {
    const { batchId, leaf_quality_score, previous_wastage_pct } = req.body;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    let batch = null;
    try {
      batch = await SilkwormBatch.findById(batchId);
    } catch {
      // Graceful fallback
    }

    const silkworms = batch ? batch.silkwormCount : 10000;
    const instar = batch ? batch.currentInstar : '5th Instar';

    const instarMap = {
      '1st Instar': 1, '2nd Instar': 2, '3rd Instar': 3,
      '4th Instar': 4, '5th Instar': 5,
    };
    const instarNum = instarMap[instar] || 5;
    const leafScore = leaf_quality_score != null ? Number(leaf_quality_score) : 85;

    let mlResult = null;

    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict/feeding`,
        {
          silkworm_count: silkworms,
          instar: instarNum,
          leaf_quality_score: leafScore,
        },
        { timeout: 3000 }
      );
      mlResult = response.data;
    } catch {
      // Fallback mathematical model
      const multiplierMap = { 1: 0.000015, 2: 0.00004, 3: 0.00018, 4: 0.00052, 5: 0.00091 };
      const mult = multiplierMap[instarNum] || 0.00091;
      const dailyKg = Number((silkworms * mult * (leafScore / 85)).toFixed(1));

      mlResult = {
        daily_quantity_kg: dailyKg,
        feedings_per_day: 4,
        kg_per_feeding: Number((dailyKg / 4).toFixed(2)),
        instar_stage: instar,
        silkworm_count: silkworms,
        wastage_pct: 4.2
      };
    }

    return res.status(200).json({
      success: true,
      batchId,
      silkworms,
      instar,
      data: mlResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
