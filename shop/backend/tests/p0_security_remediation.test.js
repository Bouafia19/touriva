const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

process.env.NODE_ENV = 'test'
process.env.SECRET = process.env.SECRET || 'marketplace_p0_security_test_secret_2026'
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva_shop_audit_isolated'

const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')

let app
let adminUser, adminToken
let sellerA, sellerAToken
let sellerB, sellerBToken
let customerA, customerAToken
let customerB, customerBToken
let testCategory
let productA, productB

beforeAll(async () => {
  app = require('../server')
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI)
  }

  const passwordHash = await bcrypt.hash('SecurePass#2026!', 10)

  // 1. Administrator
  adminUser = await User.create({
    email: 'admin.sec@touriva.test',
    firstName: 'Admin',
    lastName: 'Security',
    phone: '+213550001001',
    password: passwordHash,
    role: 'administrator',
    activated: true
  })
  adminToken = jwt.sign({ _id: adminUser._id, role: 'administrator' }, process.env.SECRET)

  // 2. Seller A
  sellerA = await User.create({
    email: 'seller.a@touriva.test',
    firstName: 'Seller',
    lastName: 'Alpha',
    phone: '+213550001002',
    password: passwordHash,
    role: 'seller',
    companyName: 'Boutique Alpha',
    activated: true
  })
  sellerAToken = jwt.sign({ _id: sellerA._id, role: 'seller' }, process.env.SECRET)

  // 3. Seller B
  sellerB = await User.create({
    email: 'seller.b@touriva.test',
    firstName: 'Seller',
    lastName: 'Beta',
    phone: '+213550001003',
    password: passwordHash,
    role: 'seller',
    companyName: 'Boutique Beta',
    activated: true
  })
  sellerBToken = jwt.sign({ _id: sellerB._id, role: 'seller' }, process.env.SECRET)

  // 4. Customer A
  customerA = await User.create({
    email: 'customer.a@touriva.test',
    firstName: 'Customer',
    lastName: 'Alpha',
    phone: '+213550001004',
    password: passwordHash,
    role: 'client',
    activated: true
  })
  customerAToken = jwt.sign({ _id: customerA._id, role: 'client' }, process.env.SECRET)

  // 5. Customer B
  customerB = await User.create({
    email: 'customer.b@touriva.test',
    firstName: 'Customer',
    lastName: 'Beta',
    phone: '+213550001005',
    password: passwordHash,
    role: 'client',
    activated: true
  })
  customerBToken = jwt.sign({ _id: customerB._id, role: 'client' }, process.env.SECRET)

  // 6. Test Category
  testCategory = await Category.create({ name: 'Secured Test Category' })

  // 7. Product belonging to Seller A
  productA = await Product.create({
    code: 'SEC-PROD-A',
    name: 'Artisan Bag Alpha',
    price: 5000,
    categoryId: testCategory._id,
    sellerId: sellerA._id,
    status: 'approved',
    published: true,
    stockQuantity: 10
  })

  // 8. Product belonging to Seller B
  productB = await Product.create({
    code: 'SEC-PROD-B',
    name: 'Ceramic Pot Beta',
    price: 3000,
    categoryId: testCategory._id,
    sellerId: sellerB._id,
    status: 'approved',
    published: true,
    stockQuantity: 5
  })
})

afterAll(async () => {
  await User.deleteMany({ email: { $in: [
    'admin.sec@touriva.test',
    'seller.a@touriva.test',
    'seller.b@touriva.test',
    'customer.a@touriva.test',
    'customer.b@touriva.test',
    'new.hashed@touriva.test',
    'legacy.plain@touriva.test',
    'attacker.signup@touriva.test'
  ] } })
  await Product.deleteMany({ code: { $in: ['SEC-PROD-A', 'SEC-PROD-B', 'SEC-CONCUR-01'] } })
  await Product.deleteMany({ code: { $regex: /^SEC-RESTORE/ } })
  await Category.deleteMany({ _id: testCategory._id })
  await Order.deleteMany({ 'customerInfo.phone': { $regex: /^\+21355000/ } })
  await OrderItem.deleteMany({ sellerId: { $in: [sellerA._id, sellerB._id] } })
  await mongoose.connection.close()
})

