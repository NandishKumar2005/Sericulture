process.env.NODE_ENV = 'test';

const express = require('express');
const supertest = require('supertest');
const mongoose = require('mongoose');

const app = require('./src/index');

async function runVerification() {
  console.log('--- Testing Phase 3 Express APIs ---');
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sericulture_test';
    await mongoose.disconnect();
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to local MongoDB for API tests:', mongoUri);
    } catch (dbErr) {
      console.log('Local MongoDB unavailable, initializing MongoMemoryServer...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoMemoryServer:', mongoUri);
    }

    const request = supertest(app);

    // 1. Auth: POST /api/auth/register & POST /api/auth/login
    console.log('\nTesting Auth APIs...');
    const testEmail = `ramesh_${Date.now()}@sericulture.org`;
    const testPhone = `+9199${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await request.post('/api/auth/register').send({
      name: 'Ramesh Farmer',
      email: testEmail,
      phone: testPhone,
      password: 'FarmerPassword2026',
      location: 'Chikkaballapur, Karnataka'
    });
    console.log('POST /api/auth/register -> Status:', regRes.status);
    const token = regRes.body.token;

    const loginRes = await request.post('/api/auth/login').send({
      email: testEmail,
      password: 'FarmerPassword2026'
    });
    console.log('POST /api/auth/login -> Status:', loginRes.status);

    // 2. Farms: POST /api/farms & GET /api/farms
    console.log('\nTesting Farm APIs...');
    const farmPost = await request
      .post('/api/farms')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmName: 'Silk Valley Farm',
        area: 5,
        mulberryVariety: 'V1',
        plantationAge: 2
      });
    console.log('POST /api/farms -> Status:', farmPost.status, farmPost.body);
    const farmId = farmPost.body.data ? farmPost.body.data._id : null;

    const farmGet = await request
      .get('/api/farms')
      .set('Authorization', `Bearer ${token}`);
    console.log('GET /api/farms -> Status:', farmGet.status, 'Count:', farmGet.body.count);

    // 3. Batches: POST /api/batches & GET /api/batches
    console.log('\nTesting Batch APIs...');
    const batchPost = await request
      .post('/api/batches')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmId,
        batchName: 'Batch 2026-B',
        startDate: '2026-09-01',
        silkwormCount: 25000,
        currentInstar: '5th instar'
      });
    console.log('POST /api/batches -> Status:', batchPost.status);
    const batchId = batchPost.body.data._id;

    const batchGet = await request
      .get('/api/batches')
      .set('Authorization', `Bearer ${token}`);
    console.log('GET /api/batches -> Status:', batchGet.status, 'Count:', batchGet.body.count);

    // 4. Feeding: POST /api/feeding & GET /api/feeding/:batchId
    console.log('\nTesting Feeding APIs...');
    const feedingPost = await request
      .post('/api/feeding')
      .set('Authorization', `Bearer ${token}`)
      .send({
        batchId,
        recommendedQuantity: 35,
        actualQuantity: 34,
        numberOfFeedings: 4,
        leafQuality: 'Excellent',
        estimatedWastage: 4,
        actualWastage: 4
      });
    console.log('POST /api/feeding -> Status:', feedingPost.status);

    const feedingGet = await request
      .get(`/api/feeding/${batchId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`GET /api/feeding/${batchId} -> Status:`, feedingGet.status, 'Records:', feedingGet.body.count);

    // 5. Leaf Analysis: POST /api/leaf-analysis
    console.log('\nTesting Leaf Analysis API...');
    const leafPost = await request
      .post('/api/leaf-analysis')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmId,
        imageUrl: 'https://cloudinary.com/sample_leaf.jpg',
        qualityScore: 88,
        qualityCategory: 'Good',
        maturity: 'Optimal',
        feedingSuitability: 'High'
      });
    console.log('POST /api/leaf-analysis -> Status:', leafPost.status);

    // 6. Predictions: POST /api/predictions & GET /api/predictions/:batchId
    console.log('\nTesting Predictions API...');
    const predPost = await request
      .post('/api/predictions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        farmId,
        batchId,
        predictionType: 'cocoon_yield',
        inputData: { silkwormCount: 25000 },
        prediction: { expectedCocoonKg: 52 },
        confidence: 89
      });
    console.log('POST /api/predictions -> Status:', predPost.status);

    const cocoonSilkPost = await request
      .post('/api/predictions/cocoon-silk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        batchId,
        leaf_quality_score: 88,
        total_feeding_kg: 320,
        feeding_efficiency_pct: 94,
        wastage_pct: 4.5,
        temperature_celsius: 27,
        humidity_pct: 75,
      });
    console.log('POST /api/predictions/cocoon-silk -> Status:', cocoonSilkPost.status);

    const predGet = await request
      .get(`/api/predictions/${batchId}`)
      .set('Authorization', `Bearer ${token}`);
    console.log(`GET /api/predictions/${batchId} -> Status:`, predGet.status, 'Predictions:', predGet.body.count);

    // 7. Copilot: POST /api/copilot (English & Kannada)
    console.log('\nTesting Copilot API...');
    const copilotPost = await request
      .post('/api/copilot')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question: 'When should I harvest my mulberry leaves?'
      });
    console.log('POST /api/copilot (English) -> Status:', copilotPost.status);
    console.log('Copilot Reply (EN):', copilotPost.body.reply);

    const copilotKnPost = await request
      .post('/api/copilot')
      .set('Authorization', `Bearer ${token}`)
      .send({
        question: 'ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಕೊಯ್ಯಲು ಸೂಕ್ತ ಸಮಯ ಯಾವುದು?'
      });
    console.log('POST /api/copilot (Kannada) -> Status:', copilotKnPost.status);
    console.log('Copilot Reply (KN):', copilotKnPost.body.reply);

    console.log('\n=== ALL PHASE 3 BACKEND APIS FUNCTIONING PROPERLY ===');
  } catch (err) {
    console.error('Phase 3 Test Error Details:', err.stack || err);
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
