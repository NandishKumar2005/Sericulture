const Notification = require('../models/Notification');
const SilkwormBatch = require('../models/SilkwormBatch');
const Farm = require('../models/Farm');
const { getWeatherForLocation } = require('../services/weatherService');

// @desc Get user notifications with smart dynamic sericulture alerts
// @route GET /api/notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    let savedNotifications = [];

    if (userId) {
      savedNotifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    }

    const dynamicAlerts = [];

    if (userId) {
      const userFarms = await Farm.find({ userId });
      const farmIds = userFarms.map(f => f._id);
      const activeBatches = await SilkwormBatch.find({ farmId: { $in: farmIds }, status: 'active' });

      activeBatches.forEach((batch) => {
        if (batch.currentInstar && batch.currentInstar.toLowerCase().includes('5th')) {
          dynamicAlerts.push({
            _id: `dyn_harvest_${batch._id}`,
            title: `Harvest Alert: ${batch.batchName}`,
            message: `${batch.batchName} has reached ${batch.currentInstar}. Prepare Chandrike mounting frames for cocoon spinning!`,
            type: 'harvest_reminder',
            read: false,
            createdAt: new Date().toISOString(),
            action: 'harvest'
          });
        }
        dynamicAlerts.push({
          _id: `dyn_feed_${batch._id}`,
          title: `Feeding Reminder: ${batch.batchName}`,
          message: `Scheduled feeding for ${batch.silkwormCount.toLocaleString()} silkworms in ${batch.batchName} (${batch.currentInstar}).`,
          type: 'feeding_reminder',
          read: false,
          createdAt: new Date().toISOString(),
          action: 'feeding'
        });
      });
    }

    // Environmental Weather Alert
    const location = req.query.location || (req.user ? req.user.location : '') || 'Karnataka, India';
    if (location) {
      try {
        const weather = await getWeatherForLocation(location);
        if (weather && (weather.temperature_celsius > 28 || weather.humidity_pct < 70)) {
          dynamicAlerts.push({
            _id: 'dyn_weather_1',
            title: `Weather Alert for ${weather.location}`,
            message: `Current Temp: ${weather.temperature_celsius}°C, Humidity: ${weather.humidity_pct}%. ${weather.sericulture_advice}`,
            type: 'prediction_alert',
            read: false,
            createdAt: new Date().toISOString(),
            action: 'weather'
          });
        }
      } catch (wErr) {
        // Ignore weather service errors gracefully
      }
    }

    const allNotifications = [...savedNotifications, ...dynamicAlerts];

    res.json({
      success: true,
      data: allNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Create custom notification
// @route POST /api/notifications
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const userId = req.user.id;

    const notification = await Notification.create({
      userId,
      title,
      message,
      type: type || 'system'
    });

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Mark notifications as read
// @route POST /api/notifications/read-all
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    if (userId) {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    }
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
