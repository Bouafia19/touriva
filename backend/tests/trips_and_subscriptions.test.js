const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../server')
const User = require('../models/User')

describe('Touriva Trips & Booking Subscriptions API', () => {
  let sampleTripId = null
  let adminToken = null

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
    const adminUser = await User.findOne({ role: 'administrator' })
    if (adminUser) {
      adminToken = jwt.sign({ _id: adminUser._id }, process.env.SECRET, { expiresIn: '1h' })
    }
  })

  afterAll(async () => {
    // Clean up test subscriptions if any were created
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.collection('tripsubscriptions').deleteMany({ fullName: 'Test Traveler' })
      await mongoose.connection.close()
    }
  })

  it('GET /api/trips lists all available trips', async () => {
    const res = await request(app)
      .get('/api/trips')
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
    if (res.body.length > 0) {
      sampleTripId = res.body[0]._id
      expect(res.body[0]).toHaveProperty('name')
      expect(res.body[0]).toHaveProperty('days')
    }
  })

  it('GET /api/trips/:id retrieves a single trip by ID', async () => {
    if (!sampleTripId) return

    const res = await request(app)
      .get(`/api/trips/${sampleTripId}`)
      .expect(200)

    expect(res.body).toHaveProperty('_id', sampleTripId)
  })

  it('POST /api/tripSubscriptions rejects missing required fields with 400', async () => {
    const res = await request(app)
      .post('/api/tripSubscriptions')
      .send({ fullName: 'Test Traveler' }) // missing tripId and phone
      .expect(400)

    expect(res.body.message).toContain('required')
  })

  it('POST /api/tripSubscriptions creates a verified trip booking reservation', async () => {
    if (!sampleTripId) return

    const bookingPayload = {
      tripId: sampleTripId,
      fullName: 'Test Traveler',
      phone: '+213555123456'
    }

    const res = await request(app)
      .post('/api/tripSubscriptions')
      .send(bookingPayload)
      .expect(201)

    expect(res.body).toHaveProperty('_id')
    expect(res.body.fullName).toBe('Test Traveler')
    expect(res.body.phone).toBe('+213555123456')
  })

  it('GET /api/tripSubscriptions retrieves grouped subscriptions for admin', async () => {
    const res = await request(app)
      .get('/api/tripSubscriptions')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(Array.isArray(res.body)).toBe(true)
  })
})
