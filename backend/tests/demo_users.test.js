/**
 * Touriva Demo Users & Authorization Verification Suite
 * 
 * Verifies:
 * 1. Customer Demo Login (Standard password and 1-click endpoint)
 * 2. Agency Demo Login (Standard password and 1-click endpoint)
 * 3. Administrator Demo Login (Explicit authentication only)
 * 4. Critical Security: Demo login rejects admin requests (403 Forbidden)
 * 5. Registration Safety: @touriva.test domain reserved, real signup rejected
 * 6. Multi-Tenant Role Isolation:
 *    - Customer forbidden from /api/agency/* and admin routes
 *    - Agency allowed /api/agency/*, forbidden from admin billing
 *    - Admin allowed global platform administration and CASL abilities
 * 7. Demo Data Verification: Packages, departures, passenger manifests, financials, enquiries
 * 8. Seed Idempotency: Multiple runs produce identical non-duplicate state
 */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripPayment = require('../models/TripPayment')
const TripEnquiry = require('../models/TripEnquiry')
const { seedDemoUsersAndData, DEMO_CREDENTIALS } = require('../seed/seed_demo_users')

describe('Touriva Demo Users & Role Authorization Suite', () => {
  beforeAll(async () => {
    // Ensure demo accounts and realistic dataset are seeded
    await seedDemoUsersAndData()
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  describe('1. Public Web Demo Authentication', () => {
    test('1.1: Customer can log in via standard POST /api/users/login with email & password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: DEMO_CREDENTIALS.customer.email,
          password: DEMO_CREDENTIALS.customer.password
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user).toBeDefined()
      expect(res.body.user.email).toBe('demo.customer@touriva.test')
      expect(res.body.user.role).toBe('client')
      expect(res.body.user.typeAccount).toBe('visitor')
    })

    test('1.2: Customer can log in via standard POST /api/users/login with phone & password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          phone: DEMO_CREDENTIALS.customer.phone,
          password: DEMO_CREDENTIALS.customer.password
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('demo.customer@touriva.test')
    })

    test('1.3: Customer can authenticate via dedicated POST /api/users/demo-login (1-Click)', async () => {
      const res = await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'customer' })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('demo.customer@touriva.test')
      expect(res.body.user.role).toBe('client')
    })

    test('1.4: Agency Director can log in via standard POST /api/users/login with email & password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: DEMO_CREDENTIALS.agency.email,
          password: DEMO_CREDENTIALS.agency.password
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('demo.agency@touriva.test')
      expect(res.body.user.role).toBe('partner')
      expect(res.body.user.typeAccount).toBe('touristAgencies')
      expect(res.body.user.fileStatus).toBe('confirmed')
      expect(res.body.user.companyName).toBe('Touriva Horizons Voyages & Tourisme')
    })

    test('1.5: Agency Director can authenticate via dedicated POST /api/users/demo-login (1-Click)', async () => {
      const res = await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'agency' })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('demo.agency@touriva.test')
      expect(res.body.user.role).toBe('partner')
      expect(res.body.user.typeAccount).toBe('touristAgencies')
    })
  })

  describe('2. Administrator Demo Authentication & Security Isolation', () => {
    test('2.1: Administrator can log in via standard POST /api/users/login with credentials & role', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: DEMO_CREDENTIALS.admin.email,
          password: DEMO_CREDENTIALS.admin.password,
          role: 'administrator'
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe('demo.admin@touriva.test')
      expect(res.body.user.role).toBe('administrator')
      expect(res.body.rules).toBeDefined() // CASL rules populated
      expect(Array.isArray(res.body.rules)).toBe(true)
    })

    test('2.2: CRITICAL SECURITY: POST /api/users/demo-login strictly forbids admin requests (403)', async () => {
      const resAdmin = await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'admin' })

      expect(resAdmin.status).toBe(403)
      expect(resAdmin.body.error).toMatch(/restricted/i)

      const resAdministrator = await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'administrator' })

      expect(resAdministrator.status).toBe(403)
    })

    test('2.3: POST /api/users/demo-login rejects invalid demoType with 400', async () => {
      const res = await request(app)
        .post('/api/users/demo-login')
        .send({ demoType: 'super_hacker' })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/invalid demoType/i)
    })
  })

  describe('3. Database & Registration Safety', () => {
    test('3.1: Public signup rejects registration using @touriva.test domain', async () => {
      const res = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'impostor@touriva.test',
          firstName: 'Impostor',
          lastName: 'User',
          phone: '+213559999999',
          password: 'Password123!',
          role: 'client'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Reserved demo domain cannot be used for registration/i)
    })

    test('3.2: Web signup rejects registration using @touriva.test domain', async () => {
      const res = await request(app)
        .post('/api/users/signupUserWeb')
        .send({
          phone: '+213559999998',
          email: 'intruder@touriva.test',
          firstName: 'Intruder',
          lastName: 'Web',
          role: 'client'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Reserved demo domain cannot be used for registration/i)
    })
  })

  describe('4. Role-Based Access Isolation', () => {
    let customerToken
    let agencyToken
    let adminToken

    beforeAll(async () => {
      const [custRes, agyRes, admRes] = await Promise.all([
        request(app).post('/api/users/demo-login').send({ demoType: 'customer' }),
        request(app).post('/api/users/demo-login').send({ demoType: 'agency' }),
        request(app).post('/api/users/login').send({
          email: DEMO_CREDENTIALS.admin.email,
          password: DEMO_CREDENTIALS.admin.password,
          role: 'administrator'
        })
      ])
      customerToken = custRes.body.token
      agencyToken = agyRes.body.token
      adminToken = admRes.body.token
    })

    test('4.1: Customer is forbidden from accessing agency profile (403)', async () => {
      const res = await request(app)
        .get('/api/agency/profile')
        .set('Authorization', `Bearer ${customerToken}`)

      expect(res.status).toBe(403)
    })

    test('4.2: Customer is forbidden from accessing agency financial dashboard (403)', async () => {
      const res = await request(app)
        .get('/api/agency/financials/dashboard')
        .set('Authorization', `Bearer ${customerToken}`)

      expect(res.status).toBe(403)
    })

    test('4.3: Customer is forbidden from accessing admin billing (403)', async () => {
      const res = await request(app)
        .get('/api/billings')
        .set('Authorization', `Bearer ${customerToken}`)

      expect(res.status).toBe(403)
    })

    test('4.4: Agency Director can access agency profile & metrics', async () => {
      const res = await request(app)
        .get('/api/agency/profile')
        .set('Authorization', `Bearer ${agencyToken}`)

      expect(res.status).toBe(200)
      expect(res.body.agency.companyName).toBe('Touriva Horizons Voyages & Tourisme')
      expect(res.body.agency.isVerified).toBe(true)
      expect(res.body.metrics.packagesCount).toBeGreaterThanOrEqual(3)
      expect(res.body.metrics.activeDeparturesCount).toBeGreaterThanOrEqual(1)
    })

    test('4.5: Agency Director can access packages list', async () => {
      const res = await request(app)
        .get('/api/agency/packages')
        .set('Authorization', `Bearer ${agencyToken}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(3)
      const packageNames = res.body.map(p => p.name)
      expect(packageNames).toContain("Grand Circuit Tassili n'Ajjer & Cités de Pierre")
    })

    test('4.6: Agency Director can access agency financial dashboard', async () => {
      const res = await request(app)
        .get('/api/agency/financials/dashboard')
        .set('Authorization', `Bearer ${agencyToken}`)

      expect(res.status).toBe(200)
      expect(res.body.summary).toBeDefined()
      expect(res.body.summary.totalCollectedDZD).toBeGreaterThan(0)
      expect(res.body.summary.grossBookedValueDZD).toBeGreaterThan(0)
      expect(res.body.byMethod).toBeDefined()
    })

    test('4.7: Agency Director is forbidden from admin platform billing (403)', async () => {
      const res = await request(app)
        .get('/api/billings')
        .set('Authorization', `Bearer ${agencyToken}`)

      expect(res.status).toBe(403)
    })

    test('4.8: Administrator can access global platform billing & agency financials', async () => {
      const resBilling = await request(app)
        .get('/api/billings')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(resBilling.status).toBe(200)

      const resFinancials = await request(app)
        .get('/api/agency/financials/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)

      expect(resFinancials.status).toBe(200)
    })
  })

  describe('5. Realistic Fictional Demo Data Validation', () => {
    test('5.1: Demo Agency departures contain valid capacity & booked passenger counts', async () => {
      const agencyUser = await User.findOne({ email: DEMO_CREDENTIALS.agency.email })
      const departures = await TripDeparture.find({ agency: agencyUser._id })

      expect(departures.length).toBe(4)
      const guaranteed = departures.find(d => d.status === 'guaranteed')
      expect(guaranteed).toBeDefined()
      expect(guaranteed.bookedSeats).toBe(5)
      expect(guaranteed.capacity).toBe(14)
    })

    test('5.2: Demo bookings contain full passenger manifests', async () => {
      const booking = await TripBooking.findOne({ bookingReference: 'TRV-BKG-DEMO01' })

      expect(booking).toBeDefined()
      expect(booking.seats).toBe(2)
      expect(booking.passengers.length).toBe(2)
      expect(booking.passengers[0].fullName).toBe('Demo Tourist')
      expect(booking.passengers[0].specialNotes).toContain('photographe')
      expect(booking.financialStatus).toBe('paid')
      expect(booking.balanceDueDZD).toBe(0)
    })

    test('5.3: Partially paid booking accurately reflects deposit and balance due', async () => {
      const booking = await TripBooking.findOne({ bookingReference: 'TRV-BKG-DEMO02' })

      expect(booking).toBeDefined()
      expect(booking.financialStatus).toBe('partially_paid')
      expect(booking.totalPaidDZD).toBe(15000)
      expect(booking.balanceDueDZD).toBe(27000)
      expect(booking.totalPriceDZD).toBe(42000)
    })

    test('5.4: Custom enquiries and agency quotations are available', async () => {
      const enquiry = await TripEnquiry.findOne({ enquiryReference: 'TRV-ENQ-DEMO01' })

      expect(enquiry).toBeDefined()
      expect(enquiry.status).toBe('quoted')
      expect(enquiry.quotation).toBeDefined()
      expect(enquiry.quotation.quotedPriceDZD).toBe(360000)
      expect(enquiry.quotation.inclusions.length).toBeGreaterThan(0)
    })
  })

  describe('6. Idempotency & Persistence Safety', () => {
    test('6.1: Running seedDemoUsersAndData multiple times does not duplicate accounts or records', async () => {
      const countBeforeUsers = await User.countDocuments()
      const countBeforeTrips = await Trip.countDocuments()
      const countBeforeDepartures = await TripDeparture.countDocuments()
      const countBeforeBookings = await TripBooking.countDocuments()

      // Execute seeder again
      await seedDemoUsersAndData()

      const countAfterUsers = await User.countDocuments()
      const countAfterTrips = await Trip.countDocuments()
      const countAfterDepartures = await TripDeparture.countDocuments()
      const countAfterBookings = await TripBooking.countDocuments()

      expect(countAfterUsers).toBe(countBeforeUsers)
      expect(countAfterTrips).toBe(countBeforeTrips)
      expect(countAfterDepartures).toBe(countBeforeDepartures)
      expect(countAfterBookings).toBe(countBeforeBookings)
    })
  })
})
