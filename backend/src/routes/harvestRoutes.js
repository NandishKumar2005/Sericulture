const express = require('express');
const router = express.Router();
const { predictHarvest, getHarvestPredictions } = require('../controllers/harvestController');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/predictions/harvest       — run a new harvest prediction
router.post('/', predictHarvest);

// GET  /api/predictions/harvest/:farmId — fetch prediction history for a farm
router.get('/:farmId', getHarvestPredictions);

module.exports = router;
