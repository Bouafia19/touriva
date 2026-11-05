const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

process.env.NODE_ENV = 'test'
process.env.SECRET = process.env.SECRET || 'marketplace_demo_users_test_secret_2026'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop_demo_users_test'

const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const SellerProfile = require('../models/SellerProfile')

let app
let adminUser, adminPassword = 'Admin#Secret2026!'
let seller1, seller1Password = 'Seller1#Pass2026!'
let seller2, seller2Password = 'Seller2#Pass2026!'
let customer1, customer1Password = 'Customer1#Pass2026!'
let customer2, customer2Password = 'Customer2#Pass2026!'
let seller1Token, seller2Token, customer1Token, customer2Token, adminToken
let categoryA, product1, product2, order1, orderItem1, orderItem2

beforeAll(async () => {
  app = require('../server')
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI)
  }

  // Clear test db
  await User.deleteMany({})
  await Product.deleteMany({})
  await Category.deleteMany({})
  await Order.deleteMany({})
  await OrderItem.deleteMany({})
  await SellerProfile.deleteMany({})

  // 1. Create Admin
  const adminHash = await bcrypt.hash(adminPassword, 10)
  adminUser = await User.create({
    email: 'admin.demo@touriva.test',
    firstName: 'Admin',
    lastName: 'Demo',
    phone: '+213550999999',
    password: adminHash,
    role: 'administrator',
    status: true,
    activated: true
  })

  // 2. Create Seller 1
  const s1Hash = await bcrypt.hash(seller1Password, 10)
  seller1 = await User.create({
    email: 'seller1.demo@touriva.test',
    firstName: 'Karim',
    lastName: 'SellerOne',
    phone: '+213550111111',
    password: s1Hash,
    role: 'seller',
    status: true,
    activated: true
  })
  await SellerProfile.create({
    userId: seller1._id,
    storeName: 'Seller One Store',
    storeSlug: 'seller-one-store',
    phone: '+213550111111',
    email: seller1.email,
    wilaya: 'Alger'
  })

  // 3. Create Seller 2
  const s2Hash = await bcrypt.hash(seller2Password, 10)
  seller2 = await User.create({
    email: 'seller2.demo@touriva.test',
    firstName: 'Nadia',
    lastName: 'SellerTwo',
    phone: '+213550222222',
    password: s2Hash,
    role: 'seller',
    status: true,
    activated: true
  })
  await SellerProfile.create({
    userId: seller2._id,
    storeName: 'Seller Two Store',
    storeSlug: 'seller-two-store',
    phone: '+213550222222',
    email: seller2.email,
    wilaya: 'Oran'
  })

  // 4. Create Customer 1
  const c1Hash = await bcrypt.hash(customer1Password, 10)
  customer1 = await User.create({
    email: 'customer1.demo@touriva.test',
    firstName: 'Lynda',
    lastName: 'BuyerOne',
    phone: '+213550333333',
    password: c1Hash,
    role: 'client',
    status: true,
    activated: true
  })

  // 5. Create Customer 2
  const c2Hash = await bcrypt.hash(customer2Password, 10)
  customer2 = await User.create({
    email: 'customer2.demo@touriva.test',
    firstName: 'Mehdi',
    lastName: 'BuyerTwo',
    phone: '+213550444444',
    password: c2Hash,
    role: 'client',
    status: true,
    activated: true
  })

  // Category
  categoryA = await Category.create({
    name: 'Crafts',
    slug: 'crafts',
    order: 1
  })

  // Products
  product1 = await Product.create({
    code: 'PRD-TEST-001',
    name: 'Handcrafted Rug',
    price: 15000,
    sellerId: seller1._id,
    categoryId: categoryA._id,
    status: 'approved',
    published: true,
    stockQuantity: 20
  })

  product2 = await Product.create({
    code: 'PRD-TEST-002',
    name: 'Silver Bracelet',
    price: 8500,
    sellerId: seller2._id,
    categoryId: categoryA._id,
    status: 'approved',
    published: true,
    stockQuantity: 15
  })

  // Order for Customer 1 with items from Seller 1 & Seller 2
  order1 = await Order.create({
    orderNumber: 'TRV-DEMO-TEST-001',
    userId: customer1._id,
    overallStatus: 'pending',
    status: 'pending',
    paymentStatus: 'pending_verification',
    paymentMethod: 'cash_on_delivery',
    totalAmountDZD: 23500
  })

  orderItem1 = await OrderItem.create({
    orderId: order1._id,
    productId: product1._id,
    sellerId: seller1._id,
    productName: 'Handcrafted Berber Rug',
    quantity: 1,
    unitPriceDZD: 15000,
    totalItemPriceDZD: 15000,
    fulfillmentStatus: 'pending'
  })

  orderItem2 = await OrderItem.create({
    orderId: order1._id,
    productId: product2._id,
    sellerId: seller2._id,
    productName: 'Desert Leather Boots',
    quantity: 1,
    unitPriceDZD: 8500,
    totalItemPriceDZD: 8500,
    fulfillmentStatus: 'pending'
  })

  order1.items = [orderItem1._id, orderItem2._id]
  await order1.save()
})

afterAll(async () => {
  await mongoose.disconnect()
})