describe('P0 SEC-01: Production Demo Backdoor & Administrator Generation Defense', () => {
  const originalEnv = process.env.NODE_ENV
  const originalDemoFlag = process.env.ENABLE_DEMO_LOGIN

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
    process.env.ENABLE_DEMO_LOGIN = originalDemoFlag
  })

  it('1.1 returns HTTP 404 when NODE_ENV is production', async () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_DEMO_LOGIN = 'true'

    const res = await request(app)
      .post('/api/users/demo-login')
      .send({ demoType: 'buyer1' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Endpoint not found')
  })

  it('1.2 returns HTTP 404 when ENABLE_DEMO_LOGIN is not true', async () => {
    process.env.NODE_ENV = 'development'
    delete process.env.ENABLE_DEMO_LOGIN

    const res = await request(app)
      .post('/api/users/demo-login')
      .send({ demoType: 'buyer1' })

    expect(res.status).toBe(404)
    expect(res.body.error).toBe('Endpoint not found')
  })

  it('1.3 strictly rejects demoType=admin with HTTP 403 Forbidden', async () => {
    process.env.NODE_ENV = 'development'
    process.env.ENABLE_DEMO_LOGIN = 'true'

    const res = await request(app)
      .post('/api/users/demo-login')
      .send({ demoType: 'admin' })

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/Administrator demo authentication is strictly prohibited/i)
  })

  it('1.4 strictly rejects demoType=administrator with HTTP 403 Forbidden', async () => {
    process.env.NODE_ENV = 'development'
    process.env.ENABLE_DEMO_LOGIN = 'true'

    const res = await request(app)
      .post('/api/users/demo-login')
      .send({ demoType: 'administrator' })

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/Administrator demo authentication is strictly prohibited/i)
  })

  it('1.5 strictly rejects any request specifying role=administrator with HTTP 403', async () => {
    process.env.NODE_ENV = 'development'
    process.env.ENABLE_DEMO_LOGIN = 'true'

    const res = await request(app)
      .post('/api/users/demo-login')
      .send({ demoType: 'seller1', role: 'administrator' })

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/Administrator demo authentication is strictly prohibited/i)
  })
})

