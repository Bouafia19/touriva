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
        phone: '+213550000010',
        password: 'definitely_wrong_password_123'
      })
      .expect(400)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toBe('ipass')
  })

  it('POST /api/users/login fails with 400 on nonexistent phone', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '0799999999',
        password: 'Password123!'
      })
      .expect(400)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toBe('ip')
  })

  it('POST /api/users/login succeeds for Client with international phone format (+213...)', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '+213550000010',
        password: 'Password123!'
      })
      .expect(200)

    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('user')
    expect(res.body.user.role).toBe('client')
  })

  it('POST /api/users/login succeeds for Client with local 10-digit format (0550...)', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '0550000010',
        password: 'Password123!'
      })
      .expect(200)

    expect(res.body).toHaveProperty('token')
    expect(res.body.user.email).toBe('customer@touriva.test')
  })

  it('POST /api/users/login succeeds for Partner guide with phone', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        phone: '0550000002',
        password: 'Password123!'
      })
      .expect(200)

    expect(res.body).toHaveProperty('token')
    expect(res.body.user.role).toBe('partner')
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

  it('GET /api/users rejects unauthenticated requests with 401 and Authorization token required', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(401)

    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toBe('Authorization token required')
  })

  it('GET /api/users rejects malformed token (Bearer undefined) with 401', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer undefined')
      .expect(401)

    expect(res.body.error).toBe('Authorization token required')
  })

  it('GET /api/users rejects invalid JWT with 401 request is not authorized', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer invalid.token.payload')
      .expect(401)

    expect(res.body.error).toBe('request is not authorized')
  })

  it('Protected endpoint allows access with valid JWT token', async () => {
    // 1. Sign in to obtain valid JWT
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        phone: '+213550000010',
        password: 'Password123!'
      })
      .expect(200)

    const { token, user } = loginRes.body
    expect(token).toBeTruthy()

    // 2. Access protected GET /api/users/:id
    const userRes = await request(app)
      .get(`/api/users/${user._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(userRes.body._id).toBe(user._id)
    expect(userRes.body.phone).toBe(user.phone)
  })
})
