const express = require('express');
const router = express.Router();
const { createPrediction, getPredictionsByBatch, getPredictionsByFarm, predictCocoonSilk } = require('../controllers/dataController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createPrediction);
router.post('/cocoon-silk', predictCocoonSilk);
router.get('/:batchId', getPredictionsByBatch);
router.get('/farm/:farmId', getPredictionsByFarm);

module.exports = router;

