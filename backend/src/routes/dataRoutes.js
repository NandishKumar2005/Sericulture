const express = require('express');
const router = express.Router();
const {
  createFeedingRecord,
  getFeedingRecordsByBatch,
  createHarvestRecord,
  getHarvestRecordsByFarm,
  createLeafAnalysis,
  getLeafAnalysisByFarm,
  createPrediction,
  getPredictionsByFarm,
  getFarmDashboard
} = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Feeding routes
router.post('/feeding', createFeedingRecord);
router.get('/feeding/:batchId', getFeedingRecordsByBatch);

// Harvest routes
router.post('/harvest', createHarvestRecord);
router.get('/harvest/:farmId', getHarvestRecordsByFarm);

// Leaf analysis routes
router.post('/leaf-analysis', createLeafAnalysis);
router.get('/leaf-analysis/:farmId', getLeafAnalysisByFarm);

// Prediction routes
router.post('/predictions', createPrediction);
router.get('/predictions/:farmId', getPredictionsByFarm);

// Aggregated Dashboard route
router.get('/dashboard/:farmId', getFarmDashboard);

module.exports = router;
