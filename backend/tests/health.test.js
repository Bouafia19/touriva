const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')

describe('Touriva Health & System API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('GET /api/health returns 200 and Touriva service status', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200)

    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('Touriva Tourism API')
    expect(res.body.database).toBe('connected')
    expect(res.body.timestamp).toBeDefined()
  })

  it('GET /api/nonexistent-route returns 404 with JSON error', async () => {
    const res = await request(app)
      .get('/api/nonexistent-route')
      .expect(404)

    expect(res.body.error).toBe('Endpoint not found')
  })
})
