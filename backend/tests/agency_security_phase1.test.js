const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')

describe('Phase 1 — Agency Verification & Security Hardening Regression Suite', () => {
  let adminUser = null
  let adminToken = null

  let agencyUserA = null
  let agencyTokenA = null

  let agencyUserB = null
  let agencyTokenB = null

  let guideUser = null
  let guideToken = null

  let regularClient = null
  let clientToken = null

  let createdTripIds = []

  const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    const salt = await bcrypt.genSalt(10)
    const testPasswordHash = await bcrypt.hash('TestPass123!', salt)

    // Clean up any stale test accounts from previous runs
    await User.deleteMany({
      email: {
        $in: [
          'test_admin_phase1@touriva.dz',
          'test_agency_a@touriva.dz',
          'test_agency_b@touriva.dz',
          'test_guide_phase1@touriva.dz',
          'test_client_phase1@touriva.dz',
          'test_public_signup@touriva.dz'
        ]
      }
    })

    // 1. Admin user
    adminUser = await User.create({
      email: 'test_admin_phase1@touriva.dz',
      phone: '+213700000001',
      password: testPasswordHash,
      role: 'administrator',
      typeAccount: 'others',
      activated: true,
      fileStatus: 'confirmed'
    })
    adminToken = jwt.sign({ _id: adminUser._id, role: adminUser.role }, secret, { expiresIn: '1h' })

    // 2. Agency A (starts as pending)
    agencyUserA = await User.create({
      email: 'test_agency_a@touriva.dz',
      phone: '+213700000002',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Agence Atlas Sahara',
      activated: true,
      fileStatus: 'pending',
      commercialRegister: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY44YAAAAASUVORK5CYII='
    })
    agencyTokenA = jwt.sign({ _id: agencyUserA._id, role: agencyUserA.role }, secret, { expiresIn: '1h' })

    // 3. Agency B (starts as confirmed)
    agencyUserB = await User.create({
      email: 'test_agency_b@touriva.dz',
      phone: '+213700000003',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Hoggar Voyages',
      activated: true,
      fileStatus: 'confirmed',
      commercialRegister: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY44YAAAAASUVORK5CYII='
    })
    agencyTokenB = jwt.sign({ _id: agencyUserB._id, role: agencyUserB.role }, secret, { expiresIn: '1h' })

    // 4. Tourist Guide (Partner, but not agency)
    guideUser = await User.create({
      email: 'test_guide_phase1@touriva.dz',
      phone: '+213700000004',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristGuide',
      guideType: 'nationalGuide',
      activated: true,
      fileStatus: 'confirmed'
    })
    guideToken = jwt.sign({ _id: guideUser._id, role: guideUser.role }, secret, { expiresIn: '1h' })

    // 5. Regular client
    regularClient = await User.create({
      email: 'test_client_phase1@touriva.dz',
      phone: '+213700000005',
      password: testPasswordHash,
      role: 'client',
      typeAccount: 'visitor',
      activated: true
    })
    clientToken = jwt.sign({ _id: regularClient._id, role: regularClient.role }, secret, { expiresIn: '1h' })
  })

  afterAll(async () => {
    // Clean up created trips
    if (createdTripIds.length > 0) {
      await Trip.deleteMany({ _id: { $in: createdTripIds } })
    }

    // Clean up test users
    await User.deleteMany({
      email: {
        $in: [
          'test_admin_phase1@touriva.dz',
          'test_agency_a@touriva.dz',
          'test_agency_b@touriva.dz',
          'test_guide_phase1@touriva.dz',
          'test_client_phase1@touriva.dz',
          'test_public_signup@touriva.dz'
        ]
      }
    })

    await mongoose.connection.close()
  })

  // =========================================================================
  // REQUIREMENT 1: PARTNER-PHOTO AUTHORIZATION & IDOR PREVENTION
  // =========================================================================
  describe('Requirement 1: Partner Photo Authorization & IDOR Hardening', () => {
    it('1.1: Rejects unauthenticated GET /api/users/loadPartnerPhotos/:id with 401', async () => {
      const res = await request(app)
        .get(`/api/users/loadPartnerPhotos/${agencyUserA._id}`)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    it('1.2: Rejects unauthenticated PATCH /api/users/uploadPartnerImages/:id with 401', async () => {
      const res = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .send({ commercialRegister: 'data:image/png;base64,abc' })
      expect(res.status).toBe(401)
    })

    it('1.3: Rejects malformed user ObjectId safely with 404', async () => {
      const res = await request(app)
        .get('/api/users/loadPartnerPhotos/malformed-id-123')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(404)
      expect(res.body.error).toBe('no such user')
    })

    it('1.4: IDOR Prevention: Partner A CANNOT view Partner B documents (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/users/loadPartnerPhotos/${agencyUserB._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/Access forbidden/i)
    })

    it('1.5: IDOR Prevention: Partner A CANNOT overwrite Partner B documents (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserB._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ commercialRegister: 'data:image/png;base64,malicious_overwrite' })
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/Access forbidden/i)
    })

    it('1.6: IDOR Prevention: Regular client CANNOT access or modify partner documents (403 Forbidden)', async () => {
      const getRes = await request(app)
        .get(`/api/users/loadPartnerPhotos/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
      expect(getRes.status).toBe(403)

      const patchRes = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ id: 'data:image/png;base64,attack' })
      expect(patchRes.status).toBe(403)
    })

    it('1.7: Authorized Owner Access: Partner A CAN view their own documents (200 OK)', async () => {
      const res = await request(app)
        .get(`/api/users/loadPartnerPhotos/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('commercialRegister')
    })

    it('1.8: Authorized Owner Access: Partner A CAN upload their own permitted documents (200 OK)', async () => {
      const sampleB64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAEklEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
      const res = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ accreditation: sampleB64 })
      expect(res.status).toBe(200)
      expect(res.body._id).toBe(agencyUserA._id.toString())

      // Verify persistence in DB
      const updated = await User.findById(agencyUserA._id)
      expect(updated.accreditation).toBe(sampleB64)
    })

    it('1.9: Authorized Admin Access: Administrator CAN view and modify any partner documents (200 OK)', async () => {
      const getRes = await request(app)
        .get(`/api/users/loadPartnerPhotos/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(getRes.status).toBe(200)

      const patchRes = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ justification: 'data:image/png;base64,admin_verified_doc' })
      expect(patchRes.status).toBe(200)
    })

    it('1.10: Mass-Assignment Prevention: uploadPartnerImages ignores or rejects non-document fields', async () => {
      const res = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          role: 'administrator',
          fileStatus: 'confirmed'
        })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/No valid document fields provided/i)

      // Ensure user was not escalated
      const freshUser = await User.findById(agencyUserA._id)
      expect(freshUser.role).toBe('partner')
      expect(freshUser.fileStatus).not.toBe('confirmed')
    })

    it('1.11: Oversized Payload Protection: Rejects single document exceeding 5MB with 413', async () => {
      const oversizedB64 = 'data:image/jpeg;base64,' + 'X'.repeat(5.5 * 1024 * 1024)
      const res = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ commercialRegister: oversizedB64 })
      expect(res.status).toBe(413)
      expect(res.body.error).toMatch(/exceeds 5MB limit/i)
    })
  })

  // =========================================================================
  // REQUIREMENT 2: ENFORCE AGENCY VERIFICATION & PREVENT SELF-APPROVAL
  // =========================================================================
  describe('Requirement 2: Agency Verification Invariants & Self-Approval Prevention', () => {
    it('2.1: Public signup cannot self-approve or register as administrator', async () => {
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test_public_signup@touriva.dz',
          phone: '+213799999999',
          password: 'Password123!',
          role: 'administrator',
          fileStatus: 'confirmed',
          typeAccount: 'touristAgencies'
        })
      expect(res.status).toBe(200)

      const createdUser = await User.findOne({ email: 'test_public_signup@touriva.dz' })
      expect(createdUser).toBeDefined()
      // Role forced to client, fileStatus forced to created
      expect(createdUser.role).toBe('client')
      expect(createdUser.fileStatus).toBe('created')
    })

    it('2.2: Agency Partner CANNOT self-approve (fileStatus: confirmed) via PATCH /api/users/:id', async () => {
      // Agency A is pending
      const res = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          fileStatus: 'confirmed'
        })
      expect(res.status).toBe(200)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('pending') // Unchanged
    })

    it('2.3: Agency Partner CANNOT self-approve via update_existing_user/:id', async () => {
      const res = await request(app)
        .patch(`/api/users/update_existing_user/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          fileStatus: 'confirmed'
        })
      expect(res.status).toBe(200)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('pending') // Unchanged
    })

    it('2.4: Agency Partner CAN transition status from created/rejected to pending on submission', async () => {
      // Set to created first
      await User.findByIdAndUpdate(agencyUserA._id, { fileStatus: 'created' })

      const res = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          fileStatus: 'pending'
        })
      expect(res.status).toBe(200)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('pending')
    })

    it('2.5: Pending Agency is BLOCKED from agency-only endpoint (GET /api/users/agency/status) with 403', async () => {
      const res = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(403)
      expect(res.body.fileStatus).toBe('pending')
      expect(res.body.error).toMatch(/pending administrator review/i)
    })

    it('2.6: Pending Agency is BLOCKED from publishing trips (POST /api/trips) with 403', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          name: 'Unauthorized Circuit Sahara',
          price: 45000,
          days: []
        })
      expect(res.status).toBe(403)
      expect(res.body.fileStatus).toBe('pending')
      expect(res.body.error).toMatch(/verification is required before publishing/i)
    })

    it('2.7: Non-agency partner (Guide) is BLOCKED from agency-only endpoint with 403', async () => {
      const res = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${guideToken}`)
      expect(res.status).toBe(403)
      expect(res.body.typeAccount).toBe('touristGuide')
      expect(res.body.error).toMatch(/Tourism agency account required/i)
    })

    it('2.8: Regular Client is BLOCKED from agency-only endpoint with 403', async () => {
      const res = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${clientToken}`)
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/Partner account required/i)
    })

    it('2.9: Approved Agency (Agency B) CAN access agency-only status and publish trips', async () => {
      const statusRes = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(statusRes.status).toBe(200)
      expect(statusRes.body.verified).toBe(true)
      expect(statusRes.body.fileStatus).toBe('confirmed')

      const tripRes = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({
          name: 'Hoggar Grand Circuit 4x4',
          price: 65000,
          days: []
        })
      expect(tripRes.status).toBe(201)
      expect(tripRes.body).toHaveProperty('_id')
      createdTripIds.push(tripRes.body._id)
    })

    it('2.10: Administrator bypasses verification check and can access agency endpoints', async () => {
      const res = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${adminToken}`)
      expect(res.status).toBe(200)
      expect(res.body.verified).toBe(true)
    })
  })

  // =========================================================================
  // REQUIREMENT 3: REJECTION FEEDBACK, PERSISTENCE & RESUBMISSION WORKFLOW
  // =========================================================================
  describe('Requirement 3: Rejection Feedback, Privacy & Resubmission Workflow', () => {
    it('3.1: Partner CANNOT set or fabricate rejectionReason on their own account', async () => {
      const res = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          rejectionReason: 'Fabricated internal note'
        })
      expect(res.status).toBe(200)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.rejectionReason).toBeNull()
    })

    it('3.2: Administrator CAN reject an agency with a specific rejection reason', async () => {
      const rejectionNote = 'Le registre de commerce fourni est expiré depuis plus de 6 mois. Veuillez téléverser un extrait valide avec QR code CNRC.'
      const res = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileStatus: 'rejected',
          rejectionReason: rejectionNote
        })
      expect(res.status).toBe(200)
      expect(res.body.fileStatus).toBe('rejected')
      expect(res.body.rejectionReason).toBe(rejectionNote)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('rejected')
      expect(reloaded.rejectionReason).toBe(rejectionNote)
    })

    it('3.3: Rejected agency is informed of rejection reason via GET /api/users/:id', async () => {
      const res = await request(app)
        .get(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(res.body.fileStatus).toBe('rejected')
      expect(res.body.rejectionReason).toMatch(/registre de commerce fourni est expiré/i)
    })

    it('3.4: Rejection reason and documents are NEVER exposed to other clients or partners (403)', async () => {
      const clientRes = await request(app)
        .get(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
      expect(clientRes.status).toBe(403)

      const partnerBRes = await request(app)
        .get(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(partnerBRes.status).toBe(403)
    })

    it('3.5: Rejected agency receives rejection detail when attempting restricted operations (403)', async () => {
      const res = await request(app)
        .get('/api/users/agency/status')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(403)
      expect(res.body.fileStatus).toBe('rejected')
      expect(res.body.rejectionReason).toMatch(/registre de commerce/i)
    })

    it('3.6: Resubmission: Rejected agency can re-upload document and transition back to pending', async () => {
      // 1. Upload updated document
      const uploadRes = await request(app)
        .patch(`/api/users/uploadPartnerImages/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          commercialRegister: 'data:image/png;base64,freshly_renewed_commercial_register_cnrc'
        })
      expect(uploadRes.status).toBe(200)

      // 2. Submit dossier back to pending
      const submitRes = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          fileStatus: 'pending'
        })
      expect(submitRes.status).toBe(200)

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('pending')
    })

    it('3.7: Administrator approval clears rejectionReason automatically', async () => {
      const approveRes = await request(app)
        .patch(`/api/users/${agencyUserA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fileStatus: 'confirmed'
        })
      expect(approveRes.status).toBe(200)
      expect(approveRes.body.fileStatus).toBe('confirmed')
      expect(approveRes.body.rejectionReason).toBeNull()

      const reloaded = await User.findById(agencyUserA._id)
      expect(reloaded.fileStatus).toBe('confirmed')
      expect(reloaded.rejectionReason).toBeNull()
    })
  })

  // =========================================================================
  // REQUIREMENT 4: PUBLIC DISCOVERY & PLATFORM WORKFLOWS REMAIN FUNCTIONAL
  // =========================================================================
  describe('Requirement 4: Public Tourism Discovery & Core Functions Integrity', () => {
    it('4.1: Public trip discovery remains unblocked without authentication', async () => {
      const res = await request(app).get('/api/trips')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('4.2: Public sites and attractions remain unblocked', async () => {
      const res = await request(app).get('/api/sites')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('4.3: Public accommodations remain unblocked', async () => {
      const res = await request(app).get('/api/hotels')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })
})
