const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')
const Product = require('../models/Product')
const Order = require('../models/Order')

describe('Touriva Shop Endpoints', () => {
  let createdProductId = null

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }
  })

  afterAll(async () => {
    if (createdProductId) {
      await Product.findByIdAndDelete(createdProductId)
    }
    await mongoose.connection.close()
  })

  it('GET /api/products returns array of products', async () => {
    const res = await request(app).get('/api/products')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('POST /api/products creates a product or validates schema', async () => {
    const testCode = 'TEST_PROD_' + Date.now()
    const res = await request(app)
      .post('/api/products')
      .send({
        code: testCode,
        name: 'Artisan Ceramic Tagine',
        price: 4500,
        description: 'Handcrafted ceramic tagine from Constantine'
      })
    expect([200, 201]).toContain(res.status)
    expect(res.body.code).toBe(testCode)
    createdProductId = res.body._id
  })

  it('GET /api/products/:id retrieves the created product', async () => {
    if (!createdProductId) return
    const res = await request(app).get(`/api/products/${createdProductId}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Artisan Ceramic Tagine')
  })

  it('GET /api/orders rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/orders')
    expect(res.status).toBe(401)
  })

  it('POST /api/orders rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        productId: createdProductId || new mongoose.Types.ObjectId(),
        amount: 4500
      })
    expect(res.status).toBe(401)
  })

  it('DELETE /api/products/:id cleans up test product', async () => {
    if (!createdProductId) return
    const res = await request(app).delete(`/api/products/${createdProductId}`)
    expect(res.status).toBe(200)
    createdProductId = null
  })
})
