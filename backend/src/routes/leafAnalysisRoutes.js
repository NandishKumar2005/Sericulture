const express = require('express');
const router = express.Router();
const { createLeafAnalysis, getLeafAnalysisByFarm } = require('../controllers/dataController');
const { analyseLeaf, getLeafHistory } = require('../controllers/leafController');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/leaf-analysis/analyse   — run CV analysis on a new image
router.post('/analyse', analyseLeaf);

// GET  /api/leaf-analysis/history/:farmId — fetch history for a farm
router.get('/history/:farmId', getLeafHistory);

// Legacy CRUD routes (kept for compatibility)
router.post('/', createLeafAnalysis);
router.get('/:farmId', getLeafAnalysisByFarm);

module.exports = router;