describe('P0 SEC-02: Password Hashing, Safe Storage & Transparent Legacy Migration', () => {
  it('2.1 persists bcrypt hash on signup and never plaintext', async () => {
    const rawPassword = 'SecureSecretPassword#123'
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'new.hashed@touriva.test',
        firstName: 'New',
        lastName: 'User',
        phone: '+213550001006',
        password: rawPassword,
        role: 'client'
      })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    expect(res.body.user).toBeDefined()
    // Password must NEVER be returned in response payload
    expect(res.body.user.password).toBeUndefined()
    expect(res.body.password).toBeUndefined()

    // Inspect database record directly with .select('+password')
    const storedUser = await User.findOne({ email: 'new.hashed@touriva.test' }).select('+password')
    expect(storedUser).toBeDefined()
    expect(storedUser.password).not.toBe(rawPassword)
    // bcrypt format: $2a$, $2b$, or $2y$ followed by cost factor 10
    expect(storedUser.password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/)
  })

  it('2.2 authenticates successfully with correct password and rejects incorrect password', async () => {
    // Correct credentials
    const validRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'new.hashed@touriva.test',
        password: 'SecureSecretPassword#123'
      })
    expect(validRes.status).toBe(200)
    expect(validRes.body.token).toBeDefined()

    // Incorrect password
    const invalidRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'new.hashed@touriva.test',
        password: 'WrongPassword#999'
      })
    expect(invalidRes.status).toBe(400)
    expect(invalidRes.body.error).toMatch(/invalid email or password/i)
  })

  it('2.3 performs transparent on-login migration for pre-existing legacy plaintext passwords', async () => {
    const legacyPlaintext = 'OldUnencryptedPass2025!'
    // Directly insert legacy user with unhashed plaintext password in database
    const legacyUser = await User.create({
      email: 'legacy.plain@touriva.test',
      firstName: 'Legacy',
      lastName: 'Account',
      phone: '+213550001007',
      password: legacyPlaintext,
      role: 'client',
      activated: true
    })

    // Verify it is stored as plaintext before migration
    const beforeLogin = await User.findById(legacyUser._id).select('+password')
    expect(beforeLogin.password).toBe(legacyPlaintext)

    // User logs in normally with their existing password
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: 'legacy.plain@touriva.test',
        password: legacyPlaintext
      })

    expect(loginRes.status).toBe(200)
    expect(loginRes.body.token).toBeDefined()

    // Verify transparent migration upgraded DB password to bcrypt hash
    const afterLogin = await User.findById(legacyUser._id).select('+password')
    expect(afterLogin.password).not.toBe(legacyPlaintext)
    expect(afterLogin.password).toMatch(/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/)

    // Subsequent login succeeds using the migrated hash
    const secondLogin = await request(app)
      .post('/api/users/login')
      .send({
        email: 'legacy.plain@touriva.test',
        password: legacyPlaintext
      })
    expect(secondLogin.status).toBe(200)
  })

  it('2.4 prevents privilege escalation during signup (strictly rejects administrator self-assignment with 403)', async () => {
    // Standard signup route strictly rejects administrator role with 403
    const res1 = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'attacker.signup@touriva.test',
        firstName: 'Malicious',
        lastName: 'Actor',
        phone: '+213550001008',
        password: 'Pass#Attacker2026',
        role: 'administrator'
      })

    expect(res1.status).toBe(403)
    expect(res1.body.error).toMatch(/Self-assignment of administrator/i)

    // Web signup route also strictly rejects administrator with 403
    const res2 = await request(app)
      .post('/api/users/signupUserWeb')
      .send({
        email: 'attacker.web@touriva.test',
        firstName: 'Malicious',
        lastName: 'Web',
        phone: '+213550001009',
        password: 'Pass#Attacker2026',
        role: 'administrator'
      })
    expect(res2.status).toBe(403)
    expect(res2.body.error).toMatch(/Self-assignment of administrator/i)
  })

  it('2.5 loginUserWeb rejects missing password with 400', async () => {
    const res = await request(app)
      .post('/api/users/loginWeb')
      .send({
        phone: '+213550001004'
        // password omitted
      })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Phone and password are required/i)
  })
})

