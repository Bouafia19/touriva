const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')

describe('Phase 2 — Package & Departure Management Test Suite', () => {
  let adminUser = null
  let adminToken = null

  let agencyUserA = null
  let agencyTokenA = null // Verified agency A

  let agencyUserB = null
  let agencyTokenB = null // Verified agency B

  let unverifiedAgency = null
  let unverifiedAgencyToken = null // Pending agency

  let regularClient = null
  let clientToken = null

  let tripAgencyA = null
  let tripAgencyB = null
  let departureAgencyA = null

  const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    const salt = await bcrypt.genSalt(10)
    const testPasswordHash = await bcrypt.hash('TestPass123!', salt)

    // Clean up previous runs
    await User.deleteMany({
      email: {
        $in: [
          'test_admin_phase2@touriva.dz',
          'test_agency_a_p2@touriva.dz',
          'test_agency_b_p2@touriva.dz',
          'test_agency_pending_p2@touriva.dz',
          'test_client_phase2@touriva.dz'
        ]
      }
    })

    // 1. Admin
    adminUser = await User.create({
      email: 'test_admin_phase2@touriva.dz',
      phone: '+213799000001',
      password: testPasswordHash,
      role: 'administrator',
      typeAccount: 'others',
      activated: true,
      fileStatus: 'confirmed'
    })
    adminToken = jwt.sign({ _id: adminUser._id, role: adminUser.role }, secret, { expiresIn: '1h' })

    // 2. Verified Agency A
    agencyUserA = await User.create({
      email: 'test_agency_a_p2@touriva.dz',
      phone: '+213799000002',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Numidia Tours',
      activated: true,
      fileStatus: 'confirmed'
    })
    agencyTokenA = jwt.sign({ _id: agencyUserA._id, role: agencyUserA.role }, secret, { expiresIn: '1h' })

    // 3. Verified Agency B
    agencyUserB = await User.create({
      email: 'test_agency_b_p2@touriva.dz',
      phone: '+213799000003',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Tassili Expeditions',
      activated: true,
      fileStatus: 'confirmed'
    })
    agencyTokenB = jwt.sign({ _id: agencyUserB._id, role: agencyUserB.role }, secret, { expiresIn: '1h' })

    // 4. Pending / Unverified Agency
    unverifiedAgency = await User.create({
      email: 'test_agency_pending_p2@touriva.dz',
      phone: '+213799000004',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Unverified Voyages',
      activated: true,
      fileStatus: 'pending'
    })
    unverifiedAgencyToken = jwt.sign({ _id: unverifiedAgency._id, role: unverifiedAgency.role }, secret, { expiresIn: '1h' })

    // 5. Regular client
    regularClient = await User.create({
      email: 'test_client_phase2@touriva.dz',
      phone: '+213799000005',
      password: testPasswordHash,
      role: 'client',
      typeAccount: 'visitor',
      activated: true
    })
    clientToken = jwt.sign({ _id: regularClient._id, role: regularClient.role }, secret, { expiresIn: '1h' })
  })

  afterAll(async () => {
    // Delete departures created during test
    await TripDeparture.deleteMany({
      agency: { $in: [agencyUserA?._id, agencyUserB?._id, unverifiedAgency?._id].filter(Boolean) }
    })

    // Delete trips created during test
    await Trip.deleteMany({
      creator: { $in: [agencyUserA?._id, agencyUserB?._id, unverifiedAgency?._id].filter(Boolean) }
    })

    // Delete test users
    await User.deleteMany({
      email: {
        $in: [
          'test_admin_phase2@touriva.dz',
          'test_agency_a_p2@touriva.dz',
          'test_agency_b_p2@touriva.dz',
          'test_agency_pending_p2@touriva.dz',
          'test_client_phase2@touriva.dz'
        ]
      }
    })

    await mongoose.connection.close()
  })

  // =========================================================================
  // 1. AGENCY PROFILE & AUTHORIZATION CHECKS
  // =========================================================================
  describe('1. Agency Profile & Authorization Controls', () => {
    it('1.1: Rejects unauthenticated GET /api/agency/profile with 401', async () => {
      const res = await request(app).get('/api/agency/profile')
      expect(res.status).toBe(401)
    })

    it('1.2: Rejects client GET /api/agency/profile with 403 (partner/admin required)', async () => {
      const res = await request(app)
        .get('/api/agency/profile')
        .set('Authorization', `Bearer ${clientToken}`)
      expect(res.status).toBe(403)
    })

    it('1.3: Allows verified agency to access profile and metrics', async () => {
      const res = await request(app)
        .get('/api/agency/profile')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(res.body.agency).toBeDefined()
      expect(res.body.agency.companyName).toBe('Numidia Tours')
      expect(res.body.agency.isVerified).toBe(true)
      expect(res.body.metrics).toBeDefined()
      expect(typeof res.body.metrics.totalPackages).toBe('number')
      expect(typeof res.body.metrics.scheduledDepartures).toBe('number')
    })

    it('1.4: Allows pending agency to view profile, returning fileStatus pending', async () => {
      const res = await request(app)
        .get('/api/agency/profile')
        .set('Authorization', `Bearer ${unverifiedAgencyToken}`)
      expect(res.status).toBe(200)
      expect(res.body.agency.fileStatus).toBe('pending')
      expect(res.body.agency.isVerified).toBe(false)
    })
  })

  // =========================================================================
  // 2. PACKAGE CREATION & VALIDATION
  // =========================================================================
  describe('2. Package Creation & Validation Workflow', () => {
    it('2.1: Rejects package creation by unverified/pending agency with 403', async () => {
      const res = await request(app)
        .post('/api/agency/packages')
        .set('Authorization', `Bearer ${unverifiedAgencyToken}`)
        .send({
          name: 'Circuit Tassili 5 Jours',
          durationDays: 5,
          price: 45000
        })
      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/verification/i)
    })

    it('2.2: Rejects package creation with missing required fields (name, price) with 400', async () => {
      const res = await request(app)
        .post('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          description: 'Package without name and price'
        })
      expect(res.status).toBe(400)
    })

    it('2.3: Rejects package creation with invalid price (negative or non-numeric) with 400', async () => {
      const res = await request(app)
        .post('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          name: 'Invalid Price Package',
          durationDays: 3,
          price: -500
        })
      expect(res.status).toBe(400)
    })

    it('2.4: Creates a valid package for verified Agency A', async () => {
      const res = await request(app)
        .post('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          name: 'Circuit Mzab & Ghardaia',
          description: 'Immersion culturelle et architecturale au coeur de la vallee du Mzab.',
          durationDays: 4,
          price: 32000,
          theme: 'Culture & Patrimoine',
          meetingPoint: 'Aeroport de Ghardaia Noumerat',
          inclusions: ['Transport 4x4 climatise', 'Hebergement en maison d hote traditionnelle', 'Guide local agree'],
          exclusions: ['Billets d avion', 'Depenses personnelles'],
          cancellationPolicy: 'Remboursement a 100% jusqu a 7 jours avant le depart.',
          status: 'published'
        })
      expect(res.status).toBe(201)
      const pkg = res.body
      expect(pkg).toBeDefined()
      expect(pkg.name).toBe('Circuit Mzab & Ghardaia')
      expect(Number(pkg.price)).toBe(32000)
      expect(pkg.creator.toString()).toBe(agencyUserA._id.toString())
      expect(pkg.inclusions.length).toBe(3)
      expect(pkg.status).toBe('published')
      tripAgencyA = pkg
    })

    it('2.5: Prevents creator ID spoofing (creator is always set to authenticated user)', async () => {
      const res = await request(app)
        .post('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({
          name: 'Trek Taghit & Grand Erg',
          description: 'Traversee du grand erg occidental.',
          durationDays: 3,
          price: 28000,
          creator: agencyUserA._id, // Attempt to spoof creator as Agency A
          status: 'published'
        })
      expect(res.status).toBe(201)
      const pkg = res.body
      expect(pkg.creator.toString()).toBe(agencyUserB._id.toString())
      expect(pkg.creator.toString()).not.toBe(agencyUserA._id.toString())
      tripAgencyB = pkg
    })
  })

  // =========================================================================
  // 3. PACKAGE ISOLATION, RETRIEVAL & UPDATE
  // =========================================================================
  describe('3. Package Data Isolation & Modification Invariants', () => {
    it('3.1: Agency A retrieves only its own packages (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(1)
      const ids = res.body.map(p => p._id.toString())
      expect(ids).toContain(tripAgencyA._id.toString())
      expect(ids).not.toContain(tripAgencyB._id.toString())
    })

    it('3.2: Agency B retrieves only its own packages (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      const ids = res.body.map(p => p._id.toString())
      expect(ids).toContain(tripAgencyB._id.toString())
      expect(ids).not.toContain(tripAgencyA._id.toString())
    })

    it('3.3: Agency A CAN update its own package', async () => {
      const res = await request(app)
        .patch(`/api/agency/packages/${tripAgencyA._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          price: 34000,
          description: 'Description mise a jour avec nouvelles etapes.'
        })
      expect(res.status).toBe(200)
      expect(Number(res.body.price)).toBe(34000)
      expect(res.body.description).toBe('Description mise a jour avec nouvelles etapes.')
    })

    it('3.4: IDOR Prevention: Agency A CANNOT update Agency B package (403/404)', async () => {
      const res = await request(app)
        .patch(`/api/agency/packages/${tripAgencyB._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          price: 1000,
          name: 'Hacked Package'
        })
      expect([403, 404]).toContain(res.status)
    })

    it('3.5: IDOR Prevention: Agency A CANNOT delete Agency B package (403/404)', async () => {
      const res = await request(app)
        .delete(`/api/agency/packages/${tripAgencyB._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect([403, 404]).toContain(res.status)
    })
  })

  // =========================================================================
  // 4. DEPARTURE SCHEDULING, CAPACITY & VALIDATION
  // =========================================================================
  describe('4. Departure Scheduling & Capacity Constraints', () => {
    it('4.1: Rejects departure scheduling by unverified/pending agency with 403', async () => {
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${unverifiedAgencyToken}`)
        .send({
          tripId: tripAgencyA._id,
          startDate: new Date(Date.now() + 86400000 * 5),
          capacity: 15,
          priceDZD: 34000
        })
      expect(res.status).toBe(403)
    })

    it('4.2: IDOR Prevention: Agency A CANNOT schedule departure for Agency B trip (403/404)', async () => {
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          tripId: tripAgencyB._id, // Trip belonging to Agency B
          startDate: new Date(Date.now() + 86400000 * 7),
          endDate: new Date(Date.now() + 86400000 * 10),
          capacity: 12,
          priceDZD: 28000
        })
      expect([403, 404]).toContain(res.status)
    })

    it('4.3: Date Invariant: Rejects departure when endDate is before startDate (400)', async () => {
      const start = new Date(Date.now() + 86400000 * 10)
      const invalidEnd = new Date(Date.now() + 86400000 * 5) // Before start!
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          tripId: tripAgencyA._id,
          startDate: start,
          endDate: invalidEnd,
          capacity: 15,
          priceDZD: 34000
        })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/(end date|return date)/i)
    })

    it('4.4: Capacity Invariant: Rejects departure with zero or negative capacity (400)', async () => {
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          tripId: tripAgencyA._id,
          startDate: new Date(Date.now() + 86400000 * 10),
          endDate: new Date(Date.now() + 86400000 * 12),
          capacity: 0,
          priceDZD: 34000
        })
      expect(res.status).toBe(400)
    })

    it('4.5: Creates valid scheduled departure for Agency A package', async () => {
      const startDate = new Date(Date.now() + 86400000 * 14)
      const endDate = new Date(Date.now() + 86400000 * 18)
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          tripId: tripAgencyA._id,
          startDate,
          endDate,
          capacity: 18,
          priceDZD: 34000,
          minGroupSize: 4,
          meetingPoint: 'Place des Martyrs, Alger (Depart bus)',
          departureInstructions: 'Rendez-vous a 06h30 avec carte nationale d identite.'
        })
      expect(res.status).toBe(201)
      const dep = res.body
      expect(dep).toBeDefined()
      expect(dep.capacity).toBe(18)
      expect(dep.bookedSeats).toBe(0)
      expect(dep.status).toBe('scheduled')
      departureAgencyA = dep
    })

    it('4.6: Agency A retrieves only its own departures (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(1)
      expect(res.body[0].agency.toString()).toBe(agencyUserA._id.toString())
    })

    it('4.7: Agency B retrieves empty departures list (Isolation verified)', async () => {
      const res = await request(app)
        .get('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      const depIds = res.body.map(d => d._id.toString())
      expect(depIds).not.toContain(departureAgencyA._id.toString())
    })

    it('4.8: IDOR Prevention: Agency B CANNOT update Agency A departure (403/404)', async () => {
      const res = await request(app)
        .patch(`/api/agency/departures/${departureAgencyA._id}`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({
          capacity: 5
        })
      expect([403, 404]).toContain(res.status)
    })
  })

  // =========================================================================
  // 5. CANCELLATION & AUDIT INTEGRITY
  // =========================================================================
  describe('5. Departure Cancellation & Invariants', () => {
    it('5.1: Rejects departure cancellation without a mandatory cancellationReason (400)', async () => {
      const res = await request(app)
        .post(`/api/agency/departures/${departureAgencyA._id}/cancel`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/reason/i)
    })

    it('5.2: Cancels departure successfully when valid cancellationReason is provided', async () => {
      const res = await request(app)
        .post(`/api/agency/departures/${departureAgencyA._id}/cancel`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          cancellationReason: 'Conditions meteorologiques defavorables (tempete de sable).'
        })
      expect(res.status).toBe(200)
      expect(res.body.departure).toBeDefined()
      expect(res.body.departure.status).toBe('cancelled')
      expect(res.body.departure.cancellationReason).toBe('Conditions meteorologiques defavorables (tempete de sable).')
    })
  })

  // =========================================================================
  // 6. PUBLIC TOURIST DISCOVERY INTEGRATION
  // =========================================================================
  describe('6. Public Tourist Discovery Integration', () => {
    let secondDeparture = null

    beforeAll(async () => {
      // Create an active (scheduled) departure for public discovery test
      secondDeparture = await TripDeparture.create({
        trip: tripAgencyA._id,
        agency: agencyUserA._id,
        startDate: new Date(Date.now() + 86400000 * 20),
        endDate: new Date(Date.now() + 86400000 * 24),
        priceDZD: 34000,
        capacity: 20,
        bookedSeats: 5,
        status: 'scheduled',
        meetingPoint: 'Aeroport Alger Houari Boumediene'
      })
    })

    it('6.1: Public GET /api/trips/:id/departures is accessible without authentication (200)', async () => {
      const res = await request(app).get(`/api/trips/${tripAgencyA._id}/departures`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('6.2: Public departures endpoint excludes cancelled departures by default', async () => {
      const res = await request(app).get(`/api/trips/${tripAgencyA._id}/departures`)
      expect(res.status).toBe(200)
      const ids = res.body.map(d => d._id.toString())
      expect(ids).toContain(secondDeparture._id.toString())
      expect(ids).not.toContain(departureAgencyA._id.toString()) // Cancelled departure excluded!
    })

    it('6.3: Public departure returns computed availableSeats (capacity - bookedSeats)', async () => {
      const res = await request(app).get(`/api/trips/${tripAgencyA._id}/departures`)
      expect(res.status).toBe(200)
      const dep = res.body.find(d => d._id.toString() === secondDeparture._id.toString())
      expect(dep).toBeDefined()
      expect(dep.capacity).toBe(20)
      expect(dep.bookedSeats).toBe(5)
      expect(dep.availableSeats).toBe(15) // 20 - 5 = 15
    })

    it('6.4: Public GET /api/trips populates agency creator details including fileStatus', async () => {
      const res = await request(app).get('/api/trips?published=true')
      expect(res.status).toBe(200)
      const pkg = res.body.find(t => t._id.toString() === tripAgencyA._id.toString())
      expect(pkg).toBeDefined()
      expect(pkg.creator).toBeDefined()
      expect(pkg.creator.typeAccount).toBe('touristAgencies')
      expect(pkg.creator.fileStatus).toBe('confirmed')
      expect(pkg.creator.companyName).toBe('Numidia Tours')
    })
  })
})
