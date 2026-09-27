const axios = require('axios');
const Prediction = require('../models/Prediction');
const HarvestRecord = require('../models/HarvestRecord');
const Farm = require('../models/Farm');
const { getWeatherForLocation } = require('../services/weatherService');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/predictions/harvest
 *
 * Accepts farm/environment data from mobile, proxies to the FastAPI
 * harvest prediction endpoint, persists the result, and returns it.
 */
exports.predictHarvest = async (req, res) => {
  try {
    const {
      farmId,
      mulberry_variety,
      plantation_age_years,
      area_acres,
      days_since_last_harvest,
      previous_yield_kg,
      leaf_maturity_pct,
      temperature_celsius,
      humidity_pct,
      rainfall_mm,
      season,
    } = req.body;

    // --- Basic validation ---
    if (!farmId) {
      return res.status(400).json({ success: false, message: 'farmId is required' });
    }
    if (
      plantation_age_years === undefined ||
      area_acres === undefined ||
      days_since_last_harvest === undefined ||
      leaf_maturity_pct === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Required fields: plantation_age_years, area_acres, days_since_last_harvest, leaf_maturity_pct',
      });
    }

    // --- Verify farm belongs to requesting user ---
    const farm = await Farm.findOne({ _id: farmId, userId: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    // --- Auto-fetch weather if temperature/humidity not provided ---
    let finalTemp = temperature_celsius;
    let finalHumidity = humidity_pct;
    let finalRainfall = rainfall_mm;

    if (finalTemp === undefined || finalHumidity === undefined || finalRainfall === undefined) {
      const liveWeather = await getWeatherForLocation(farm.location);
      if (finalTemp === undefined) finalTemp = liveWeather.temperature_celsius;
      if (finalHumidity === undefined) finalHumidity = liveWeather.humidity_pct;
      if (finalRainfall === undefined) finalRainfall = liveWeather.rainfall_mm;
    }

    // --- Build ML service payload ---
    const mlPayload = {
      mulberry_variety: mulberry_variety || farm.mulberryVariety || 'V1',
      plantation_age_years: Number(plantation_age_years),
      area_acres: Number(area_acres),
      days_since_last_harvest: Number(days_since_last_harvest),
      previous_yield_kg: previous_yield_kg != null ? Number(previous_yield_kg) : null,
      leaf_maturity_pct: Number(leaf_maturity_pct),
      temperature_celsius: Number(finalTemp),
      humidity_pct: Number(finalHumidity),
      rainfall_mm: Number(finalRainfall || 0),
      season: season || 'normal',
    };


    // --- Call FastAPI ML service ---
    let mlResult;
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict/harvest`, mlPayload, {
        timeout: 10000,
      });
      mlResult = response.data;
    } catch (mlError) {
      const detail =
        mlError.response?.data?.detail ||
        mlError.message ||
        'ML service unavailable';
      return res.status(502).json({
        success: false,
        message: `Harvest prediction service error: ${detail}`,
      });
    }

    // --- Persist prediction to MongoDB ---
    const savedPrediction = await Prediction.create({
      farmId,
      batchId: null,
      predictionType: 'harvest_window',
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

/**
 * GET /api/predictions/harvest/:farmId
 *
 * Returns the prediction history for a farm, most recent first.
 */
exports.getHarvestPredictions = async (req, res) => {
  try {
    const { farmId } = req.params;

    const farm = await Farm.findOne({ _id: farmId, userId: req.user.id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const predictions = await Prediction.find({
      farmId,
      predictionType: 'harvest_window',
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      count: predictions.length,
      data: predictions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
