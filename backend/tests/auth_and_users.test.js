const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')

describe('Touriva User Authentication & Authorization API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('POST /api/users/login fails gracefully with 400 on wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '0770000000',
        password: 'definitely_wrong_password_123'
      })
      .expect(400)

    expect(res.body).toHaveProperty('error')
  })

  it('POST /api/users/loginWeb fails gracefully with 400 on nonexistent email', async () => {
    const res = await request(app)
      .post('/api/users/loginWeb')
      .send({
        email: 'nonexistent_user@touriva.test',
        password: 'some_password'
      })
      .expect(400)

    expect(res.body).toHaveProperty('error')
  })

  it('GET /api/users rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(401)

    expect(res.body).toHaveProperty('error')
  })
})