describe('P0 SEC-03: Customer Order PII Protection & Access Control', () => {
  let guestOrderId, guestAccessToken, authenticatedOrderId

  beforeAll(async () => {
    // 1. Create a guest order
    const guestRes = await request(app)
      .post('/api/marketplace/orders')
      .send({
        items: [{ productId: productA._id.toString(), quantity: 1 }],
        customerInfo: {
          fullName: 'Guest Confidential Customer',
          email: 'guest.order@touriva.test',
          phone: '+213550002001',
          wilaya: 'Algiers',
          shippingAddress: 'Secret Address 123'
        },
        paymentMethod: 'baridimob'
      })

    expect(guestRes.status).toBe(201)
    guestOrderId = guestRes.body.order.id
    guestAccessToken = guestRes.body.order.guestAccessToken
    expect(guestAccessToken).toBeDefined()

    // 2. Create an authenticated order for Customer A (items from Seller A & Seller B)
    const authRes = await request(app)
      .post('/api/marketplace/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        items: [
          { productId: productA._id.toString(), quantity: 1 },
          { productId: productB._id.toString(), quantity: 1 }
        ],
        customerInfo: {
          fullName: 'Customer Alpha Private',
          email: 'customer.a@touriva.test',
          phone: '+213550002002',
          wilaya: 'Oran',
          shippingAddress: 'Customer Alpha Home, Rue 4'
        },
        paymentMethod: 'cash_on_delivery'
      })

    expect(authRes.status).toBe(201)
    authenticatedOrderId = authRes.body.order.id
  })

  it('3.1 rejects unauthenticated order access without guest token with HTTP 401', async () => {
    const res = await request(app).get(`/api/marketplace/orders/${guestOrderId}`)
    expect(res.status).toBe(401)
    expect(res.body.customerInfo).toBeUndefined()
  })

  it('3.2 rejects invalid/tampered guest token with HTTP 403 Forbidden', async () => {
    const res = await request(app).get(`/api/marketplace/orders/${guestOrderId}?token=invalid_forged_guest_token_12345`)
    expect(res.status).toBe(403)
    expect(res.body.customerInfo).toBeUndefined()
  })

  it('3.3 allows guest order access with valid cryptographic token', async () => {
    const res = await request(app).get(`/api/marketplace/orders/${guestOrderId}?token=${guestAccessToken}`)
    expect(res.status).toBe(200)
    expect(res.body.customerInfo.fullName).toBe('Guest Confidential Customer')
    expect(res.body.customerInfo.shippingAddress).toBe('Secret Address 123')
    // Token hash itself must never be exposed
    expect(res.body.guestAccessTokenHash).toBeUndefined()
  })

  it('3.4 Customer B cannot view Customer A order (HTTP 403 IDOR prevention)', async () => {
    const res = await request(app)
      .get(`/api/marketplace/orders/${authenticatedOrderId}`)
      .set('Authorization', `Bearer ${customerBToken}`)

    expect(res.status).toBe(403)
    expect(res.body.customerInfo).toBeUndefined()
  })

  it('3.5 Customer A can view their own order details', async () => {
    const res = await request(app)
      .get(`/api/marketplace/orders/${authenticatedOrderId}`)
      .set('Authorization', `Bearer ${customerAToken}`)

    expect(res.status).toBe(200)
    expect(res.body.customerInfo.fullName).toBe('Customer Alpha Private')
    expect(res.body.items.length).toBe(2)
  })

  it('3.6 Administrator can view any order details', async () => {
    const res = await request(app)
      .get(`/api/marketplace/orders/${authenticatedOrderId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.customerInfo.fullName).toBe('Customer Alpha Private')
  })

  it('3.7 multi-vendor scoping: Seller A only sees items belonging to Seller A', async () => {
    const res = await request(app)
      .get(`/api/marketplace/orders/${authenticatedOrderId}`)
      .set('Authorization', `Bearer ${sellerAToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.items)).toBe(true)
    // Must contain Seller A's item but NOT Seller B's item
    expect(res.body.items.length).toBe(1)
    expect(res.body.items[0].productName).toBe('Artisan Bag Alpha')
    expect(res.body.items[0].sellerId.toString()).toBe(sellerA._id.toString())
  })

  it('3.8 Seller with no items in an order is forbidden from viewing it (HTTP 403)', async () => {
    // Seller B has no items in guestOrderId (which only contains Product A)
    const res = await request(app)
      .get(`/api/marketplace/orders/${guestOrderId}`)
      .set('Authorization', `Bearer ${sellerBToken}`)

    expect(res.status).toBe(403)
  })

  it('3.9 submitPaymentProof requires authentication or valid guest token', async () => {
    // Unauthenticated without token
    const unauthRes = await request(app)
      .post(`/api/marketplace/orders/${guestOrderId}/payment-proof`)
      .send({ transactionReference: 'BM-123456789' })
    expect(unauthRes.status).toBe(401)

    // With valid guest token
    const guestProofRes = await request(app)
      .post(`/api/marketplace/orders/${guestOrderId}/payment-proof?token=${guestAccessToken}`)
      .send({ transactionReference: 'BM-123456789' })
    expect(guestProofRes.status).toBe(200)
    expect(guestProofRes.body.paymentProof).toBeDefined()
    expect(guestProofRes.body.paymentProof.transactionReference).toBe('BM-123456789')
  })
})

