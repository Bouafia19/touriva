const request = require('supertest');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop';

let app;

beforeAll(async () => {
  app = require('../server');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Touriva Shop API Endpoints', () => {
  it('GET /api/health returns 200 and shop health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('touriva-shop-backend');
  });

  it('GET /api/categories/all returns HTTP 200 and category list', async () => {
    const res = await request(app).get('/api/categories/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/wilayas returns HTTP 200 with geographic regions', async () => {
    const res = await request(app).get('/api/wilayas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/products returns HTTP 200 with tourism merchandise/products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
  });
});