describe('Touriva Marketplace — Demo Users & Authentication Suite', () => {

  // 1. Customer Demo Login
  describe('1. Customer Demo Authentication', () => {
    it('1.1: Customer can sign in via email and password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: customer1.email,
          password: customer1Password,
          role: 'client'
        })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe(customer1.email)
      expect(res.body.user.role).toBe('client')
      customer1Token = res.body.token
    })

    it('1.2: Customer can sign in via phone number and password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          phone: customer2.phone,
          password: customer2Password,
          role: 'client'
        })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe(customer2.email)
      customer2Token = res.body.token
    })
  })

  // 2. Seller Demo Login
  describe('2. Seller Demo Authentication', () => {
    it('2.1: Seller 1 can sign in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: seller1.email,
          password: seller1Password,
          role: 'seller'
        })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.user.role).toBe('seller')
      expect(res.body.user.email).toBe(seller1.email)
      seller1Token = res.body.token
    })

    it('2.2: Seller 2 can sign in with valid credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: seller2.email,
          password: seller2Password,
          role: 'seller'
        })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.user.role).toBe('seller')
      seller2Token = res.body.token
    })
  })

  // 3. Owner Administrator Normal Login
  describe('3. Owner Administrator Authentication', () => {
    it('3.1: Admin can sign in using normal secure login', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: adminUser.email,
          password: adminPassword,
          role: 'administrator'
        })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.user.role).toBe('administrator')
      adminToken = res.body.token
    })
  })

  // 4. Invalid Credentials & Security Controls
  describe('4. Credentials Validation & Password Security', () => {
    it('4.1: Rejects login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: customer1.email,
          password: 'WrongPassword#999'
        })
        .expect(400)

      expect(res.body.error).toBeDefined()
      expect(res.body.token).toBeUndefined()
    })

    it('4.2: Rejects login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@touriva.test',
          password: 'Password123!'
        })
        .expect(400)

      expect(res.body.error).toBeDefined()
      expect(res.body.token).toBeUndefined()
    })

    it('4.3: Passwords in database use salted bcrypt hash', async () => {
      const dbUser = await User.findById(adminUser._id).select('+password')
      expect(dbUser.password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/)
      expect(dbUser.password).not.toBe(adminPassword)
    })
  })

  // 5. Role Enforcement & Access Control
  describe('5. RBAC & Cross-Role Isolation', () => {
    it('5.1: Customer cannot access seller dashboard endpoint', async () => {
      await request(app)
        .get('/api/seller/dashboard')
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(403)
    })

    it('5.2: Customer cannot access marketplace admin settings', async () => {
      await request(app)
        .get('/api/admin/marketplace/settings')
        .set('Authorization', `Bearer ${customer1Token}`)
        .expect(403)
    })

    it('5.3: Seller cannot access marketplace admin applications', async () => {
      await request(app)
        .get('/api/admin/marketplace/applications')
        .set('Authorization', `Bearer ${seller1Token}`)
        .expect(403)
    })
  })

  // 6. Data Isolation
  describe('6. Data & Resource Isolation', () => {
    it('6.1: Seller 1 cannot edit or delete Seller 2 product (IDOR prevention)', async () => {
      await request(app)
        .put(`/api/seller/products/${product2._id}`)
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({ name: 'Tampered Rug' })
        .expect(403)

      await request(app)
        .delete(`/api/seller/products/${product2._id}`)
        .set('Authorization', `Bearer ${seller1Token}`)
        .expect(403)
    })

    it('6.2: Seller 1 only sees Seller 1 products in catalog list', async () => {
      const res = await request(app)
        .get('/api/seller/products')
        .set('Authorization', `Bearer ${seller1Token}`)
        .expect(200)

      expect(res.body.products).toBeDefined()
      expect(res.body.products.length).toBe(1)
      expect(res.body.products[0]._id.toString()).toBe(product1._id.toString())
    })

    it('6.3: Seller 1 cannot update Seller 2 order item fulfillment', async () => {
      await request(app)
        .put(`/api/seller/orders/${orderItem2._id}/fulfillment`)
        .set('Authorization', `Bearer ${seller1Token}`)
        .send({ fulfillmentStatus: 'shipped' })
        .expect(403)
    })

    it('6.4: Customer 2 cannot access Customer 1 orders by user ID', async () => {
      await request(app)
        .get(`/api/orders/getOrdersByUserId/${customer1._id}`)
        .set('Authorization', `Bearer ${customer2Token}`)
        .expect(403)
    })
  })

  // 7. Token Security & Expiration
  describe('7. JWT Security & Expiration', () => {
    it('7.1: Rejects expired JWT token', async () => {
      const expiredToken = jwt.sign(
        { _id: customer1._id, role: 'client' },
        process.env.SECRET,
        { expiresIn: '-1s' }
      )

      await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
    })

    it('7.2: Rejects tampered JWT token', async () => {
      const tamperedToken = customer1Token.slice(0, -6) + 'xxxxxx'
      await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401)
    })
  })

  // 8. Demo Login Bypass Restriction
  describe('8. Demo Login Restriction & Anti-Bypass', () => {
    it('8.1: Prohibits administrator demo login bypass (SEC-01)', async () => {
      await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'admin', role: 'administrator' })
        .expect(res => {
          // In test environment, must return 403 (blocked); in production, returns 404
          expect([403, 404]).toContain(res.status)
        })
    })

    it('8.2: Disables demo login completely in production mode (NODE_ENV=production)', async () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      try {
        await request(app)
          .post('/api/users/demo-login')
          .send({ demoType: 'buyer1', role: 'client' })
          .expect(404)
      } finally {
        process.env.NODE_ENV = originalEnv
      }
    })
  })
})