describe('P0 SEC-04: Seller Product Isolation on Legacy Routes', () => {
  it('4.1 Seller B cannot update Seller A product via PATCH /api/products/:id (HTTP 403)', async () => {
    const res = await request(app)
      .patch(`/api/products/${productA._id}`)
      .set('Authorization', `Bearer ${sellerBToken}`)
      .send({ price: 99999, name: 'Hacked Alpha Bag' })

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/cannot modify products belonging to another seller/i)

    // Verify DB was unchanged
    const unchanged = await Product.findById(productA._id)
    expect(unchanged.name).toBe('Artisan Bag Alpha')
    expect(unchanged.price).toBe(5000)
  })

  it('4.2 Seller B cannot delete Seller A product via DELETE /api/products/:id (HTTP 403)', async () => {
    const res = await request(app)
      .delete(`/api/products/${productA._id}`)
      .set('Authorization', `Bearer ${sellerBToken}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toMatch(/cannot delete products belonging to another seller/i)

    // Verify product was not archived/deleted
    const unchanged = await Product.findById(productA._id)
    expect(unchanged.status).toBe('approved')
  })

  it('4.3 Seller A can update their own product via legacy PATCH /api/products/:id', async () => {
    const res = await request(app)
      .patch(`/api/products/${productA._id}`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({ name: 'Artisan Bag Alpha Updated', price: 5500 })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Artisan Bag Alpha Updated')
    expect(res.body.price).toBe(5500)
  })

  it('4.4 Seller A cannot escalate status to approved or change sellerId via PATCH /api/products/:id', async () => {
    // Seller sets rejected or pending
    const res = await request(app)
      .patch(`/api/products/${productA._id}`)
      .set('Authorization', `Bearer ${sellerAToken}`)
      .send({
        status: 'approved',
        sellerId: adminUser._id,
        submitForReview: true
      })

    expect(res.status).toBe(200)
    const product = await Product.findById(productA._id)
    // sellerId must remain Seller A's ID
    expect(product.sellerId.toString()).toBe(sellerA._id.toString())
    // Non-admin seller cannot self-approve
    expect(product.status).toBe('pending_review')
  })

  it('4.5 Administrator can update and archive any seller product', async () => {
    // Admin update
    const updateRes = await request(app)
      .patch(`/api/products/${productA._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved', published: true, name: 'Artisan Bag Alpha Approved' })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.status).toBe('approved')

    // Create temporary product for admin deletion test
    const tempProduct = await Product.create({
      code: 'SEC-TEMP-DEL',
      name: 'Temp Product For Admin Delete',
      price: 1000,
      categoryId: testCategory._id,
      sellerId: sellerA._id,
      status: 'approved',
      published: true,
      stockQuantity: 2
    })

    const deleteRes = await request(app)
      .delete(`/api/products/${tempProduct._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(deleteRes.status).toBe(200)
    const archived = await Product.findById(tempProduct._id)
    expect(archived.status).toBe('archived')
    await Product.findByIdAndDelete(tempProduct._id)
  })
})

describe('P0 BUS-01 & DB Integrity: Atomic Stock Management & Concurrency', () => {
  let concurProduct

  beforeAll(async () => {
    concurProduct = await Product.create({
      code: 'SEC-CONCUR-01',
      name: 'Limited Edition Touareg Pendant',
      price: 2500,
      categoryId: testCategory._id,
      sellerId: sellerA._id,
      status: 'approved',
      published: true,
      stockQuantity: 5 // exactly 5 in stock
    })
  })

  it('5.1 checkout atomically decrements stock quantity', async () => {
    const res = await request(app)
      .post('/api/marketplace/orders')
      .send({
        items: [{ productId: concurProduct._id.toString(), quantity: 2 }],
        customerInfo: {
          fullName: 'Atomic Stock Buyer',
          phone: '+213550003001',
          wilaya: 'Adrar',
          shippingAddress: 'Rue de la Palmeraie'
        },
        paymentMethod: 'cash_on_delivery'
      })

    expect(res.status).toBe(201)
    const after = await Product.findById(concurProduct._id)
    expect(after.stockQuantity).toBe(3) // 5 - 2 = 3
  })

  it('5.2 rejects purchase exceeding available stock with HTTP 400 and preserves stock', async () => {
    const res = await request(app)
      .post('/api/marketplace/orders')
      .send({
        items: [{ productId: concurProduct._id.toString(), quantity: 10 }], // only 3 available
        customerInfo: {
          fullName: 'Oversell Attempt Buyer',
          phone: '+213550003002',
          wilaya: 'Adrar',
          shippingAddress: 'Rue de la Palmeraie'
        },
        paymentMethod: 'cash_on_delivery'
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Stock insuffisant/i)

    const after = await Product.findById(concurProduct._id)
    expect(after.stockQuantity).toBe(3) // untouched
  })

  it('5.3 concurrency protection: simultaneous orders cannot oversell remaining stock', async () => {
    // Current stock is 3. We send 6 simultaneous order requests of quantity 1 each.
    // Exactly 3 must succeed (201), and the remaining 3 must fail (400 / 409).
    // Final stock must be exactly 0, never negative!
    const requests = []
    for (let i = 1; i <= 6; i++) {
      requests.push(
        request(app)
          .post('/api/marketplace/orders')
          .send({
            items: [{ productId: concurProduct._id.toString(), quantity: 1 }],
            customerInfo: {
              fullName: `Concurrent Buyer ${i}`,
              phone: `+21355000400${i}`, // unique phones to avoid duplicate filter
              wilaya: 'Ghardaia',
              shippingAddress: `Ksar N° ${i}`
            },
            paymentMethod: 'cash_on_delivery'
          })
      )
    }

    const responses = await Promise.all(requests)
    const successful = responses.filter(r => r.status === 201)
    const rejected = responses.filter(r => r.status === 400 || r.status === 409)

    expect(successful.length).toBe(3)
    expect(rejected.length).toBe(3)

    const finalProduct = await Product.findById(concurProduct._id)
    expect(finalProduct.stockQuantity).toBe(0) // completely sold out, never negative
  })

  it('5.4 order cancellation restores reserved stock to inventory', async () => {
    await Product.deleteMany({ code: { $regex: /^SEC-RESTORE/ } })
    const restoreCode = `SEC-RESTORE-${Date.now()}`
    // Create new product with 2 units
    const restorableProduct = await Product.create({
      code: restoreCode,
      name: 'Restorable Carpet Item',
      price: 1500,
      categoryId: testCategory._id,
      sellerId: sellerA._id,
      status: 'approved',
      published: true,
      stockQuantity: 2
    })

    // Place order for 2 units
    const orderRes = await request(app)
      .post('/api/marketplace/orders')
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({
        items: [{ productId: restorableProduct._id.toString(), quantity: 2 }],
        customerInfo: {
          fullName: 'Cancellation Test Buyer',
          phone: '+213550005001',
          wilaya: 'Batna',
          shippingAddress: 'Aures Avenue'
        },
        paymentMethod: 'cash_on_delivery'
      })

    expect(orderRes.status).toBe(201)
    const orderId = orderRes.body.order.id

    // Stock should be 0 now
    let prod = await Product.findById(restorableProduct._id)
    expect(prod.stockQuantity).toBe(0)

    // Customer or Admin cancels order via PATCH /api/orders/:id
    const cancelRes = await request(app)
      .patch(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerAToken}`)
      .send({ overallStatus: 'cancelled' })

    expect(cancelRes.status).toBe(200)

    // Stock must be restored to 2
    prod = await Product.findById(restorableProduct._id)
    expect(prod.stockQuantity).toBe(2)

    await Product.findByIdAndDelete(restorableProduct._id)
  })
})
