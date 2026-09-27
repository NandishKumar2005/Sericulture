const Farm = require('../models/Farm');
const Plantation = require('../models/Plantation');

// @desc Create a new farm
// @route POST /api/farms
exports.createFarm = async (req, res) => {
  try {
    const { farmName, location, area, mulberryVariety, plantationAge } = req.body;

    if (!farmName || area === undefined) {
      return res.status(400).json({ success: false, message: 'farmName and area are required' });
    }

    const farm = await Farm.create({
      userId: req.user.id,
      farmName,
      location: location || '',
      area,
      mulberryVariety: mulberryVariety || 'V1',
      plantationAge: plantationAge || 1
    });

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      data: farm
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get all farms for authenticated farmer
// @route GET /api/farms
exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Create plantation plot for a farm
// @route POST /api/farms/:farmId/plantations
exports.createPlantation = async (req, res) => {
  try {
    const { farmId } = req.params;
    const { plotName, mulberryVariety, area, plantationAge, plantingDate } = req.body;

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const plantation = await Plantation.create({
      farmId,
      plotName: plotName || 'Main Plot',
      mulberryVariety: mulberryVariety || farm.mulberryVariety,
      area: area || farm.area,
      plantationAge: plantationAge || farm.plantationAge,
      plantingDate: plantingDate || Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Plantation created successfully',
      data: plantation
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
