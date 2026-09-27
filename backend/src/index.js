const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const batchRoutes = require('./routes/batchRoutes');
const feedingRoutes = require('./routes/feedingRoutes');
const leafAnalysisRoutes = require('./routes/leafAnalysisRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const harvestRoutes = require('./routes/harvestRoutes');
const copilotRoutes = require('./routes/copilotRoutes');
const dataRoutes = require('./routes/dataRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (Phase 3 Specification)
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/feeding', feedingRoutes);
app.use('/api/leaf-analysis', leafAnalysisRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/predictions/harvest', harvestRoutes);
app.use('/api/copilot', copilotRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Smart Sericulture Backend REST API',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'PUT  /api/auth/profile',
      'GET  /api/farms',
      'POST /api/farms',
      'GET  /api/batches',
      'POST /api/batches',
      'POST /api/feeding',
      'GET  /api/feeding/:batchId',
      'POST /api/leaf-analysis',
      'GET  /api/predictions/:batchId',
      'POST /api/predictions/harvest',
      'GET  /api/predictions/harvest/:farmId',
      'POST /api/copilot',
      'GET  /api/weather',
      'GET  /api/notifications'
    ]
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server when not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
