const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

process.env.NODE_ENV = 'test'
process.env.SECRET = process.env.SECRET || 'marketplace_test_secret_jwt_key_2026'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop'

const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const SellerApplication = require('../models/SellerApplication')
const SellerProfile = require('../models/SellerProfile')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const Commission = require('../models/Commission')
const MarketplaceSettings = require('../models/MarketplaceSettings')

let app
let adminToken, sellerToken, customerToken
let adminUser, sellerUser, customerUser
let testCategory, testProduct

beforeAll(async () => {
  app = require('../server')
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI)
  }

  // Setup test users
  const passwordHash = await bcrypt.hash('TestPassword#2026!', 10)

  // 1. Admin (Khaled Bouafia)
  adminUser = await User.create({
    email: 'admin.market@touriva.test',
    firstName: 'Khaled',
    lastName: 'Bouafia',
    phone: '+213550999001',
    password: passwordHash,
    role: 'administrator',
    activated: true
  })
  adminToken = jwt.sign({ _id: adminUser._id, role: 'administrator' }, process.env.SECRET)

  // 2. Approved Seller
  sellerUser = await User.create({
    email: 'vendor.test@touriva.test',
    firstName: 'Tahar',
    lastName: 'Artisan',
    phone: '+213550999002',
    password: passwordHash,
    role: 'seller',
    companyName: 'Atelier Cuir Tassili',
    activated: true
  })
  sellerToken = jwt.sign({ _id: sellerUser._id, role: 'seller' }, process.env.SECRET)

  await SellerProfile.create({
    userId: sellerUser._id,
    storeName: 'Atelier Cuir Tassili',
    storeSlug: 'atelier-cuir-tassili',
    phone: '+213550999002',
    email: 'vendor.test@touriva.test',
    wilaya: 'Djanet',
    isApproved: true,
    isSuspended: false
  })

  // 3. Customer
  customerUser = await User.create({
    email: 'buyer.test@touriva.test',
    firstName: 'Amel',
    lastName: 'Client',
    phone: '+213550999003',
    password: passwordHash,
    role: 'client',
    activated: true
  })
  customerToken = jwt.sign({ _id: customerUser._id, role: 'client' }, process.env.SECRET)

  // 4. Test Category & Product
  testCategory = await Category.create({ name: 'Maroquinerie Saharienne' })
  testProduct = await Product.create({
    code: 'TEST-BAG-001',
    name: 'Sacoche Touareg en Cuir Véritable',
    price: 8500,
    description: 'Sacoche en cuir faite à la main à Djanet',
    categoryId: testCategory._id,
    sellerId: sellerUser._id,
    status: 'approved',
    published: true,
    stockQuantity: 15
  })
})

afterAll(async () => {
  // Clean test records
  await User.deleteMany({ email: { $in: ['admin.market@touriva.test', 'vendor.test@touriva.test', 'buyer.test@touriva.test'] } })
  await SellerProfile.deleteMany({ userId: sellerUser._id })
  await SellerApplication.deleteMany({ email: 'new.artisan@touriva.test' })
  await Product.deleteMany({ code: 'TEST-BAG-001' })
  await Category.deleteMany({ _id: testCategory._id })
  await Order.deleteMany({ 'customerInfo.email': 'guest.buyer@test.dz' })
  await OrderItem.deleteMany({ sellerId: sellerUser._id })
  await Commission.deleteMany({ sellerId: sellerUser._id })
  await mongoose.connection.close()
})

