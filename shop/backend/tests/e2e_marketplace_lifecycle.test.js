const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

process.env.NODE_ENV = 'test'
process.env.SECRET = process.env.SECRET || 'marketplace_e2e_lifecycle_secret_2026'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop_audit_isolated'

const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const SellerApplication = require('../models/SellerApplication')
const SellerProfile = require('../models/SellerProfile')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const AuditLog = require('../models/AuditLog')

let app
let adminUser, adminToken
let customerToken, customerUser
let sellerToken, sellerUser
let testCategory
let createdProductId
let createdApplicationId
let createdOrderId, createdOrderItemId

beforeAll(async () => {
  app = require('../server')
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI)
  }

  // Setup platform administrator
  const passwordHash = await bcrypt.hash('AdminSecret#2026!', 10)
  adminUser = await User.create({
    email: 'admin.e2e@touriva.test',
    firstName: 'Platform',
    lastName: 'Director',
    phone: '+213550099111',
    password: passwordHash,
    role: 'administrator',
    activated: true
  })
  adminToken = jwt.sign({ _id: adminUser._id, role: 'administrator' }, process.env.SECRET)

  testCategory = await Category.create({ name: 'Tapis & Tissages du Sud' })
})

afterAll(async () => {
  await User.deleteMany({ email: { $in: [
    'admin.e2e@touriva.test',
    'customer.e2e@touriva.test',
    'artisan.ghardaia@touriva.test'
  ] } })
  await SellerProfile.deleteMany({ email: 'artisan.ghardaia@touriva.test' })
  await SellerApplication.deleteMany({ email: 'artisan.ghardaia@touriva.test' })
  if (createdProductId) await Product.findByIdAndDelete(createdProductId)
  if (testCategory) await Category.findByIdAndDelete(testCategory._id)
  await Order.deleteMany({ 'customerInfo.email': 'customer.e2e@touriva.test' })
  await OrderItem.deleteMany({ productName: 'Tapis Berbère Authentique de Ghardaïa' })
  await AuditLog.deleteMany({ 'details.storeName': 'Atelier Berbère Mzab' })
  await mongoose.connection.close()
})

