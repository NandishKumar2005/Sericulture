const express = require('express');
const router = express.Router();
const { createFarm, getFarms, createPlantation } = require('../controllers/farmController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .post(createFarm)
  .get(getFarms);

router.route('/:farmId/plantations')
  .post(createPlantation);

module.exports = router;
