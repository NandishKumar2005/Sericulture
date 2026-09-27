const express = require('express');
const router = express.Router();
const { createFeedingRecord, getFeedingRecordsByBatch } = require('../controllers/dataController');
const { optimiseFeeding } = require('../controllers/feedingController');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/feeding/optimise  — get ML recommendation for a batch
router.post('/optimise', optimiseFeeding);

// POST /api/feeding           — record actual feeding
router.post('/', createFeedingRecord);

// GET  /api/feeding/:batchId  — fetch feeding history
router.get('/:batchId', getFeedingRecordsByBatch);

module.exports = router;
