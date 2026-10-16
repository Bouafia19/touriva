const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')

describe('Touriva Tourism Core Services API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('GET /api/sites retrieves tourist attractions from Touriva database', async () => {
    const res = await request(app)
      .get('/api/sites')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    // Verify first site structure
    const site = res.body[0]
    expect(site).toHaveProperty('name')
    expect(site).toHaveProperty('location')
  })

  it('GET /api/hotels retrieves accommodations', async () => {
    const res = await request(app)
      .get('/api/hotels')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    const hotel = res.body[0]
    expect(hotel).toHaveProperty('name')
  })

  it('GET /api/restaurants retrieves dining listings', async () => {
    const res = await request(app)
      .get('/api/restaurants')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('GET /api/activities retrieves tourism activities & excursions', async () => {
    const res = await request(app)
      .get('/api/activities')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
  })

  it('GET /api/wilayas retrieves destinations administrative regions', async () => {
    const res = await request(app)
      .get('/api/wilayas')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('name')
  })
})