describe('Touriva Marketplace — 14-Step Complete Lifecycle E2E Acceptance Suite', () => {

  // STEP 1: Customer Registration and Authentication
  it('Step 1: Customer registers and logs in', async () => {
    // 1.1 Customer Registration
    const signupRes = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'customer.e2e@touriva.test',
        firstName: 'Farida',
        lastName: 'Benali',
        phone: '+213550111222',
        password: 'CustomerPass#2026',
        role: 'client'
      })

    expect(signupRes.status).toBe(200)
    expect(signupRes.body.token).toBeDefined()
    expect(signupRes.body.user.role).toBe('client')

    // 1.2 Customer Login with Credentials
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'customer.e2e@touriva.test',
        password: 'CustomerPass#2026'
      })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.token).toBeDefined()
    customerToken = loginRes.body.token
    customerUser = loginRes.body.user
  })

  // STEP 2: Seller Registration (Application Submission)
  it('Step 2: Artisan submits a vendor application', async () => {
    const res = await request(app)
      .post('/api/marketplace/sellers/apply')
      .send({
        storeName: 'Atelier Berbère Mzab',
        legalRepresentativeName: 'Slimane Babaz',
        email: 'artisan.ghardaia@touriva.test',
        phone: '+213550333444',
        wilaya: 'Ghardaïa',
        address: 'Rue de la Grande Mosquée, Beni Isguen',
        businessCategory: 'Tapis Traditionnels',
        businessDescription: 'Coopérative artisanale spécialisée dans le tissage traditionnel de laine naturelle.',
        rcNumber: '26/00-1234567B22',
        nifNumber: '002247012345678'
      })

    expect(res.status).toBe(201)
    expect(res.body.applicationId).toBeDefined()
    expect(res.body.status).toBe('pending')
    createdApplicationId = res.body.applicationId
  })

  // STEP 3: Owner Approval of Seller Application
  it('Step 3: Platform Owner reviews and approves vendor application', async () => {
    const res = await request(app)
      .put(`/api/admin/marketplace/seller-applications/${createdApplicationId}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        decision: 'approved',
        commissionRatePercent: 8,
        moderationNotes: 'Dossier artisanal complet et vérifié.'
      })

    expect(res.status).toBe(200)
    expect(res.body.application.status).toBe('approved')
    expect(res.body.sellerProfile).toBeDefined()
    expect(res.body.sellerProfile.storeName).toBe('Atelier Berbère Mzab')

    // Verify user account exists with role 'seller'
    sellerUser = await User.findOne({ email: 'artisan.ghardaia@touriva.test' })
    expect(sellerUser).toBeDefined()
    expect(sellerUser.role).toBe('seller')
    expect(sellerUser.activated).toBe(true)

    // Generate seller token for subsequent vendor portal actions
    sellerToken = jwt.sign({ _id: sellerUser._id, role: 'seller' }, process.env.SECRET)
  })

  // STEP 4: Seller Product Creation
  it('Step 4: Seller creates a handcrafted product (pending review)', async () => {
    const res = await request(app)
      .post('/api/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Tapis Berbère Authentique de Ghardaïa',
        price: 14000,
        discountPrice: 13500,
        description: 'Tapis en pure laine de brebis, tissé à la main selon les motifs traditionnels du Mzab (200x140 cm).',
        categoryId: testCategory._id,
        stockQuantity: 8,
        features: ['100% Laine Vierge', 'Teinture Naturelle', 'Fait Main']
      })

    expect(res.status).toBe(201)
    expect(res.body.product.name).toBe('Tapis Berbère Authentique de Ghardaïa')
    expect(res.body.product.status).toBe('pending_review')
    expect(res.body.product.published).toBe(false)
    expect(res.body.product.sellerId.toString()).toBe(sellerUser._id.toString())
    createdProductId = res.body.product._id
  })

  // STEP 5: Owner Product Moderation & Publishing
  it('Step 5: Platform Owner moderates and approves product', async () => {
    const res = await request(app)
      .put(`/api/admin/marketplace/products/${createdProductId}/moderate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'approved',
        moderationNotes: 'Produit authentique conforme aux standards de qualité Touriva.'
      })

    expect(res.status).toBe(200)
    expect(res.body.product.status).toBe('approved')
    expect(res.body.product.published).toBe(true)

    const dbProd = await Product.findById(createdProductId)
    expect(dbProd.published).toBe(true)
    expect(dbProd.status).toBe('approved')
  })

  // STEP 6: Customer Catalog Browsing
  it('Step 6: Customer discovers approved product in public storefront', async () => {
    // 6.1 Catalog search
    const listRes = await request(app)
      .get('/api/marketplace/products')
      .query({ search: 'Ghardaïa' })

    expect(listRes.status).toBe(200)
    expect(Array.isArray(listRes.body.products)).toBe(true)
    const found = listRes.body.products.find(p => p._id.toString() === createdProductId.toString())
    expect(found).toBeDefined()

    // 6.2 Product detail page
    const detailRes = await request(app)
      .get(`/api/marketplace/products/${createdProductId}`)

    expect(detailRes.status).toBe(200)
    expect(detailRes.body.name).toBe('Tapis Berbère Authentique de Ghardaïa')
    expect(detailRes.body.sellerProfile.storeName).toBe('Atelier Berbère Mzab')
    expect(detailRes.body.stockQuantity).toBe(8)
  })

  // STEP 7 & 8: Cart Checkout and Order Creation
  it('Step 7 & 8: Customer places order with pricing validation', async () => {
    const res = await request(app)
      .post('/api/marketplace/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          { productId: createdProductId.toString(), quantity: 2 }
        ],
        customerInfo: {
          fullName: 'Farida Benali',
          email: 'customer.e2e@touriva.test',
          phone: '+213550111222',
          wilaya: 'Alger',
          city: 'Kouba',
          shippingAddress: 'Rue des Frères Abdeslami, N° 14',
          notes: 'Sonner à l’interphone Benali svp.'
        },
        paymentMethod: 'cash_on_delivery',
        deliveryFeeDZD: 600
      })

    expect(res.status).toBe(201)
    expect(res.body.order.orderNumber).toMatch(/^TRV-MKT-\d{4}-\d{5}$/)
    // Price: discountPrice 13500 * 2 = 27000 + 600 = 27600 DZD
    expect(res.body.order.subtotalDZD).toBe(27000)
    expect(res.body.order.totalAmountDZD).toBe(27600)
    expect(res.body.order.paymentStatus).toBe('pending_verification')
    expect(res.body.order.overallStatus).toBe('pending')

    createdOrderId = res.body.order.id
  })

  // STEP 9: Inventory Decrement Verification
  it('Step 9: Inventory is atomically decremented in database', async () => {
    const product = await Product.findById(createdProductId)
    // Started at 8, ordered 2 -> must be exactly 6
    expect(product.stockQuantity).toBe(6)
  })

  // STEP 10: Seller Order Management & Fulfillment Progression
  it('Step 10: Seller views order item and progresses fulfillment status', async () => {
    // 10.1 Seller views orders
    const ordersRes = await request(app)
      .get('/api/seller/orders')
      .set('Authorization', `Bearer ${sellerToken}`)

    expect(ordersRes.status).toBe(200)
    expect(Array.isArray(ordersRes.body.orderItems)).toBe(true)
    const myItem = ordersRes.body.orderItems.find(i => (i.productId._id || i.productId).toString() === createdProductId.toString())
    expect(myItem).toBeDefined()
    expect(myItem.quantity).toBe(2)
    createdOrderItemId = myItem._id

    // 10.2 Seller updates fulfillment status to 'preparing'
    const procRes = await request(app)
      .put(`/api/seller/orders/${createdOrderItemId}/fulfillment`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        fulfillmentStatus: 'preparing',
        shippingCarrier: 'Yalidine Express',
        trackingNumber: 'DZ-YAL-2026-9901'
      })

    expect(procRes.status).toBe(200)
    expect(procRes.body.orderItem.fulfillmentStatus).toBe('preparing')

    // 10.3 Seller updates fulfillment status to 'shipped'
    const shipRes = await request(app)
      .put(`/api/seller/orders/${createdOrderItemId}/fulfillment`)
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        fulfillmentStatus: 'shipped',
        trackingNumber: 'DZ-YAL-2026-9901'
      })

    expect(shipRes.status).toBe(200)
    expect(shipRes.body.orderItem.fulfillmentStatus).toBe('shipped')
  })

  // STEP 11: Order Cancellation
  it('Step 11: Order is cancelled via authorized route', async () => {
    const cancelRes = await request(app)
      .patch(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        overallStatus: 'cancelled',
        cancellationReason: 'Client requested cancellation before final courier dispatch.'
      })

    expect(cancelRes.status).toBe(200)
    const order = await Order.findById(createdOrderId)
    expect(order.overallStatus).toBe('cancelled')
  })

  // STEP 12: Inventory Restoration Verification
  it('Step 12: Inventory is automatically replenished back into catalog', async () => {
    const product = await Product.findById(createdProductId)
    // 6 + 2 restored = exactly 8
    expect(product.stockQuantity).toBe(8)
  })

  // STEP 13: Customer Order History Verification
  it('Step 13: Customer order history reflects updated cancelled state', async () => {
    const res = await request(app)
      .get('/api/marketplace/orders/my')
      .set('Authorization', `Bearer ${customerToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    const order = res.body.find(o => o._id.toString() === createdOrderId.toString())
    expect(order).toBeDefined()
    expect(order.overallStatus).toBe('cancelled')
  })

  // STEP 14: Owner Administration KPIs & Audit Trail
  it('Step 14: Platform Owner administration reflects complete platform metrics and audit logs', async () => {
    // 14.1 Dashboard KPIs
    const dashRes = await request(app)
      .get('/api/admin/marketplace/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(dashRes.status).toBe(200)
    expect(dashRes.body.sellers).toBeDefined()
    expect(dashRes.body.products).toBeDefined()
    expect(dashRes.body.orders).toBeDefined()

    // 14.2 Audit Trail Verification
    const auditRes = await request(app)
      .get('/api/admin/marketplace/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(auditRes.status).toBe(200)
    expect(Array.isArray(auditRes.body.logs)).toBe(true)
    const hasAppReviewed = auditRes.body.logs.some(l => l.action === 'SELLER_APPLICATION_APPROVED')
    const hasProdApproved = auditRes.body.logs.some(l => l.action === 'PRODUCT_MODERATED_APPROVED')
    expect(hasAppReviewed).toBe(true)
    expect(hasProdApproved).toBe(true)
  })
})
