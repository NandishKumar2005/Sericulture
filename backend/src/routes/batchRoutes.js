const express = require('express');
const router = express.Router();
const { createBatch, getBatches, getBatchesByFarm, updateBatch } = require('../controllers/batchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBatches)
  .post(createBatch);

router.get('/farm/:farmId', getBatchesByFarm);
router.patch('/:id', updateBatch);

module.exports = router;
