const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const Product = require('../models/Product')
const Order = require('../models/Order')

describe('Touriva Phase 1 — Comprehensive Security Remediation Test Suite', () => {
  let clientUser = null
  let clientToken = null
  let otherClientUser = null
  let otherClientToken = null
  let partnerUser = null
  let partnerToken = null
  let adminUser = null
  let adminToken = null

  let testTripId = null
  let testProductId = null

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    // Load test users from seeded database
    adminUser = await User.findOne({ role: 'administrator' })
    partnerUser = await User.findOne({ role: 'partner' })
    const clients = await User.find({ role: 'client' }).limit(2)
    clientUser = clients[0]
    otherClientUser = clients[1]

    const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

    if (adminUser) {
      adminToken = jwt.sign({ _id: adminUser._id, role: adminUser.role }, secret, { expiresIn: '1h' })
    }
    if (partnerUser) {
      partnerToken = jwt.sign({ _id: partnerUser._id, role: partnerUser.role }, secret, { expiresIn: '1h' })
    }
    if (clientUser) {
      clientToken = jwt.sign({ _id: clientUser._id, role: clientUser.role }, secret, { expiresIn: '1h' })
    }
    if (otherClientUser) {
      otherClientToken = jwt.sign({ _id: otherClientUser._id, role: otherClientUser.role }, secret, { expiresIn: '1h' })
    }

    // Create a trip owned by partnerUser
    const trip = await Trip.create({
      name: 'Sahara Remediation Security Test Trip',
      creator: partnerUser ? partnerUser._id : new mongoose.Types.ObjectId(),
      price: 25000,
      days: []
    })
    testTripId = trip._id

    // Create a product
    const product = await Product.create({
      code: 'SEC_TEST_' + Date.now(),
      name: 'Remediation Test Product',
      price: 1200
    })
    testProductId = product._id
  })

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      if (testTripId) await Trip.findByIdAndDelete(testTripId)
      if (testProductId) await Product.findByIdAndDelete(testProductId)
      await mongoose.connection.close()
    }
  })

  // ==========================================
  // PRIORITY 1: CRIT-01 — ACCOUNT TAKEOVER & PRIVILEGE ESCALATION
  // ==========================================
  describe('CRIT-01: Account Takeover & Privilege Escalation', () => {
    it('1.1: Rejects unauthenticated PATCH /api/users/update_existing_user/:id with 401', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${clientUser._id}`)
        .send({ firstName: 'HackedName' })
        .expect(401)

      expect(res.body).toHaveProperty('error')
    })

    it('1.2: Prevents cross-user account takeover (Client A cannot modify Client B profile) with 403', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${otherClientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ firstName: 'MaliciousAttackerName' })
        .expect(403)

      expect(res.body.error).toMatch(/forbidden|unauthorized/i)
    })

    it('1.3: Prevents privilege escalation (Client cannot modify role or promote self to administrator)', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ role: 'administrator' })
        .expect(200)

      // Verify role was NOT updated in database
      const refreshed = await User.findById(clientUser._id)
      expect(refreshed.role).toBe('client')
    })

    it('1.4: Allows user to update their own permitted profile fields safely', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ firstName: 'UpdatedSafely' })
        .expect(200)

      expect(res.body.firstName).toBe('UpdatedSafely')
    })

    it('1.5: Allows administrator to manage user accounts', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${clientUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'AdminManagedName' })
        .expect(200)

      expect(res.body.firstName).toBe('AdminManagedName')
    })
  })

  // ==========================================
  // PRIORITY 2: CRIT-02 — USER & PASSWORD HASH EXPOSURE
  // ==========================================
  describe('CRIT-02: User & Password Hash Exposure', () => {
    it('2.1: Rejects user database enumeration for normal client with 403', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403)

      expect(res.body.error).toMatch(/Forbidden|Access restricted/i)
    })

    it('2.2: Rejects cross-user profile reading (GET /api/users/:id) for another client with 403', async () => {
      const res = await request(app)
        .get(`/api/users/${otherClientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403)

      expect(res.body.error).toMatch(/forbidden|unauthorized/i)
    })

    it('2.3: User self-profile (GET /api/users/:id) NEVER exposes password or bcrypt hash', async () => {
      const res = await request(app)
        .get(`/api/users/${clientUser._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200)

      expect(res.body).not.toHaveProperty('password')
      expect(res.body).not.toHaveProperty('resetOtp')
      expect(res.body).not.toHaveProperty('resetOtpExpires')
    })

    it('2.4: Admin user listing excludes bcrypt password hashes from response', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      res.body.forEach(u => {
        expect(u).not.toHaveProperty('password')
        expect(u).not.toHaveProperty('resetOtp')
      })
    })
  })

  // ==========================================
  // PRIORITY 3: CRIT-03 — UNAUTHENTICATED MUTATION ROUTES & IDOR
  // ==========================================
  describe('CRIT-03: Mutation Routes Access Control & IDOR Prevention', () => {
    it('3.1: Rejects unauthenticated POST /api/sites with 401', async () => {
      await request(app).post('/api/sites').send({ name: 'Malicious Site' }).expect(401)
    })

    it('3.2: Rejects client-role POST /api/sites with 403 (Admin required)', async () => {
      await request(app)
        .post('/api/sites')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Malicious Site' })
        .expect(403)
    })

    it('3.3: Rejects unauthenticated DELETE /api/hotels/:id with 401', async () => {
      await request(app).delete(`/api/hotels/${new mongoose.Types.ObjectId()}`).expect(401)
    })

    it('3.4: Rejects unauthenticated PATCH /api/restaurants/:id with 401', async () => {
      await request(app).patch(`/api/restaurants/${new mongoose.Types.ObjectId()}`).send({ name: 'Hack' }).expect(401)
    })

    it('3.5: Rejects client POST /api/trips with 403 (Partner or Admin required)', async () => {
      await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Unauthorized Trip' })
        .expect(403)
    })

    it('3.6: Prevents cross-user trip modification (IDOR: Client cannot modify Partner trip) with 403', async () => {
      await request(app)
        .put(`/api/trips/${testTripId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Hijacked Trip Name' })
        .expect(403)
    })

    it('3.7: Prevents cross-user trip deletion (IDOR: Client cannot delete Partner trip) with 403', async () => {
      await request(app)
        .delete(`/api/trips/${testTripId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403)
    })

    it('3.8: Rejects unauthenticated POST /api/products with 401', async () => {
      await request(app).post('/api/products').send({ name: 'Unauth Product' }).expect(401)
    })

    it('3.9: Rejects client POST /api/categories/add with 403 (Admin required)', async () => {
      await request(app)
        .post('/api/categories/add')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ name: 'Unauth Cat' })
        .expect(403)
    })

    it('3.10: Rejects unauthenticated GET /api/billings with 401', async () => {
      await request(app).get('/api/billings').expect(401)
    })

    it('3.11: Rejects client GET /api/billings with 403 (Admin required)', async () => {
      await request(app)
        .get('/api/billings')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403)
    })

    it('3.12: Public browsing routes remain accessible without authentication', async () => {
      await request(app).get('/api/sites').expect(200)
      await request(app).get('/api/hotels').expect(200)
      await request(app).get('/api/restaurants').expect(200)
      await request(app).get('/api/trips').expect(200)
      await request(app).get('/api/products').expect(200)
      await request(app).get('/api/wilayas').expect(200)
      await request(app).get('/api/terms').expect(200)
    })
  })

  // ==========================================
  // PRIORITY 4: CRIT-04 — CORS POLICY & CREDENTIALS
  // ==========================================
  describe('CRIT-04: CORS Policy & Credentials Hardening', () => {
    it('4.1: Permits authorized production origin with credentials', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://touriva-web.onrender.com')
        .expect(200)

      expect(res.headers['access-control-allow-origin']).toBe('https://touriva-web.onrender.com')
      expect(res.headers['access-control-allow-credentials']).toBe('true')
    })

    it('4.2: Denies arbitrary/malicious origin without reflecting attacker origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'https://malicious-attacker-site.com')
        .expect(200)

      expect(res.headers['access-control-allow-origin']).toBeUndefined()
    })

    it('4.3: Permits requests with no Origin header (mobile apps, backend services)', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200)

      expect(res.body.status).toBe('ok')
    })
  })

  // ==========================================
  // PRIORITY 5: HIGH-01 — FREE OPENSTREETMAP STACK & ZERO CREDENTIALS
  // ==========================================
  describe('HIGH-01: Google Maps Replacement & Credentials Verification', () => {
    it('5.1: No Google Maps API key or google.maps references in frontend source files', () => {
      const srcDir = path.resolve(__dirname, '../../frontEnd/touriva/src')
      let googleFound = false

      const scanDir = (dir) => {
        const files = fs.readdirSync(dir)
        for (const file of files) {
          const fullPath = path.join(dir, file)
          const stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            scanDir(fullPath)
          } else if (file.endsWith('.js') || file.endsWith('.vue')) {
            const content = fs.readFileSync(fullPath, 'utf8')
            if (content.includes('AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4') || content.includes('google.maps.')) {
              googleFound = true
            }
          }
        }
      }

      scanDir(srcDir)
      expect(googleFound).toBe(false)
    })

    it('5.2: frontend index.html does not contain Google Maps script or key', () => {
      const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../frontEnd/touriva/index.html'), 'utf8')
      expect(indexHtml).not.toContain('AIzaSyDxFsMTjS-UsZgkJXcAPbtLQFHmNrg7wN4')
      expect(indexHtml).not.toContain('maps.googleapis.com')
      expect(indexHtml).not.toContain('VITE_GOOGLE_MAPS_KEY')
    })
  })

  // ==========================================
  // PRIORITY 6: HIGH-02 — ANDROID NETWORK SECURITY CONFIG
  // ==========================================
  describe('HIGH-02: Android Network Security Hardening', () => {
    it('6.1: network_security_config.xml enforces cleartextTrafficPermitted=false in base-config', () => {
      const configPath = path.resolve(__dirname, '../../frontEnd/touriva/android/app/src/main/res/xml/network_security_config.xml')
      const xml = fs.readFileSync(configPath, 'utf8')

      expect(xml).toContain('<base-config cleartextTrafficPermitted="false">')
      expect(xml).not.toContain('<base-config cleartextTrafficPermitted="true">')
    })

    it('6.2: AndroidManifest.xml does not set android:usesCleartextTraffic=true globally', () => {
      const manifestPath = path.resolve(__dirname, '../../frontEnd/touriva/android/app/src/main/AndroidManifest.xml')
      const manifest = fs.readFileSync(manifestPath, 'utf8')

      expect(manifest).not.toContain('android:usesCleartextTraffic="true"')
    })

    it('6.3: capacitor.config.json enforces https scheme and cleartext=false', () => {
      const capConfigPath = path.resolve(__dirname, '../../frontEnd/touriva/capacitor.config.json')
      const config = JSON.parse(fs.readFileSync(capConfigPath, 'utf8'))

      expect(config.server.androidScheme).toBe('https')
      expect(config.server.cleartext).toBe(false)
    })
  })

  // ==========================================
  // PRIORITY 7: HIGH-03 — CAPACITOR ADVISORY RESOLUTION
  // ==========================================
  describe('HIGH-03: Capacitor Security Advisory GHSA-rvm3-566m-v7fv', () => {
    it('7.1: @capacitor/android is upgraded to secure version >= 7.6.9', () => {
      const pkgPath = path.resolve(__dirname, '../../frontEnd/touriva/package.json')
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))

      expect(pkg.dependencies['@capacitor/android']).toMatch(/\^?7\.6\.9/)
      expect(pkg.dependencies['@capacitor/ios']).toMatch(/\^?7\.6\.9/)
      expect(pkg.dependencies['@capacitor/core']).toMatch(/\^?7\.6\.9/)
    })
  })

  // ==========================================
  // PRIORITY 8: HIGH-04 — BODY PARSER DOS PROTECTION
  // ==========================================
  describe('HIGH-04: Body-parser DoS Protection', () => {
    it('8.1: Server enforces route-specific parser limits and rejects oversized generic payload', async () => {
      // Create a payload larger than 2MB to a standard non-upload route (e.g. login)
      const oversizedPayload = {
        phone: '+213550000010',
        padding: 'A'.repeat(3 * 1024 * 1024) // 3MB payload
      }

      const res = await request(app)
        .post('/api/users/login')
        .send(oversizedPayload)

      // Express body-parser rejects payloads exceeding limit with 413 Payload Too Large
      expect(res.status).toBe(413)
    })
  })
})
