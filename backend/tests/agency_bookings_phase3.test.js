const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripEnquiry = require('../models/TripEnquiry')

describe('Phase 3 — Secure Booking, Passenger Management and Quotations Suite', () => {
  let adminUser = null
  let adminToken = null

  let agencyUserA = null
  let agencyTokenA = null // Verified Agency A

  let agencyUserB = null
  let agencyTokenB = null // Verified Agency B

  let touristUser = null
  let touristToken = null // Authenticated tourist

  let otherTouristUser = null
  let otherTouristToken = null

  let tripAgencyA = null
  let tripAgencyB = null
  let departureAgencyA = null
  let departureAgencyB = null
  let limitedDeparture = null // 2 seats capacity for concurrency testing

  let createdBookingA = null
  let createdEnquiry = null

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
          'test_admin_phase3@touriva.dz',
          'test_agency_a_p3@touriva.dz',
          'test_agency_b_p3@touriva.dz',
          'test_tourist_p3@touriva.dz',
          'test_othertourist_p3@touriva.dz'
        ]
      }
    })

    // 1. Admin
    adminUser = await User.create({
      email: 'test_admin_phase3@touriva.dz',
      phone: '+213798000001',
      password: testPasswordHash,
      role: 'administrator',
      typeAccount: 'others',
      activated: true,
      fileStatus: 'confirmed'
    })
    adminToken = jwt.sign({ _id: adminUser._id, role: adminUser.role }, secret, { expiresIn: '1h' })

    // 2. Verified Agency A
    agencyUserA = await User.create({
      email: 'test_agency_a_p3@touriva.dz',
      phone: '+213798000002',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Numidia Tours Constantine',
      activated: true,
      fileStatus: 'confirmed'
    })
    agencyTokenA = jwt.sign({ _id: agencyUserA._id, role: agencyUserA.role }, secret, { expiresIn: '1h' })

    // 3. Verified Agency B
    agencyUserB = await User.create({
      email: 'test_agency_b_p3@touriva.dz',
      phone: '+213798000003',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Sahara Horizon Djanet',
      activated: true,
      fileStatus: 'confirmed'
    })
    agencyTokenB = jwt.sign({ _id: agencyUserB._id, role: agencyUserB.role }, secret, { expiresIn: '1h' })

    // 4. Tourist 1
    touristUser = await User.create({
      email: 'test_tourist_p3@touriva.dz',
      phone: '+213798000004',
      password: testPasswordHash,
      role: 'client',
      typeAccount: 'visitor',
      firstName: 'Yacine',
      lastName: 'Brahimi',
      activated: true
    })
    touristToken = jwt.sign({ _id: touristUser._id, role: touristUser.role }, secret, { expiresIn: '1h' })

    // 5. Tourist 2
    otherTouristUser = await User.create({
      email: 'test_othertourist_p3@touriva.dz',
      phone: '+213798000005',
      password: testPasswordHash,
      role: 'client',
      typeAccount: 'visitor',
      firstName: 'Amina',
      lastName: 'Khelif',
      activated: true
    })
    otherTouristToken = jwt.sign({ _id: otherTouristUser._id, role: otherTouristUser.role }, secret, { expiresIn: '1h' })

    // Packages
    tripAgencyA = await Trip.create({
      name: 'Les Gorges du Rhumel & Constantine Antique',
      price: '18000',
      durationDays: 2,
      creator: agencyUserA._id,
      status: 'published',
      published: true
    })

    tripAgencyB = await Trip.create({
      name: 'Trek Essendilene & Canyons du Tassili',
      price: '55000',
      durationDays: 7,
      creator: agencyUserB._id,
      status: 'published',
      published: true
    })

    // Standard Departures
    departureAgencyA = await TripDeparture.create({
      trip: tripAgencyA._id,
      agency: agencyUserA._id,
      startDate: new Date(Date.now() + 86400000 * 15),
      endDate: new Date(Date.now() + 86400000 * 17),
      priceDZD: 18000,
      capacity: 10,
      bookedSeats: 0,
      meetingPoint: 'Place de la Brèche, Constantine',
      status: 'scheduled'
    })

    departureAgencyB = await TripDeparture.create({
      trip: tripAgencyB._id,
      agency: agencyUserB._id,
      startDate: new Date(Date.now() + 86400000 * 20),
      endDate: new Date(Date.now() + 86400000 * 27),
      priceDZD: 55000,
      capacity: 12,
      bookedSeats: 0,
      meetingPoint: 'Aéroport Djanet Tiska',
      status: 'scheduled'
    })

    // Limited Capacity Departure for Concurrency Tests (Only 2 seats available!)
    limitedDeparture = await TripDeparture.create({
      trip: tripAgencyA._id,
      agency: agencyUserA._id,
      startDate: new Date(Date.now() + 86400000 * 30),
      endDate: new Date(Date.now() + 86400000 * 32),
      priceDZD: 18000,
      capacity: 2,
      bookedSeats: 0,
      meetingPoint: 'Constantine',
      status: 'scheduled'
    })
  })

  afterAll(async () => {
    // Delete bookings
    await TripBooking.deleteMany({
      agency: { $in: [agencyUserA?._id, agencyUserB?._id].filter(Boolean) }
    })

    // Delete enquiries
    await TripEnquiry.deleteMany({
      $or: [
        { customer: { $in: [touristUser?._id, otherTouristUser?._id].filter(Boolean) } },
        { agency: { $in: [agencyUserA?._id, agencyUserB?._id].filter(Boolean) } }
      ]
    })

    // Delete departures
    await TripDeparture.deleteMany({
      agency: { $in: [agencyUserA?._id, agencyUserB?._id].filter(Boolean) }
    })

    // Delete trips
    await Trip.deleteMany({
      creator: { $in: [agencyUserA?._id, agencyUserB?._id].filter(Boolean) }
    })

    // Delete users
    await User.deleteMany({
      email: {
        $in: [
          'test_admin_phase3@touriva.dz',
          'test_agency_a_p3@touriva.dz',
          'test_agency_b_p3@touriva.dz',
          'test_tourist_p3@touriva.dz',
          'test_othertourist_p3@touriva.dz'
        ]
      }
    })

    await mongoose.connection.close()
  })

  // =========================================================================
  // 1. BOOKING CREATION, VALIDATION & SERVER-SIDE PRICING
  // =========================================================================
  describe('1. Booking Creation, Validation & Server-Side Security', () => {
    it('1.1: Rejects booking with missing departureId or invalid ID (400)', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          seats: 1,
          customerInfo: { fullName: 'Ali Benali', phone: '0550123456' }
        })
      expect(res.status).toBe(400)
    })

    it('1.2: Rejects booking with invalid seat counts (zero or negative) (400)', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyA._id,
          seats: 0,
          customerInfo: { fullName: 'Ali Benali', phone: '0550123456' }
        })
      expect(res.status).toBe(400)
    })

    it('1.3: Rejects booking with invalid contact phone format (400)', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyA._id,
          seats: 1,
          customerInfo: { fullName: 'Ali Benali', phone: 'invalid-phone' }
        })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/phone/i)
    })

    it('1.4: Creates a verified booking with unique TRV-BKG reference and server-trusted price', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          departureId: departureAgencyA._id,
          seats: 2,
          unitPriceDZD: 1, // Attacker attempts to forge price!
          totalPriceDZD: 2, // Attacker attempts to forge total!
          customerInfo: {
            fullName: 'Yacine Brahimi',
            phone: '0550112233',
            email: 'yacine@example.com'
          },
          passengers: [
            { fullName: 'Yacine Brahimi', ageCategory: 'adult' },
            { fullName: 'Maya Brahimi', ageCategory: 'child' }
          ]
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      const b = res.body.booking
      expect(b).toBeDefined()
      expect(b.bookingReference).toMatch(/^TRV-BKG-[A-F0-9]{8}$/)
      // Server-side pricing enforcement: unitPrice must be 18000 (from departure), total must be 36000
      expect(b.unitPriceDZD).toBe(18000)
      expect(b.totalPriceDZD).toBe(36000)
      expect(b.seats).toBe(2)
      expect(b.status).toBe('pending')
      expect(b.passengers.length).toBe(2)
      expect(b.agency._id.toString()).toBe(agencyUserA._id.toString())

      // Verify seats were held on departure (0 + 2 = 2 booked)
      const dep = await TripDeparture.findById(departureAgencyA._id)
      expect(dep.bookedSeats).toBe(2)

      createdBookingA = b
    })

    it('1.5: Idempotent Submission: Re-submitting same request with same idempotencyKey returns existing booking without double-allocation', async () => {
      const idempotencyKey = 'idempotent-test-req-001'

      // First call
      const res1 = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyA._id,
          seats: 1,
          customerInfo: { fullName: 'Idempotent Tester', phone: '0550998877' },
          idempotencyKey
        })
      expect(res1.status).toBe(201)
      const ref1 = res1.body.booking.bookingReference

      const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats

      // Second call with same idempotencyKey (simulating network retry)
      const res2 = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyA._id,
          seats: 1,
          customerInfo: { fullName: 'Idempotent Tester', phone: '0550998877' },
          idempotencyKey
        })
      expect(res2.status).toBe(200)
      expect(res2.body.booking.bookingReference).toBe(ref1)

      const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore) // Exactly zero additional seats allocated!
    })
  })

  // =========================================================================
  // 2. ATOMIC CAPACITY ALLOCATION & OVERBOOKING PREVENTION
  // =========================================================================
  describe('2. Atomic Capacity Allocation & Concurrency Overbooking Prevention', () => {
    it('2.1: Atomically prevents overbooking when multiple concurrent requests compete for remaining seats', async () => {
      // limitedDeparture has total capacity = 2, currently 0 booked
      const depBefore = await TripDeparture.findById(limitedDeparture._id)
      expect(depBefore.capacity).toBe(2)
      expect(depBefore.bookedSeats).toBe(0)

      // Launch 10 simultaneous booking requests, each requesting 1 seat
      const concurrentRequests = Array.from({ length: 10 }, (_, i) => {
        return request(app)
          .post('/api/bookings')
          .send({
            departureId: limitedDeparture._id,
            seats: 1,
            customerInfo: {
              fullName: `Racer ${i}`,
              phone: `055010000${i}`
            }
          })
      })

      const results = await Promise.all(concurrentRequests)

      // Exactly 2 requests must succeed (201 Created), and exactly 8 must be rejected (409 Conflict)
      const successful = results.filter(r => r.status === 201)
      const rejected = results.filter(r => r.status === 409)

      expect(successful.length).toBe(2)
      expect(rejected.length).toBe(8)

      // Verify database bookedSeats equals exactly capacity (2), never overbooked!
      const depAfter = await TripDeparture.findById(limitedDeparture._id)
      expect(depAfter.bookedSeats).toBe(2)
      expect(depAfter.availableSeats).toBe(0)
    })

    it('2.2: Rejects booking exceeding remaining capacity even in a single request (409)', async () => {
      // limitedDeparture is now full (2/2 booked)
      const res = await request(app)
        .post('/api/bookings')
        .send({
          departureId: limitedDeparture._id,
          seats: 1,
          customerInfo: { fullName: 'Late Traveler', phone: '0550999999' }
        })
      expect(res.status).toBe(409)
      expect(res.body.error).toMatch(/insufficient|fully booked/i)
    })
  })

  // =========================================================================
  // 3. CANCELLATION, REJECTION & ATOMIC SEAT RELEASE
  // =========================================================================
  describe('3. Booking Cancellation, Rejection & Seat Release Integrity', () => {
    it('3.1: Agency rejecting pending booking releases the held seats atomically', async () => {
      const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats

      // Create a temporary 2-seat booking
      const bRes = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyA._id,
          seats: 2,
          customerInfo: { fullName: 'To Be Rejected', phone: '0550334455' }
        })
      expect(bRes.status).toBe(201)
      const bId = bRes.body.booking._id

      const seatsMid = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsMid).toBe(seatsBefore + 2)

      // Agency A rejects the booking with valid reason
      const rejectRes = await request(app)
        .patch(`/api/agency/bookings/${bId}/reject`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          rejectionReason: 'Session réservée en priorité pour un groupe scolaire.'
        })
      expect(rejectRes.status).toBe(200)
      expect(rejectRes.body.booking.status).toBe('rejected')

      // Verify seats were released back to original
      const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore)
    })

    it('3.2: Rejects booking rejection without a reason (400)', async () => {
      const res = await request(app)
        .patch(`/api/agency/bookings/${createdBookingA._id}/reject`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({})
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/reason/i)
    })

    it('3.3: Tourist cancels their own booking, releasing seats exactly once', async () => {
      const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      const bookingSeats = createdBookingA.seats // 2 seats

      // Tourist cancels
      const cancelRes = await request(app)
        .post(`/api/bookings/${createdBookingA._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          cancellationReason: 'Empêchement professionnel imprévu.'
        })
      expect(cancelRes.status).toBe(200)
      expect(cancelRes.body.booking.status).toBe('cancelled')

      const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore - bookingSeats)

      // Idempotency: Attempting to cancel already cancelled booking returns 400 and DOES NOT double-release seats
      const doubleCancelRes = await request(app)
        .post(`/api/bookings/${createdBookingA._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({ cancellationReason: 'Repeated cancel' })
      expect(doubleCancelRes.status).toBe(400)

      const seatsFinal = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsFinal).toBe(seatsAfter) // Unchanged!
    })
  })

  // =========================================================================
  // 4. AGENCY BOOKING DASHBOARD & CROSS-AGENCY IDOR HARDENING
  // =========================================================================
  describe('4. Agency Booking Management & Cross-Agency Isolation', () => {
    let bookingB = null

    beforeAll(async () => {
      // Create a booking for Agency B's departure
      const res = await request(app)
        .post('/api/bookings')
        .send({
          departureId: departureAgencyB._id,
          seats: 3,
          customerInfo: { fullName: 'Sahara Explorer', phone: '0550778899' },
          passengers: [
            { fullName: 'Sahara Explorer', ageCategory: 'adult' },
            { fullName: 'Companion 1', ageCategory: 'adult' },
            { fullName: 'Child 1', ageCategory: 'child' }
          ]
        })
      bookingB = res.body.booking
    })

    it('4.1: Agency A retrieves only its own bookings (Data Isolation)', async () => {
      const res = await request(app)
        .get('/api/agency/bookings')
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.bookings)).toBe(true)

      const ids = res.body.bookings.map(b => b._id.toString())
      expect(ids).not.toContain(bookingB._id.toString())
    })

    it('4.2: Agency B retrieves only its own bookings', async () => {
      const res = await request(app)
        .get('/api/agency/bookings')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      const ids = res.body.bookings.map(b => b._id.toString())
      expect(ids).toContain(bookingB._id.toString())
    })

    it('4.3: IDOR Prevention: Agency A CANNOT access Agency B booking detail (403/404)', async () => {
      const res = await request(app)
        .get(`/api/agency/bookings/${bookingB._id}`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect([403, 404]).toContain(res.status)
    })

    it('4.4: IDOR Prevention: Agency A CANNOT confirm or reject Agency B booking (403/404)', async () => {
      const res = await request(app)
        .patch(`/api/agency/bookings/${bookingB._id}/confirm`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect([403, 404]).toContain(res.status)
    })

    it('4.5: Agency B CAN confirm its own pending booking', async () => {
      const res = await request(app)
        .patch(`/api/agency/bookings/${bookingB._id}/confirm`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      expect(res.body.booking.status).toBe('confirmed')
    })
  })

  // =========================================================================
  // 5. PASSENGER MANIFESTS & ACCESS CONTROLS
  // =========================================================================
  describe('5. Passenger Manifest Generation & Access Controls', () => {
    it('5.1: Agency B can generate passenger manifest for its own departure session', async () => {
      const res = await request(app)
        .get(`/api/agency/departures/${departureAgencyB._id}/manifest`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      expect(res.body.manifestReference).toMatch(/^MNF-[A-F0-9]{6}$/)
      expect(res.body.agency.name).toBe('Sahara Horizon Djanet')
      expect(res.body.session.totalPassengers).toBe(3)
      expect(Array.isArray(res.body.passengers)).toBe(true)
      expect(res.body.passengers.length).toBe(3)
      expect(res.body.passengers[0].fullName).toBe('Sahara Explorer')
    })

    it('5.2: Generates clean printable HTML manifest when format=html is requested', async () => {
      const res = await request(app)
        .get(`/api/agency/departures/${departureAgencyB._id}/manifest?format=html`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      expect(res.text).toContain('RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE')
      expect(res.text).toContain('MANIFESTE OFFICIEL DES PASSAGERS')
      expect(res.text).toContain('Sahara Explorer')
    })

    it('5.3: IDOR Prevention: Agency A CANNOT access Agency B departure passenger manifest (403/404)', async () => {
      const res = await request(app)
        .get(`/api/agency/departures/${departureAgencyB._id}/manifest`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
      expect([403, 404]).toContain(res.status)
    })

    it('5.4: Unauthorized tourist or unauthenticated client CANNOT access passenger manifests (401/403)', async () => {
      const unauth = await request(app)
        .get(`/api/agency/departures/${departureAgencyB._id}/manifest`)
      expect(unauth.status).toBe(401)

      const touristRes = await request(app)
        .get(`/api/agency/departures/${departureAgencyB._id}/manifest`)
        .set('Authorization', `Bearer ${touristToken}`)
      expect(touristRes.status).toBe(403)
    })
  })

  // =========================================================================
  // 6. CUSTOM-TRIP ENQUIRIES & QUOTATIONS WORKFLOW
  // =========================================================================
  describe('6. Custom-Trip Enquiries & Quotations Workflow', () => {
    it('6.1: Tourist submits tailored-trip enquiry with valid dates, group size and preferences', async () => {
      const start = new Date(Date.now() + 86400000 * 40)
      const end = new Date(Date.now() + 86400000 * 46)

      const res = await request(app)
        .post('/api/enquiries')
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          destination: 'Tassili n Ajjer (Djanet)',
          startDate: start,
          endDate: end,
          groupSize: 4,
          budgetDZD: 250000,
          theme: 'Randonnée Chamelière & Peintures Rupestres',
          preferences: ['Bivouac sous les étoiles', 'Cuisine traditionnelle touareg'],
          specialRequests: 'Deux végétariens dans le groupe.',
          agencyId: agencyUserB._id, // Targeted to Agency B
          customerInfo: {
            fullName: 'Yacine Brahimi',
            phone: '0550112233'
          }
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      const e = res.body.enquiry
      expect(e.enquiryReference).toMatch(/^TRV-ENQ-[A-F0-9]{8}$/)
      expect(e.status).toBe('requested')
      expect(e.groupSize).toBe(4)
      expect(e.agency._id.toString()).toBe(agencyUserB._id.toString())
      createdEnquiry = e
    })

    it('6.2: Rejects custom enquiry when return date is before start date (400)', async () => {
      const res = await request(app)
        .post('/api/enquiries')
        .send({
          destination: 'Oran',
          startDate: new Date(Date.now() + 86400000 * 10),
          endDate: new Date(Date.now() + 86400000 * 5), // Invalid!
          groupSize: 2,
          customerInfo: { fullName: 'Test Traveler', phone: '0550123456' }
        })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/return date/i)
    })

    it('6.3: Targeted Agency B retrieves the custom enquiry', async () => {
      const res = await request(app)
        .get('/api/agency/enquiries')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(res.status).toBe(200)
      const ids = res.body.map(e => e._id.toString())
      expect(ids).toContain(createdEnquiry._id.toString())
    })

    it('6.4: Agency B prepares and submits a formal quotation with valid price and future validity', async () => {
      const validUntil = new Date(Date.now() + 86400000 * 7) // Valid for 7 days

      const res = await request(app)
        .post(`/api/agency/enquiries/${createdEnquiry._id}/quote`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({
          quotedPriceDZD: 240000,
          itinerarySummary: 'Circuit privatisé 6J/5N à travers Tikobaouine, Essendilene et le canyon d Ihrir.',
          inclusions: ['4x4 privatif', 'Guide touareg expérimenté', 'Cuisinier et bivouac complet'],
          exclusions: ['Billets d avion Alger-Djanet'],
          validUntil,
          cancellationPolicy: 'Remboursement intégral jusqu à 14 jours avant le départ.'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const e = res.body.enquiry
      expect(e.status).toBe('quoted')
      expect(e.quotation.quotedPriceDZD).toBe(240000)
      expect(e.quotation.inclusions.length).toBe(3)
    })

    it('6.5: Tourist accepts the formal quotation before expiry', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${createdEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${touristToken}`)
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.enquiry.status).toBe('accepted')
    })
  })

  // =========================================================================
  // 7. REGRESSION SAFETY OF PHASE 1 & PHASE 2
  // =========================================================================
  describe('7. Platform Integrity & Regression Check', () => {
    it('7.1: Public trip discovery remains unblocked and functional', async () => {
      const res = await request(app).get('/api/trips?published=true')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('7.2: Public departures discovery endpoint functions correctly', async () => {
      const res = await request(app).get(`/api/trips/${tripAgencyA._id}/departures`)
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  // =========================================================================
  // 8. PHASE 3 PRIORITY 1 SECURITY REMEDIATION REGRESSION SUITE
  // =========================================================================
  describe('8. Phase 3 Priority 1 Security Remediation Regression Suite', () => {
    const { escapeHtml } = require('../controllers/agencyController')

    describe('8.1: Passenger Manifest Stored XSS Prevention & Escaping', () => {
      it('8.1.1: escapeHtml helper neutralizes dangerous HTML entities properly', () => {
        expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;')
        expect(escapeHtml("Tom & Jerry's <tag>")).toBe('Tom &amp; Jerry&#39;s &lt;tag&gt;')
        expect(escapeHtml(null)).toBe('')
        expect(escapeHtml(undefined)).toBe('')
        expect(escapeHtml(123)).toBe('123')
      })

      it('8.1.2: Manifest HTML output renders malicious scripts and attributes as inert text', async () => {
        // Book departure with malicious XSS injection payloads
        const xssBookingRes = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            departureId: departureAgencyB._id,
            seats: 1,
            customerInfo: {
              fullName: '<script>alert("XSS-CUSTOMER")</script>',
              phone: '0550123456'
            },
            passengers: [
              {
                fullName: '<img src=x onerror="fetch(\'/steal?c=\'+document.cookie)">',
                specialNotes: '"><script>alert("XSS-NOTES")</script><b onmouseover="alert(1)">hover</b>',
                emergencyPhone: '0550123456'
              }
            ],
            specialRequests: '<script>alert("XSS-SPECIAL")</script>'
          })

        expect(xssBookingRes.status).toBe(201)

        // Agency B fetches the printable HTML manifest
        const manifestRes = await request(app)
          .get(`/api/agency/departures/${departureAgencyB._id}/manifest?format=html`)
          .set('Authorization', `Bearer ${agencyTokenB}`)

        expect(manifestRes.status).toBe(200)
        expect(manifestRes.headers['content-type']).toContain('text/html')

        const html = manifestRes.text

        // Verify unescaped raw tags do NOT exist in the output HTML
        expect(html).not.toContain('<script>alert("XSS-CUSTOMER")</script>')
        expect(html).not.toContain('<img src=x onerror="fetch(\'/steal?c=\'+document.cookie)">')
        expect(html).not.toContain('"><script>alert("XSS-NOTES")</script>')
        expect(html).not.toContain('<b onmouseover="alert(1)">hover</b>')

        // Verify properly escaped entity representations ARE present
        expect(html).toContain('&lt;img src=x onerror=&quot;fetch(&#39;/steal?c=&#39;+document.cookie)&quot;&gt;')
        expect(html).toContain('&quot;&gt;&lt;script&gt;alert(&quot;XSS-NOTES&quot;)&lt;/script&gt;')
      })
    })

    describe('8.2: Quotation Acceptance and Decline Authorization', () => {
      let quotableEnquiry = null
      let guestEnquiry = null
      let guestVerifiedUser = null
      let guestVerifiedToken = null

      beforeAll(async () => {
        // Create a verified user whose phone matches the guest enquiry
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash('TestPass123!', salt)
        guestVerifiedUser = await User.create({
          firstName: 'Verified',
          lastName: 'GuestClaimant',
          email: 'guest_claimant_p3@touriva.dz',
          phone: '0555887766',
          password: hash,
          role: 'client',
          typeAccount: 'visitor'
        })
        guestVerifiedToken = jwt.sign({ _id: guestVerifiedUser._id }, secret, { expiresIn: '1d' })

        // 1. Create an authenticated enquiry owned by touristUser
        const enqRes = await request(app)
          .post('/api/enquiries')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            destination: 'Tassili n Ajjer Remediation',
            startDate: new Date(Date.now() + 86400000 * 20),
            endDate: new Date(Date.now() + 86400000 * 25),
            groupSize: 2,
            agencyId: agencyUserB._id,
            customerInfo: { fullName: 'Tourist Owner', phone: '0550112233' }
          })
        quotableEnquiry = enqRes.body.enquiry

        // Agency B quotes this enquiry
        await request(app)
          .patch(`/api/agency/enquiries/${quotableEnquiry._id}/quote`)
          .set('Authorization', `Bearer ${agencyTokenB}`)
          .send({
            quotedPriceDZD: 180000,
            itinerarySummary: 'Test Quotation Authorization Itinerary',
            validUntil: new Date(Date.now() + 86400000 * 7)
          })

        // 2. Create a guest enquiry (customer: null) with phone 0555887766
        const guestEnqRes = await request(app)
          .post('/api/enquiries')
          .send({
            destination: 'Ghardaia Guest Remediation',
            startDate: new Date(Date.now() + 86400000 * 15),
            endDate: new Date(Date.now() + 86400000 * 18),
            groupSize: 1,
            agencyId: agencyUserB._id,
            customerInfo: { fullName: 'Guest Traveler', phone: '0555887766' }
          })
        guestEnquiry = guestEnqRes.body.enquiry

        // Agency B quotes guest enquiry
        await request(app)
          .patch(`/api/agency/enquiries/${guestEnquiry._id}/quote`)
          .set('Authorization', `Bearer ${agencyTokenB}`)
          .send({
            quotedPriceDZD: 95000,
            itinerarySummary: 'Guest Quotation Summary',
            validUntil: new Date(Date.now() + 86400000 * 5)
          })
      })

      afterAll(async () => {
        if (guestVerifiedUser) {
          await User.findByIdAndDelete(guestVerifiedUser._id)
        }
      })

      it('8.2.1: Rejects unauthenticated caller attempting to accept a quotation (401)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${quotableEnquiry._id}/accept`)
        expect(res.status).toBe(401)
      })

      it('8.2.2: Rejects unauthenticated caller attempting to decline a quotation (401)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${quotableEnquiry._id}/decline`)
          .send({ reason: 'Malicious unauthenticated decline' })
        expect(res.status).toBe(401)
      })

      it('8.2.3: Rejects ID guessing with nonexistent enquiry ID (404)', async () => {
        const fakeId = new mongoose.Types.ObjectId()
        const res = await request(app)
          .patch(`/api/enquiries/${fakeId}/accept`)
          .set('Authorization', `Bearer ${touristToken}`)
        expect(res.status).toBe(404)
        expect(res.body.error).toBe('Enquiry not found')
      })

      it('8.2.4: IDOR Prevention: Other authenticated tourist CANNOT accept another customer\'s quotation (403)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${quotableEnquiry._id}/accept`)
          .set('Authorization', `Bearer ${otherTouristToken}`)
        expect(res.status).toBe(403)
        expect(res.body.error).toContain('Access forbidden')
      })

      it('8.2.5: IDOR Prevention: Other authenticated tourist CANNOT decline another customer\'s quotation (403)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${quotableEnquiry._id}/decline`)
          .set('Authorization', `Bearer ${otherTouristToken}`)
          .send({ reason: 'Unauthorized decline' })
        expect(res.status).toBe(403)
        expect(res.body.error).toContain('Access forbidden')
      })

      it('8.2.6: Unauthenticated caller supplying guest phone in payload is REJECTED without login (401)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${guestEnquiry._id}/accept`)
          .send({ phone: '0555887766' })
        expect(res.status).toBe(401)
      })

      it('8.2.7: Authenticated user with different account phone CANNOT accept guest enquiry (403)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${guestEnquiry._id}/accept`)
          .set('Authorization', `Bearer ${otherTouristToken}`) // otherTourist has different phone
        expect(res.status).toBe(403)
      })

      it('8.2.8: Authenticated user with matching verified account phone CAN accept guest enquiry (200)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${guestEnquiry._id}/accept`)
          .set('Authorization', `Bearer ${guestVerifiedToken}`)
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.enquiry.status).toBe('accepted')
        expect(res.body.enquiry.customer.toString()).toBe(guestVerifiedUser._id.toString())
      })

      it('8.2.9: Owner customer successfully declines an active quotation (200)', async () => {
        const res = await request(app)
          .patch(`/api/enquiries/${quotableEnquiry._id}/decline`)
          .set('Authorization', `Bearer ${touristToken}`)
          .send({ reason: 'Trip rescheduled by customer' })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.enquiry.status).toBe('declined')
        expect(res.body.enquiry.declineReason).toBe('Trip rescheduled by customer')
      })

      it('8.2.10: Administrator can decline a quotation on administrative review (200)', async () => {
        // Create and quote another enquiry
        const adminEnqRes = await request(app)
          .post('/api/enquiries')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            destination: 'Admin Review Trip',
            startDate: new Date(Date.now() + 86400000 * 10),
            endDate: new Date(Date.now() + 86400000 * 12),
            groupSize: 1,
            agencyId: agencyUserB._id,
            customerInfo: { fullName: 'Tourist Admin Review', phone: '0550112233' }
          })
        const adminEnquiry = adminEnqRes.body.enquiry

        await request(app)
          .patch(`/api/agency/enquiries/${adminEnquiry._id}/quote`)
          .set('Authorization', `Bearer ${agencyTokenB}`)
          .send({
            quotedPriceDZD: 50000,
            itinerarySummary: 'Admin review itinerary',
            validUntil: new Date(Date.now() + 86400000 * 3)
          })

        const res = await request(app)
          .patch(`/api/enquiries/${adminEnquiry._id}/decline`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ reason: 'Declined per administrative compliance oversight' })
        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.enquiry.status).toBe('declined')
      })
    })

    describe('8.3: Booking Idempotency-Key Scoping & Behavior', () => {
      const uniqueKey = 'scoped-idem-key-' + Date.now()

      it('8.3.1: Same customer retries with same idempotencyKey returns existing booking (200)', async () => {
        // Initial request
        const res1 = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            departureId: departureAgencyA._id,
            seats: 1,
            customerInfo: { fullName: 'Tourist One', phone: '0550112233' },
            idempotencyKey: uniqueKey
          })
        expect(res1.status).toBe(201)
        const bookingRef = res1.body.booking.bookingReference

        const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats

        // Retry by same customer with same key and same payload
        const res2 = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            departureId: departureAgencyA._id,
            seats: 1,
            customerInfo: { fullName: 'Tourist One', phone: '0550112233' },
            idempotencyKey: uniqueKey
          })
        expect(res2.status).toBe(200)
        expect(res2.body.booking.bookingReference).toBe(bookingRef)
        expect(res2.body.message).toContain('idempotent record')

        const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
        expect(seatsAfter).toBe(seatsBefore) // 0 additional seats allocated
      })

      it('8.3.2: Cross-customer key reuse is REJECTED with 409 and does not reveal previous booking', async () => {
        // Other tourist attempts to submit with uniqueKey created by touristUser
        const res = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${otherTouristToken}`)
          .send({
            departureId: departureAgencyA._id,
            seats: 1,
            customerInfo: { fullName: 'Other Tourist', phone: '0550445566' },
            idempotencyKey: uniqueKey
          })

        expect(res.status).toBe(409)
        expect(res.body.error).toContain('Idempotency key conflict')
        expect(res.body.booking).toBeUndefined() // Zero private data exposed!
      })

      it('8.3.3: Changed-payload reuse by same customer is REJECTED with 409 Conflict', async () => {
        // Same customer reuses uniqueKey but changes seat count from 1 to 2
        const res = await request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            departureId: departureAgencyA._id,
            seats: 2, // Changed payload!
            customerInfo: { fullName: 'Tourist One', phone: '0550112233' },
            idempotencyKey: uniqueKey
          })

        expect(res.status).toBe(409)
        expect(res.body.error).toContain('parameters do not match')
      })

      it('8.3.4: Concurrent duplicate requests with same key allocate seats exactly once', async () => {
        const concurrentKey = 'concurrent-idem-' + Date.now()
        const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats

        // Dispatch 2 simultaneous requests with identical payload and key
        const [r1, r2] = await Promise.all([
          request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${touristToken}`)
            .send({
              departureId: departureAgencyA._id,
              seats: 1,
              customerInfo: { fullName: 'Tourist One', phone: '0550112233' },
              idempotencyKey: concurrentKey
            }),
          request(app)
            .post('/api/bookings')
            .set('Authorization', `Bearer ${touristToken}`)
            .send({
              departureId: departureAgencyA._id,
              seats: 1,
              customerInfo: { fullName: 'Tourist One', phone: '0550112233' },
              idempotencyKey: concurrentKey
            })
        ])

        // Both requests must complete successfully with valid HTTP statuses (201/200)
        expect([200, 201]).toContain(r1.status)
        expect([200, 201]).toContain(r2.status)

        // Both responses reference the EXACT same booking reference
        const ref1 = r1.body.booking?.bookingReference
        const ref2 = r2.body.booking?.bookingReference
        expect(ref1).toBeDefined()
        expect(ref2).toBeDefined()
        expect(ref1).toBe(ref2)

        // Capacity allocated is exactly 1 seat, zero overbooking
        const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
        expect(seatsAfter).toBe(seatsBefore + 1)
      })
    })
  })
})
