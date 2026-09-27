const { getWeatherForLocation } = require('../services/weatherService');

// @desc Get real-time weather for location
// @route GET /api/weather
exports.getWeather = async (req, res) => {
  try {
    const location = req.query.location || 'Kolar';
    const weatherData = await getWeatherForLocation(location);
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
