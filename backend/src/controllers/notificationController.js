const Notification = require('../models/Notification');
const SilkwormBatch = require('../models/SilkwormBatch');
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

    // Generate dynamic sericulture alerts
    const dynamicAlerts = [];

    // 1. Harvesting alert based on batch lifecycle
    dynamicAlerts.push({
      _id: 'dyn_harvest_1',
      title: 'Harvest Alert: Mounting & Spinning Phase',
      message: 'Batch Sep-A is entering 5th Instar Spinning Stage. Prepare Chandrike (cocoon mounting frames) & keep rearing hall ventilated!',
      type: 'harvest_reminder',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action: 'harvest'
    });

    // 2. Feeding schedule reminder
    dynamicAlerts.push({
      _id: 'dyn_feed_1',
      title: 'Feeding Schedule Reminder',
      message: 'Afternoon feeding due: Administer 4.5 kg fresh Mulberry (V1 variety) leaves for 4th Instar larvae.',
      type: 'feeding_reminder',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      action: 'feeding'
    });

    // 3. Environmental Weather Alert
    const location = req.query.location || 'Kolar, Karnataka';
    const weather = await getWeatherForLocation(location);
    if (weather.temperature_celsius > 28 || weather.humidity_pct < 70) {
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

    // 4. Bed Cleaning / Moult Alert
    dynamicAlerts.push({
      _id: 'dyn_bed_1',
      title: 'Bed Cleaning & Disinfection Reminder',
      message: 'Disinfect rearing bed with Vijetha / Sanitech powder before feeding post-moult silkworms.',
      type: 'system',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      action: 'leaf'
    });

    // Combine saved and dynamic
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
