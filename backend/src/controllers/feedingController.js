const axios = require('axios');
const FeedingRecord = require('../models/FeedingRecord');
const SilkwormBatch = require('../models/SilkwormBatch');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/feeding/optimise
 *
 * Get a feeding recommendation from the ML service for a batch.
 * Does NOT save to DB — the farmer records actual feeding separately
 * via the existing POST /api/feeding route.
 *
 * Body:
 *   batchId              {string}  required
 *   leaf_quality_score   {number}  optional (default 80)
 *   previous_wastage_pct {number}  optional
 */
exports.optimiseFeeding = async (req, res) => {
  try {
    const { batchId, leaf_quality_score, previous_wastage_pct } = req.body;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    // Load batch to get silkworm count + instar
    const batch = await SilkwormBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Map instar string → number
    const instarMap = {
      '1st instar': 1, '2nd instar': 2, '3rd instar': 3,
      '4th instar': 4, '5th instar': 5,
    };
    const instarNum = instarMap[batch.currentInstar] || 5;

    // Batch age in days
    const batchAgeDays = Math.floor(
      (Date.now() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Pull most recent feeding record for feedback
    const lastRecord = await FeedingRecord.findOne({ batchId })
      .sort({ date: -1 });

    const mlPayload = {
      silkworm_count:           batch.silkwormCount,
      instar:                   instarNum,
      batch_age_days:           batchAgeDays,
      leaf_quality_score:       leaf_quality_score != null ? Number(leaf_quality_score) : 80,
      previous_recommended_kg:  lastRecord?.recommendedQuantity  ?? null,
      previous_actual_kg:       lastRecord?.actualQuantity        ?? null,
      previous_wastage_pct:     previous_wastage_pct != null
                                  ? Number(previous_wastage_pct)
                                  : (lastRecord?.actualWastage ?? null),
    };

    // Call FastAPI
    let mlResult;
    try {
      const response = await axios.post(
        `${ML_SERVICE_URL}/predict/feeding`,
        mlPayload,
        { timeout: 10000 }
      );
      mlResult = response.data;
    } catch (mlError) {
      const detail = mlError.response?.data?.detail || mlError.message || 'ML service unavailable';
      return res.status(502).json({ success: false, message: `Feeding service error: ${detail}` });
    }

    return res.status(200).json({
      success:    true,
      batchId,
      silkworms:  batch.silkwormCount,
      instar:     batch.currentInstar,
      batchAge:   batchAgeDays,
      data:       mlResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
