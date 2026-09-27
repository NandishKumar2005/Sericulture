const SilkwormBatch = require('../models/SilkwormBatch');
const Farm = require('../models/Farm');

// @desc Create a new silkworm batch
// @route POST /api/batches
exports.createBatch = async (req, res) => {
  try {
    const { farmId, batchName, startDate, silkwormCount, currentInstar } = req.body;

    if (!farmId || !batchName || !silkwormCount) {
      return res.status(400).json({ success: false, message: 'farmId, batchName, and silkwormCount are required' });
    }

    const farm = await Farm.findById(farmId);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const batch = await SilkwormBatch.create({
      farmId,
      batchName,
      startDate: startDate || Date.now(),
      silkwormCount,
      currentInstar: currentInstar || '1st instar',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Silkworm batch created successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get batches for authenticated user (all farms or specific farmId query)
// @route GET /api/batches
exports.getBatches = async (req, res) => {
  try {
    const { farmId } = req.query;
    let filter = {};

    if (farmId) {
      filter.farmId = farmId;
    } else {
      const userFarms = await Farm.find({ userId: req.user.id });
      const farmIds = userFarms.map(f => f._id);
      filter.farmId = { $in: farmIds };
    }

    const batches = await SilkwormBatch.find(filter).populate('farmId', 'farmName').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get batches by farm ID param
// @route GET /api/batches/farm/:farmId
exports.getBatchesByFarm = async (req, res) => {
  try {
    const { farmId } = req.params;
    const batches = await SilkwormBatch.find({ farmId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Update batch stage or status
// @route PATCH /api/batches/:id
exports.updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const batch = await SilkwormBatch.findByIdAndUpdate(id, req.body, { new: true });

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