describe('1. Touriva Independent Marketplace — Public Storefront Endpoints', () => {
  it('GET /api/marketplace/settings returns marketplace configuration', async () => {
    const res = await request(app).get('/api/marketplace/settings')
    expect(res.status).toBe(200)
    expect(res.body.marketplaceName).toBeDefined()
    expect(Array.isArray(res.body.supportedPaymentMethods)).toBe(true)
    expect(res.body.supportedPaymentMethods).toContain('baridimob')
  })

  it('GET /api/marketplace/products returns only approved and published items', async () => {
    const res = await request(app).get('/api/marketplace/products')
    expect(res.status).toBe(200)
    expect(res.body.products).toBeDefined()
    expect(Array.isArray(res.body.products)).toBe(true)
    const allApproved = res.body.products.every(p => p.status === 'approved' && p.published === true)
    expect(allApproved).toBe(true)
  })

  it('GET /api/marketplace/products/:id returns detailed product and seller info', async () => {
    const res = await request(app).get(`/api/marketplace/products/${testProduct._id}`)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Sacoche Touareg en Cuir Véritable')
    expect(res.body.sellerProfile).toBeDefined()
    expect(res.body.sellerProfile.storeName).toBe('Atelier Cuir Tassili')
  })

  it('GET /api/marketplace/featured returns curated homepage lists', async () => {
    const res = await request(app).get('/api/marketplace/featured')
    expect(res.status).toBe(200)
    expect(res.body.featured).toBeDefined()
    expect(res.body.newArrivals).toBeDefined()
    expect(res.body.categories).toBeDefined()
  })

  it('POST /api/marketplace/sellers/apply submits a new vendor application', async () => {
    const res = await request(app)
      .post('/api/marketplace/sellers/apply')
      .send({
        storeName: 'Poterie Antique de Guelma',
        legalRepresentativeName: 'Yassine Khelifi',
        email: 'new.artisan@touriva.test',
        phone: '+213550888123',
        wilaya: 'Guelma',
        address: 'Rue des Potiers, N° 12',
        businessCategory: 'Céramique & Poterie',
        businessDescription: 'Fabrication artisanale de plats et tajines traditionnels.'
      })
    expect(res.status).toBe(201)
    expect(res.body.applicationId).toBeDefined()
    expect(res.body.status).toBe('pending')
  })

  it('POST /api/marketplace/orders processes multi-item cart and verifies pricing against DB', async () => {
    const res = await request(app)
      .post('/api/marketplace/orders')
      .send({
        items: [
          { productId: testProduct._id.toString(), quantity: 2 }
        ],
        customerInfo: {
          fullName: 'Guest Algerian Traveler',
          email: 'guest.buyer@test.dz',
          phone: '+213551234567',
          wilaya: 'Oran',
          shippingAddress: 'Front de Mer, Imm B, Apt 4'
        },
        paymentMethod: 'baridimob',
        deliveryFeeDZD: 600
      })

    expect(res.status).toBe(201)
    expect(res.body.order.orderNumber).toMatch(/^TRV-MKT-\d{4}-\d{5}$/)
    // Expected: 8500 * 2 = 17000 + 600 = 17600 DZD
    expect(res.body.order.subtotalDZD).toBe(17000)
    expect(res.body.order.totalAmountDZD).toBe(17600)
    expect(res.body.order.paymentStatus).toBe('pending_verification')
  })
})

describe('2. Touriva Independent Marketplace — Role-Based Security & RBAC Guards', () => {
  it('rejects unauthenticated requests to /api/seller/profile with 401', async () => {
    const res = await request(app).get('/api/seller/profile')
    expect(res.status).toBe(401)
  })

  it('rejects customer account from accessing seller portal with 403', async () => {
    const res = await request(app)
      .get('/api/seller/profile')
      .set('Authorization', `Bearer ${customerToken}`)
    expect(res.status).toBe(403)
  })

  it('rejects unauthenticated requests to /api/admin/marketplace/dashboard with 401', async () => {
    const res = await request(app).get('/api/admin/marketplace/dashboard')
    expect(res.status).toBe(401)
  })

  it('rejects seller account from accessing owner administration with 403', async () => {
    const res = await request(app)
      .get('/api/admin/marketplace/dashboard')
      .set('Authorization', `Bearer ${sellerToken}`)
    expect(res.status).toBe(403)
  })
})

