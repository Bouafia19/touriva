const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const Wilaya = require('../models/Wilaya')
const { AIService } = require('../services/ai/index')
const { normalizeTripData } = require('../services/ai/tripNormalizer')

describe('Touriva Trip Builder & AI Model Integration Suite', () => {
  jest.setTimeout(60000)

  let touristUser = null
  let touristToken = null
  let adminUser = null
  let adminToken = null
  let algerWilaya = null
  const createdTripIds = []

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    // Retrieve or seed a client user
    touristUser = await User.findOne({ role: 'client' })
    if (!touristUser) {
      touristUser = await User.create({
        firstName: 'Sarah',
        lastName: 'Benali',
        email: 'sarah.client.test@touriva.dz',
        phone: '+213550000099',
        password: 'Password123!',
        role: 'client'
      })
    }
    touristToken = jwt.sign({ _id: touristUser._id }, process.env.SECRET || 'touriva_secret_key', { expiresIn: '1h' })

    // Retrieve admin user
    adminUser = await User.findOne({ role: 'administrator' })
    if (adminUser) {
      adminToken = jwt.sign({ _id: adminUser._id }, process.env.SECRET || 'touriva_secret_key', { expiresIn: '1h' })
    }

    // Retrieve Alger wilaya
    algerWilaya = await Wilaya.findOne({ name: { $regex: 'alg', $options: 'i' } })
  })

  afterAll(async () => {
    if (createdTripIds.length > 0) {
      await Trip.deleteMany({ _id: { $in: createdTripIds } })
    }
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
    }
  })

  describe('1. Schema Convergence & Normalization Layer', () => {
    it('1.1: normalizeTripData maps "name" to "title" in items and enforces DaySchema', async () => {
      const rawAiData = {
        name: 'Cultural Algiers',
        description: '3 days of historic monuments',
        durationDays: 3,
        items: [
          {
            day: 1,
            items: [
              { name: 'Palais des Rais', time: '09:00', description: 'Ottoman seafront palace' },
              { name: 'Casbah alleys', time: '14:00', description: 'Ancient heritage alleys' }
            ]
          }
        ]
      }

      const normalized = await normalizeTripData(rawAiData, { city: 'Algiers', days: 3 })

      expect(normalized.durationDays).toBe(3)
      expect(normalized.days).toEqual([1, 2, 3])
      expect(normalized.items.length).toBe(3)

      // Day 1 stops should have mapped 'name' to 'title'
      expect(normalized.items[0].items[0].title).toBe('Palais des Rais')
      expect(normalized.items[0].items[0].time).toBe('09:00')
      expect(normalized.items[0].items[1].title).toBe('Casbah alleys')

      // Days 2 and 3 should have auto-generated fallback stops
      expect(normalized.items[1].items.length).toBeGreaterThanOrEqual(2)
      expect(normalized.items[1].items[0]).toHaveProperty('title')
      expect(normalized.items[1].items[0]).toHaveProperty('time')

      // Destination should resolve to Wilaya if Alger matched
      if (algerWilaya) {
        expect(normalized.destination.toString()).toBe(algerWilaya._id.toString())
      }
    })

    it('1.2: handles international destination (Istanbul) gracefully with null destination Wilaya', async () => {
      const rawAiData = {
        name: '7-Day Istanbul Discovery',
        durationDays: 7,
        items: []
      }

      const normalized = await normalizeTripData(rawAiData, { city: 'Istanbul', days: 7 })
      expect(normalized.durationDays).toBe(7)
      expect(normalized.destination).toBeNull()
      expect(normalized.name).toContain('Istanbul')
    })
  })

  describe('2. AI Provider Architecture & Fallback', () => {
    it('2.1: AIService initializes both Gemini and Ollama providers', () => {
      const service = new AIService()
      expect(service.gemini).toBeDefined()
      expect(service.ollama).toBeDefined()
      expect(typeof service.generateTripItinerary).toBe('function')
    })

    it('2.2: AIService produces a complete, normalized itinerary even when external keys are offline', async () => {
      const service = new AIService()
      const result = await service.generateTripItinerary({
        city: 'Tlemcen',
        days: 5,
        partyType: 'Family',
        preferences: ['Historic Palaces', 'Gastronomy']
      })

      expect(result).toHaveProperty('trip')
      expect(result).toHaveProperty('provider')
      expect(result.trip.durationDays).toBe(5)
      expect(result.trip.days.length).toBe(5)
      expect(result.trip.items.length).toBe(5)
      expect(result.trip.items[0].items[0]).toHaveProperty('title')
      expect(result.trip.items[0].items[0]).toHaveProperty('time')
    })
  })

  describe('3. Functional API Test: Create Trip with AI (POST /api/aiTrips/generate)', () => {
    it('3.1: Rejects unauthenticated request with 401', async () => {
      await request(app)
        .post('/api/aiTrips/generate')
        .send({ city: 'Algiers', days: 3 })
        .expect(401)
    })

    it('3.2: Rejects missing city with 400', async () => {
      await request(app)
        .post('/api/aiTrips/generate')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({ days: 3 })
        .expect(400)
    })

    it('3.3: Authenticated tourist can generate and persist an AI trip (Algiers 3-day Cultural)', async () => {
      const res = await request(app)
        .post('/api/aiTrips/generate')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          city: 'Algiers',
          days: 3,
          budget: 'medium',
          partyType: 'Solo',
          preferences: ['Cultural heritage', 'UNESCO sites']
        })
        .expect(201)

      const trip = res.body
      createdTripIds.push(trip._id)

      expect(trip).toHaveProperty('_id')
      expect(trip.name).toBeDefined()
      expect(trip.durationDays).toBe(3)
      expect(trip.days).toEqual([1, 2, 3])
      expect(trip.items.length).toBe(3)
      // Check stop titles are populated (not null or undefined)
      expect(trip.items[0].items[0].title).toBeDefined()
      expect(typeof trip.items[0].items[0].title).toBe('string')
      expect(trip.items[0].items[0].title.length).toBeGreaterThan(0)
      expect(trip.creator).toBeDefined()
      expect(trip.status).toBe('created')
      expect(trip.published).toBe(false)
    })
  })

  describe('4. Functional API Test: Create Trip Manually (POST /api/trips)', () => {
    it('4.1: Authenticated tourist can save a manually built trip', async () => {
      const manualPayload = {
        name: 'Handcrafted Oran Coastal Escapade',
        description: 'Custom curated trip with friends along Santa Cruz and Front de Mer',
        durationDays: 2,
        destination: 'Oran',
        price: '24 000 DZD',
        items: [
          {
            day: 1,
            items: [
              { title: 'Santa Cruz Fort', time: '10:00', description: 'Morning panoramic view', lat: 35.709, lng: -0.665 },
              { title: 'Front de Mer Lunch', time: '13:00', description: 'Fresh seafood dining', lat: 35.701, lng: -0.643 }
            ]
          },
          {
            day: 2,
            items: [
              { title: 'Place du 1er Novembre', time: '11:00', description: 'Historic architecture walk', lat: 35.698, lng: -0.638 }
            ]
          }
        ]
      }

      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${touristToken}`)
        .send(manualPayload)
        .expect(201)

      const trip = res.body
      createdTripIds.push(trip._id)

      expect(trip._id).toBeDefined()
      expect(trip.name).toBe('Handcrafted Oran Coastal Escapade')
      expect(trip.durationDays).toBe(2)
      expect(trip.days).toEqual([1, 2])
      expect(trip.items.length).toBe(2)
      expect(trip.items[0].items[0].title).toBe('Santa Cruz Fort')
      expect(trip.published).toBe(false)
    })

    it('4.2: Both Manual and AI trips share identical schema fields when fetched by ID', async () => {
      expect(createdTripIds.length).toBeGreaterThanOrEqual(2)
      const aiTripId = createdTripIds[0]
      const manualTripId = createdTripIds[1]

      const aiRes = await request(app).get(`/api/trips/${aiTripId}`).expect(200)
      const manualRes = await request(app).get(`/api/trips/${manualTripId}`).expect(200)

      const requiredKeys = ['_id', 'name', 'description', 'creator', 'price', 'durationDays', 'days', 'items', 'status', 'published']
      for (const key of requiredKeys) {
        expect(aiRes.body).toHaveProperty(key)
        expect(manualRes.body).toHaveProperty(key)
      }

      // Check structure of first day
      expect(aiRes.body.items[0]).toHaveProperty('day')
      expect(aiRes.body.items[0]).toHaveProperty('items')
      expect(manualRes.body.items[0]).toHaveProperty('day')
      expect(manualRes.body.items[0]).toHaveProperty('items')

      // Check stop item schema
      expect(aiRes.body.items[0].items[0]).toHaveProperty('title')
      expect(aiRes.body.items[0].items[0]).toHaveProperty('time')
      expect(manualRes.body.items[0].items[0]).toHaveProperty('title')
      expect(manualRes.body.items[0].items[0]).toHaveProperty('time')
    })
  })

  describe('5. Realistic Travel Scenarios (Algiers, Tlemcen, Istanbul)', () => {
    it('5.1: Scenario 1 - Algiers 3-day Cultural', async () => {
      const service = new AIService()
      const res = await service.generateTripItinerary({
        city: 'Algiers',
        days: 3,
        partyType: 'Solo',
        preferences: ['Cultural']
      })

      expect(res.trip.durationDays).toBe(3)
      expect(res.trip.days).toEqual([1, 2, 3])
      expect(res.trip.items.length).toBe(3)
      res.trip.items.forEach(d => {
        expect(d.items.length).toBeGreaterThanOrEqual(2)
        d.items.forEach(item => {
          expect(item.title).toBeTruthy()
          expect(item.time).toBeTruthy()
        })
      })
    })

    it('5.2: Scenario 2 - Tlemcen 5-day Family', async () => {
      const service = new AIService()
      const res = await service.generateTripItinerary({
        city: 'Tlemcen',
        days: 5,
        partyType: 'Family',
        preferences: ['Family', 'Heritage']
      })

      expect(res.trip.durationDays).toBe(5)
      expect(res.trip.days.length).toBe(5)
      expect(res.trip.items.length).toBe(5)
    })

    it('5.3: Scenario 3 - Istanbul 7-day Mixed High Budget', async () => {
      const service = new AIService()
      const res = await service.generateTripItinerary({
        city: 'Istanbul',
        days: 7,
        budget: 'high',
        partyType: 'Couple',
        preferences: ['Mixed', 'Culinary']
      })

      expect(res.trip.durationDays).toBe(7)
      expect(res.trip.days.length).toBe(7)
      expect(res.trip.items.length).toBe(7)
    })
  })
})
