const FeedingRecord = require('../models/FeedingRecord');
const HarvestRecord = require('../models/HarvestRecord');
const LeafAnalysis = require('../models/LeafAnalysis');
const Prediction = require('../models/Prediction');
const SilkwormBatch = require('../models/SilkwormBatch');
const Farm = require('../models/Farm');

// --- FEEDING RECORDS ---
exports.createFeedingRecord = async (req, res) => {
  try {
    const { batchId, date, recommendedQuantity, actualQuantity, numberOfFeedings, leafQuality, estimatedWastage, actualWastage } = req.body;

    if (!batchId || recommendedQuantity === undefined || actualQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'batchId, recommendedQuantity, and actualQuantity are required' });
    }

    const estWastageVal = estimatedWastage || 5;
    const actWastageVal = actualWastage || 5;
    const efficiency = Math.round(100 - Math.abs((actualQuantity - recommendedQuantity) / recommendedQuantity * 100));

    const record = await FeedingRecord.create({
      batchId,
      date: date || Date.now(),
      recommendedQuantity,
      actualQuantity,
      numberOfFeedings: numberOfFeedings || 4,
      leafQuality: leafQuality || 'Good',
      estimatedWastage: estWastageVal,
      actualWastage: actWastageVal,
      feedingEfficiency: Math.max(0, Math.min(100, efficiency))
    });

    res.status(201).json({ success: true, message: 'Feeding record saved', data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFeedingRecordsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const records = await FeedingRecord.find({ batchId }).sort({ date: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- HARVEST RECORDS ---
exports.createHarvestRecord = async (req, res) => {
  try {
    const { farmId, plantationId, harvestDate, quantity, leafMaturity, weather, notes } = req.body;

    if (!farmId || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'farmId and quantity are required' });
    }

    const record = await HarvestRecord.create({
      farmId,
      plantationId: plantationId || null,
      harvestDate: harvestDate || Date.now(),
      quantity,
      leafMaturity: leafMaturity || 80,
      weather: weather || {},
      notes: notes || ''
    });

    res.status(201).json({ success: true, message: 'Harvest record saved', data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getHarvestRecordsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const records = await HarvestRecord.find({ farmId }).sort({ harvestDate: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- LEAF ANALYSIS ---
exports.createLeafAnalysis = async (req, res) => {
  try {
    const { farmId, imageUrl, qualityScore, qualityCategory, maturity, color, texture, damage, feedingSuitability, confidence } = req.body;

    if (!farmId || !imageUrl || qualityScore === undefined) {
      return res.status(400).json({ success: false, message: 'farmId, imageUrl, and qualityScore are required' });
    }

    const analysis = await LeafAnalysis.create({
      farmId,
      imageUrl,
      qualityScore,
      qualityCategory: qualityCategory || 'Good',
      maturity: maturity || 'Optimal',
      color: color || 'Dark Green',
      texture: texture || 'Smooth',
      damage: damage || 'None',
      feedingSuitability: feedingSuitability || 'Suitable',
      confidence: confidence || 90
    });

    res.status(201).json({ success: true, message: 'Leaf analysis saved', data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getLeafAnalysisByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const records = await LeafAnalysis.find({ farmId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- PREDICTIONS ---
exports.createPrediction = async (req, res) => {
  try {
    const { farmId, batchId, predictionType, inputData, prediction, confidence } = req.body;

    if (!farmId || !predictionType) {
      return res.status(400).json({ success: false, message: 'farmId and predictionType are required' });
    }

    const record = await Prediction.create({
      farmId,
      batchId: batchId || null,
      predictionType,
      inputData: inputData || {},
      prediction: prediction || {},
      confidence: confidence || 85
    });

    res.status(201).json({ success: true, message: 'Prediction recorded', data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPredictionsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const records = await Prediction.find({ batchId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPredictionsByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const records = await Prediction.find({ farmId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- DASHBOARD SUMMARY ---
exports.getFarmDashboard = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const [activeBatches, latestLeafAnalysis, latestHarvest, latestPredictions] = await Promise.all([
      SilkwormBatch.find({ farmId, status: 'active' }).sort({ createdAt: -1 }),
      LeafAnalysis.find({ farmId }).sort({ createdAt: -1 }).limit(1),
      HarvestRecord.find({ farmId }).sort({ harvestDate: -1 }).limit(1),
      Prediction.find({ farmId }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        farm,
        activeBatches,
        latestLeafAnalysis: latestLeafAnalysis[0] || null,
        latestHarvest: latestHarvest[0] || null,
        recentPredictions: latestPredictions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- COCOON & SILK PREDICTION PROXY ---
const axios = require('axios');
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.predictCocoonSilk = async (req, res) => {
  try {
    const { batchId, leaf_quality_score, total_feeding_kg, feeding_efficiency_pct, wastage_pct, temperature_celsius, humidity_pct } = req.body;

    if (!batchId) {
      return res.status(400).json({ success: false, message: 'batchId is required' });
    }

    const batch = await SilkwormBatch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Silkworm batch not found' });
    }

    const instarMap = {
      '1st instar': 1, '2nd instar': 2, '3rd instar': 3,
      '4th instar': 4, '5th instar': 5,
    };
    const instarNum = instarMap[batch.currentInstar] || 5;

    const batchAgeDays = Math.max(1, Math.floor(
      (Date.now() - new Date(batch.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ));

    const mlPayload = {
      silkworm_count: batch.silkwormCount,
      instar: instarNum,
      batch_age_days: batchAgeDays,
      leaf_quality_score: leaf_quality_score != null ? Number(leaf_quality_score) : 85,
      total_feeding_kg: total_feeding_kg != null ? Number(total_feeding_kg) : null,
      feeding_efficiency_pct: feeding_efficiency_pct != null ? Number(feeding_efficiency_pct) : null,
      wastage_pct: wastage_pct != null ? Number(wastage_pct) : null,
      temperature_celsius: temperature_celsius != null ? Number(temperature_celsius) : 27,
      humidity_pct: humidity_pct != null ? Number(humidity_pct) : 75,
    };

    let mlResult;
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/cocoon-silk`, mlPayload, { timeout: 10000 });
      mlResult = response.data;
    } catch (mlError) {
      const detail = mlError.response?.data?.detail || mlError.message || 'ML service unavailable';
      return res.status(502).json({ success: false, message: `Production prediction error: ${detail}` });
    }

    const savedPrediction = await Prediction.create({
      farmId: batch.farmId,
      batchId: batch._id,
      predictionType: 'cocoon_silk_yield',
      inputData: mlPayload,
      prediction: mlResult,
      confidence: mlResult.confidence_score,
    });

    return res.status(200).json({
      success: true,
      predictionId: savedPrediction._id,
      data: mlResult,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