describe('3. Touriva Independent Marketplace — Seller Portal Operations', () => {
  let createdProductId

  it('GET /api/seller/dashboard returns seller specific metrics from DB', async () => {
    const res = await request(app)
      .get('/api/seller/dashboard')
      .set('Authorization', `Bearer ${sellerToken}`)
    expect(res.status).toBe(200)
    expect(res.body.metrics.products).toBeDefined()
    expect(res.body.metrics.finances.currency).toBe('DZD')
  })

  it('POST /api/seller/products creates product scoped to seller with pending_review status', async () => {
    const res = await request(app)
      .post('/api/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Ceinture Traditionnelle Saharienne',
        price: 3200,
        description: 'Ceinture tressée en cuir avec boucle en cuivre',
        categoryId: testCategory._id,
        stockQuantity: 20
      })
    expect(res.status).toBe(201)
    expect(res.body.product.sellerId.toString()).toBe(sellerUser._id.toString())
    expect(res.body.product.status).toBe('pending_review')
    expect(res.body.product.published).toBe(false)
    createdProductId = res.body.product._id
  })

  it('prevents seller from updating product belonging to another vendor (IDOR check)', async () => {
    // Another vendor token
    const otherVendor = await User.create({
      email: 'other.vendor@test.dz',
      phone: '+213559999888',
      role: 'seller'
    })
    const otherToken = jwt.sign({ _id: otherVendor._id, role: 'seller' }, process.env.SECRET)

    const res = await request(app)
      .put(`/api/seller/products/${createdProductId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ price: 100 })

    expect(res.status).toBe(403)
    await User.findByIdAndDelete(otherVendor._id)
  })
})

describe('4. Touriva Independent Marketplace — Owner Administration & Moderation', () => {
  it('GET /api/admin/marketplace/dashboard returns complete platform KPIs', async () => {
    const res = await request(app)
      .get('/api/admin/marketplace/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.sellers).toBeDefined()
    expect(res.body.products).toBeDefined()
    expect(res.body.financials).toBeDefined()
  })

  it('PUT /api/admin/marketplace/seller-applications/:id/review approves seller application', async () => {
    const appDoc = await SellerApplication.findOne({ email: 'new.artisan@touriva.test' })
    expect(appDoc).toBeDefined()

    const res = await request(app)
      .put(`/api/admin/marketplace/seller-applications/${appDoc._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approved' })

    expect(res.status).toBe(200)
    expect(res.body.application.status).toBe('approved')
    expect(res.body.sellerProfile).toBeDefined()

    // Verify user account was created with role 'seller'
    const user = await User.findOne({ email: 'new.artisan@touriva.test' })
    expect(user).toBeDefined()
    expect(user.role).toBe('seller')
    expect(user.activated).toBe(true)

    // Cleanup
    await User.findByIdAndDelete(user._id)
    await SellerProfile.findOneAndDelete({ userId: user._id })
  })

  it('PUT /api/admin/marketplace/products/:id/moderate approves product and publishes it', async () => {
    const product = await Product.findOne({ name: 'Ceinture Traditionnelle Saharienne' })
    expect(product).toBeDefined()

    const res = await request(app)
      .put(`/api/admin/marketplace/products/${product._id}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })

    expect(res.status).toBe(200)
    expect(res.body.product.status).toBe('approved')
    expect(res.body.product.published).toBe(true)

    // Cleanup
    await Product.findByIdAndDelete(product._id)
  })

  it('GET /health and GET /api/health return 200 with database connected', async () => {
    const res1 = await request(app).get('/health')
    expect(res1.status).toBe(200)
    expect(res1.body.status).toBe('ok')
    expect(res1.body.service).toBe('touriva-shop-backend')
    expect(res1.body.database).toBe('connected')

    const res2 = await request(app).get('/api/health')
    expect(res2.status).toBe(200)
    expect(res2.body.status).toBe('ok')
    expect(res2.body.database).toBe('connected')
  })
})
