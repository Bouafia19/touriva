const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// Explicit database target isolation check
const ISOLATED_TEST_MONGO_URI = 'mongodb://localhost:27017/touriva_e2e_pilot_validation'
if (!ISOLATED_TEST_MONGO_URI.includes('localhost') && !ISOLATED_TEST_MONGO_URI.includes('127.0.0.1')) {
  throw new Error('FATAL SAFETY VIOLATION: Test database must be isolated local MongoDB!')
}

// Override connection environment for test isolation
process.env.NODE_ENV = 'test'
process.env.MONGO_URI = ISOLATED_TEST_MONGO_URI

const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripEnquiry = require('../models/TripEnquiry')

describe('Touriva Phase 1–3 End-to-End Pilot Validation (10-Step Operational Walkthrough)', () => {
  const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

  // Synthetic Test Personas
  let adminUser = null
  let adminToken = null

  let agencyUserA = null
  let agencyTokenA = null // Atlas Evasion Algérie

  let agencyUserB = null
  let agencyTokenB = null // Tassili Voyages

  let unverifiedAgency = null
  let unverifiedToken = null

  let tourist1 = null
  let touristToken1 = null // Amina Benali

  let tourist2 = null
  let touristToken2 = null // Karim Mansouri

  let guestClaimant = null
  let guestClaimantToken = null // Hakim Claimant

  let packageAgencyA = null
  let sharedDeparture = null
  let confirmedBooking = null
  let customEnquiry = null

  beforeAll(async () => {
    // 1. Establish isolated local database connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }
    await mongoose.connect(ISOLATED_TEST_MONGO_URI)

    // 2. Clean slate for end-to-end validation
    await mongoose.connection.dropDatabase()

    const salt = await bcrypt.genSalt(10)
    const testHash = await bcrypt.hash('PilotPass2026!', salt)

    // 3. Seed synthetic personas
    adminUser = await User.create({
      firstName: 'Directeur',
      lastName: 'Superviseur',
      email: 'admin_pilot@touriva.synthetic.dz',
      phone: '0550000000',
      password: testHash,
      role: 'administrator',
      typeAccount: 'others',
      status: true
    })
    adminToken = jwt.sign({ _id: adminUser._id }, secret, { expiresIn: '1d' })

    agencyUserA = await User.create({
      firstName: 'Redha',
      lastName: 'Khelifi',
      email: 'agency_a_pilot@touriva.synthetic.dz',
      phone: '0550111111',
      password: testHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Atlas Evasion Algérie',
      fileStatus: 'confirmed',
      status: true
    })
    agencyTokenA = jwt.sign({ _id: agencyUserA._id }, secret, { expiresIn: '1d' })

    agencyUserB = await User.create({
      firstName: 'Sofiane',
      lastName: 'Brahimi',
      email: 'agency_b_pilot@touriva.synthetic.dz',
      phone: '0550222222',
      password: testHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Tassili Voyages',
      fileStatus: 'confirmed',
      status: true
    })
    agencyTokenB = jwt.sign({ _id: agencyUserB._id }, secret, { expiresIn: '1d' })

    unverifiedAgency = await User.create({
      firstName: 'Nabil',
      lastName: 'En Attente',
      email: 'agency_pending@touriva.synthetic.dz',
      phone: '0550999999',
      password: testHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      companyName: 'Agence Non Validée',
      fileStatus: 'pending',
      status: true
    })
    unverifiedToken = jwt.sign({ _id: unverifiedAgency._id }, secret, { expiresIn: '1d' })

    tourist1 = await User.create({
      firstName: 'Amina',
      lastName: 'Benali',
      email: 'tourist1_pilot@touriva.synthetic.dz',
      phone: '0550333333',
      password: testHash,
      role: 'client',
      typeAccount: 'visitor',
      status: true
    })
    touristToken1 = jwt.sign({ _id: tourist1._id }, secret, { expiresIn: '1d' })

    tourist2 = await User.create({
      firstName: 'Karim',
      lastName: 'Mansouri',
      email: 'tourist2_pilot@touriva.synthetic.dz',
      phone: '0550444444',
      password: testHash,
      role: 'client',
      typeAccount: 'visitor',
      status: true
    })
    touristToken2 = jwt.sign({ _id: tourist2._id }, secret, { expiresIn: '1d' })

    guestClaimant = await User.create({
      firstName: 'Hakim',
      lastName: 'Claimant',
      email: 'guest_claimant@touriva.synthetic.dz',
      phone: '0550555555',
      password: testHash,
      role: 'client',
      typeAccount: 'visitor',
      status: true
    })
    guestClaimantToken = jwt.sign({ _id: guestClaimant._id }, secret, { expiresIn: '1d' })

    // 4. Create base synthetic trip package for Agency A
    packageAgencyA = await Trip.create({
      name: 'Randonnée Djurdjura & Lac Goulmim',
      durationDays: 2,
      price: '20000',
      meetingPoint: 'Place Audin, Alger',
      creator: agencyUserA._id,
      published: true,
      status: 'published'
    })
  })

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase()
        await mongoose.disconnect()
      }
    } catch (e) {
      // safe cleanup
    }
  })

  // =========================================================================
  // SCENARIO 1: AGENCY A CREATES DEPARTURE (4 SEATS @ 20,000 DZD)
  // =========================================================================
  describe('Scenario 1: Agency A Creates Scheduled Departure', () => {
    it('Agency A logs in, visits /agency/departures, creates departure for 4 seats at 20,000 DZD', async () => {
      const departureDate = new Date(Date.now() + 86400000 * 10)
      const returnDate = new Date(Date.now() + 86400000 * 12)

      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          trip: packageAgencyA._id,
          startDate: departureDate,
          endDate: returnDate,
          capacity: 4,
          priceDZD: 20000,
          meetingPoint: 'Place Audin, Alger',
          departureInstructions: 'Rassemblement à 06h30 devant la Grande Poste.'
        })

      expect(res.status).toBe(201)
      expect(res.body._id).toBeDefined()
      expect(res.body.status).toBe('scheduled')
      expect(res.body.capacity).toBe(4)
      expect(res.body.bookedSeats).toBe(0)
      expect(res.body.availableSeats).toBe(4)
      expect(res.body.priceDZD).toBe(20000)
      expect(res.body.agency.toString()).toBe(agencyUserA._id.toString())

      sharedDeparture = res.body
    })

    it('Invariant Check: Unverified agency CANNOT create departures (403)', async () => {
      const res = await request(app)
        .post('/api/agency/departures')
        .set('Authorization', `Bearer ${unverifiedToken}`)
        .send({
          trip: packageAgencyA._id,
          startDate: new Date(Date.now() + 86400000 * 10),
          endDate: new Date(Date.now() + 86400000 * 12),
          capacity: 4,
          priceDZD: 20000
        })
      expect(res.status).toBe(403)
      expect(res.body.error).toContain('Agency verification is pending')
    })
  })

  // =========================================================================
  // SCENARIO 2: TOURIST 1 BOOKS 2 SEATS ON DEPARTURE
  // =========================================================================
  describe('Scenario 2: Tourist 1 Books 2 Seats', () => {
    it('Tourist 1 visits /trips, selects departure, books 2 seats with contact info', async () => {
      const seatsBefore = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats

      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 2,
          customerInfo: {
            fullName: 'Amina Benali',
            phone: '0550333333',
            email: 'tourist1_pilot@touriva.synthetic.dz'
          },
          passengers: [
            { fullName: 'Amina Benali', ageCategory: 'adult' },
            { fullName: 'Yacine Benali', ageCategory: 'adult' }
          ],
          specialRequests: 'Régime végétarien pour un passager'
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      const b = res.body.booking
      expect(b.bookingReference).toMatch(/^TRV-BKG-[A-F0-9]{8}$/)
      expect(b.status).toBe('pending')
      expect(b.seats).toBe(2)
      expect(b.unitPriceDZD).toBe(20000)
      expect(b.totalPriceDZD).toBe(40000)
      expect(b.passengers.length).toBe(2)

      // Verify atomic seat allocation
      const depAfter = await TripDeparture.findById(sharedDeparture._id)
      expect(depAfter.bookedSeats).toBe(seatsBefore + 2)
      expect(depAfter.bookedSeats).toBe(2)
      expect(depAfter.capacity - depAfter.bookedSeats).toBe(2) // 2 seats remaining

      confirmedBooking = b
    })
  })

  // =========================================================================
  // SCENARIO 3: AGENCY A CONFIRMS BOOKING
  // =========================================================================
  describe('Scenario 3: Agency A Confirms Booking', () => {
    it('Agency A visits /agency/bookings, views request under "En Attente", clicks Confirm', async () => {
      const res = await request(app)
        .patch(`/api/agency/bookings/${confirmedBooking._id}/confirm`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          note: 'Réservation validée par l agence Atlas Evasion'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.booking.status).toBe('confirmed')

      // Check status audit history
      const history = res.body.booking.statusHistory
      expect(history.length).toBeGreaterThanOrEqual(2)
      const latest = history[history.length - 1]
      expect(latest.status).toBe('confirmed')
      expect(latest.note).toBe('Réservation validée par l agence Atlas Evasion')
      expect(latest.changedBy.toString()).toBe(agencyUserA._id.toString())

      // Seats remain at 2/4
      const dep = await TripDeparture.findById(sharedDeparture._id)
      expect(dep.bookedSeats).toBe(2)
    })
  })

  // =========================================================================
  // SCENARIO 4: AGENCY A GENERATES & PRINTS PASSENGER MANIFEST
  // =========================================================================
  describe('Scenario 4: Passenger Manifest & HTML Print Layout', () => {
    it('Agency A visits /agency/departures, clicks manifest icon, and views HTML print view', async () => {
      const res = await request(app)
        .get(`/api/agency/departures/${sharedDeparture._id}/manifest?format=html`)
        .set('Authorization', `Bearer ${agencyTokenA}`)

      expect(res.status).toBe(200)
      expect(res.headers['content-type']).toContain('text/html')
      const html = res.text

      expect(html).toContain('Amina Benali')
      expect(html).toContain('Yacine Benali')
      expect(html).toContain('Atlas Evasion Algérie')
      expect(html).toContain('Randonnée Djurdjura &amp; Lac Goulmim')
      expect(html).toContain('RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE')
      expect(html).toContain("Fiche d'information interne")
      expect(html).toContain(confirmedBooking.bookingReference)
    })

    it('Security Check: Manifest HTML escaping neutralizes Stored XSS vectors', async () => {
      // Inject passenger with XSS payload
      const xssRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 1,
          customerInfo: { fullName: '<script>alert("XSS")</script>', phone: '0550333333' },
          passengers: [{
            fullName: '<img src=x onerror="alert(\'XSS\')">',
            specialNotes: '"><b onmouseover="alert(1)">hover</b>'
          }]
        })
      expect(xssRes.status).toBe(201)

      const manifestRes = await request(app)
        .get(`/api/agency/departures/${sharedDeparture._id}/manifest?format=html`)
        .set('Authorization', `Bearer ${agencyTokenA}`)

      expect(manifestRes.status).toBe(200)
      const html = manifestRes.text

      // Executable tags must be completely absent
      expect(html).not.toContain('<script>alert("XSS")</script>')
      expect(html).not.toContain('<img src=x onerror="alert(\'XSS\')">')
      expect(html).not.toContain('"><b onmouseover="alert(1)">hover</b>')

      // Properly escaped entities must be present
      expect(html).toContain('&lt;img src=x onerror=&quot;alert(&#39;XSS&#39;)&quot;&gt;')
      expect(html).toContain('&quot;&gt;&lt;b onmouseover=&quot;alert(1)&quot;&gt;hover&lt;/b&gt;')
    })
  })

  // =========================================================================
  // SCENARIO 5: AGENCY B DATA ISOLATION & IDOR PROTECTION
  // =========================================================================
  describe('Scenario 5: Agency B Data Isolation', () => {
    it('Agency B cannot see Agency A bookings or departures; direct API calls return 403', async () => {
      // Agency B lists its own bookings: must be empty
      const listRes = await request(app)
        .get('/api/agency/bookings')
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(listRes.status).toBe(200)
      const bookings = listRes.body.bookings || []
      const bookingIds = bookings.map(b => b._id)
      expect(bookingIds).not.toContain(confirmedBooking._id)

      // Direct IDOR attempt to view Agency A booking
      const getRes = await request(app)
        .get(`/api/agency/bookings/${confirmedBooking._id}`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect([403, 404]).toContain(getRes.status)

      // Direct IDOR attempt to confirm Agency A booking
      const patchRes = await request(app)
        .patch(`/api/agency/bookings/${confirmedBooking._id}/confirm`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({ note: 'Malicious confirmation' })
      expect(patchRes.status).toBe(403)

      // Direct IDOR attempt to view Agency A manifest
      const manifestRes = await request(app)
        .get(`/api/agency/departures/${sharedDeparture._id}/manifest`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
      expect(manifestRes.status).toBe(403)
      expect(manifestRes.body.error).toContain('Access forbidden')
    })
  })

  // =========================================================================
  // SCENARIO 6: OVERBOOKING CAPACITY OVERFLOW REJECTED
  // =========================================================================
  describe('Scenario 6: Capacity Overflow Rejection', () => {
    it('Tourist 2 attempts to book 3 seats on Agency A departure (only 1 remaining) -> 409 Conflict', async () => {
      // Total capacity is 4. Currently 2 seats (Amina) + 1 seat (XSS test) = 3 booked. Remaining = 1.
      const currentBooked = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats
      expect(currentBooked).toBe(3)

      // Attempt to book 3 seats
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken2}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 3,
          customerInfo: { fullName: 'Karim Mansouri', phone: '0550444444' }
        })

      expect(res.status).toBe(409)
      expect(res.body.error).toContain('insufficient remaining capacity')

      // Invariant: seats count remains strictly at 3, no partial or over-allocation
      const depAfter = await TripDeparture.findById(sharedDeparture._id)
      expect(depAfter.bookedSeats).toBe(3)
    })
  })

  // =========================================================================
  // SCENARIO 7: TOURIST 1 CANCELS BOOKING (EXACTLY-ONCE SEAT RELEASE)
  // =========================================================================
  describe('Scenario 7: Exactly-Once Seat Release on Cancellation', () => {
    it('Tourist 1 cancels their booking from my reservations; seats return from 3 to 1', async () => {
      const seatsBefore = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats

      // Cancel the 2-seat booking
      const res = await request(app)
        .post(`/api/bookings/${confirmedBooking._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({ reason: 'Empêchement professionnel imprévu' })

      expect(res.status).toBe(200)
      expect(res.body.booking.status).toBe('cancelled')
      expect(res.body.booking.cancelledBy.toString()).toBe(tourist1._id.toString())

      // Seats decrement by exactly 2
      const depAfter = await TripDeparture.findById(sharedDeparture._id)
      expect(depAfter.bookedSeats).toBe(seatsBefore - 2)

      // Repeated cancellation on already cancelled booking must fail safely
      const repeatRes = await request(app)
        .post(`/api/bookings/${confirmedBooking._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({ reason: 'Second cancel attempt' })

      expect(repeatRes.status).toBe(400)
      expect(repeatRes.body.error).toContain('cannot be cancelled')

      // Seats must NOT decrement again (double-release prevention)
      const depAfterRepeat = await TripDeparture.findById(sharedDeparture._id)
      expect(depAfterRepeat.bookedSeats).toBe(depAfter.bookedSeats)
    })
  })

  // =========================================================================
  // SCENARIO 8: TOURIST 2 SUBMITS CUSTOM ENQUIRY
  // =========================================================================
  describe('Scenario 8: Tourist 2 Submits Custom Trip Enquiry', () => {
    it('Tourist 2 submits custom enquiry via "Demander un Devis Sur-Mesure" on /tripDetail/:id', async () => {
      const res = await request(app)
        .post('/api/enquiries')
        .set('Authorization', `Bearer ${touristToken2}`)
        .send({
          destination: 'Hoggar & Assekrem',
          startDate: new Date(Date.now() + 86400000 * 20),
          endDate: new Date(Date.now() + 86400000 * 27),
          groupSize: 4,
          budgetDZD: 350000,
          theme: 'Circuit Sur Mesure',
          preferences: ['Bivouac désert', 'Photographie astronomique', 'Randonnée chamelière'],
          specialRequests: 'Véhicule 4x4 tout confort climatisé souhaité',
          agencyId: agencyUserA._id,
          customerInfo: {
            fullName: 'Karim Mansouri',
            phone: '0550444444',
            email: 'tourist2_pilot@touriva.synthetic.dz'
          }
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      const enq = res.body.enquiry
      expect(enq.enquiryReference).toMatch(/^TRV-ENQ-[A-F0-9]{8}$/)
      expect(enq.status).toBe('requested')
      expect(enq.groupSize).toBe(4)
      expect(enq.customer.toString()).toBe(tourist2._id.toString())
      expect(enq.agency._id.toString()).toBe(agencyUserA._id.toString())

      customEnquiry = enq
    })
  })

  // =========================================================================
  // SCENARIO 9: AGENCY A SUBMITS FORMAL QUOTATION
  // =========================================================================
  describe('Scenario 9: Agency A Reviews & Prepares Quotation', () => {
    it('Agency A visits /agency/enquiries, opens inquiry, submits quote (150,000 DZD, valid 7 days)', async () => {
      const validityDate = new Date(Date.now() + 86400000 * 7)

      const res = await request(app)
        .patch(`/api/agency/enquiries/${customEnquiry._id}/quote`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          quotedPriceDZD: 150000,
          itinerarySummary: 'Circuit privatif 7J/6N à Tamanrasset et le plateau de l Assekrem',
          inclusions: ['Véhicule 4x4 avec chauffeur guide touareg', 'Pension complète', 'Matériel de bivouac complet'],
          exclusions: ['Billets d avion Alger-Tamanrasset', 'Dépenses personnelles'],
          validUntil: validityDate,
          cancellationPolicy: 'Annulation sans frais jusqu à 10 jours avant le départ.'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      const enq = res.body.enquiry
      expect(enq.status).toBe('quoted')
      expect(enq.quotation.quotedPriceDZD).toBe(150000)
      expect(enq.quotation.inclusions.length).toBe(3)
      expect(enq.quotation.exclusions.length).toBe(2)
      expect(new Date(enq.quotation.validUntil).getTime()).toBe(validityDate.getTime())
      expect(enq.quotation.quotedBy.toString()).toBe(agencyUserA._id.toString())
    })
  })

  // =========================================================================
  // SCENARIO 10: TOURIST 2 ACCEPTS QUOTATION & SECURITY VERIFICATION
  // =========================================================================
  describe('Scenario 10: Tourist 2 Accepts Quotation & Authorization Checks', () => {
    it('Security Check: Unauthenticated caller CANNOT accept quotation (401)', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${customEnquiry._id}/accept`)
      expect(res.status).toBe(401)
    })

    it('Security Check: Cross-customer IDOR caller (Tourist 1) CANNOT accept Tourist 2 quotation (403)', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${customEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${touristToken1}`)
      expect(res.status).toBe(403)
      expect(res.body.error).toContain('Access forbidden')
    })

    it('Tourist 2 accepts the quote before expiry -> 200 OK', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${customEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${touristToken2}`)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.enquiry.status).toBe('accepted')
    })

    it('Repeated accept fails with 400 Bad Request', async () => {
      const res = await request(app)
        .patch(`/api/enquiries/${customEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${touristToken2}`)
      expect(res.status).toBe(400)
      expect(res.body.error).toContain('Cannot accept enquiry with status "accepted"')
    })

    it('Verified guest claimant flow: Authenticated user with matching phone claims & accepts guest enquiry', async () => {
      // 1. Create a guest enquiry without account (customer: null)
      const guestEnqRes = await request(app)
        .post('/api/enquiries')
        .send({
          destination: 'Ghardaia Mzab',
          startDate: new Date(Date.now() + 86400000 * 15),
          endDate: new Date(Date.now() + 86400000 * 18),
          groupSize: 2,
          agencyId: agencyUserA._id,
          customerInfo: { fullName: 'Hakim Claimant', phone: '0550555555' }
        })
      expect(guestEnqRes.status).toBe(201)
      const guestEnquiry = guestEnqRes.body.enquiry
      expect(guestEnquiry.customer).toBeNull()

      // 2. Agency A quotes it
      await request(app)
        .patch(`/api/agency/enquiries/${guestEnquiry._id}/quote`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          quotedPriceDZD: 75000,
          itinerarySummary: 'Visite des 5 cités de la vallée du Mzab',
          validUntil: new Date(Date.now() + 86400000 * 5)
        })

      // 3. User with different phone cannot accept (403)
      const failRes = await request(app)
        .patch(`/api/enquiries/${guestEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${touristToken1}`)
      expect(failRes.status).toBe(403)

      // 4. Authenticated user with matching verified phone (Hakim Claimant) accepts (200)
      const passRes = await request(app)
        .patch(`/api/enquiries/${guestEnquiry._id}/accept`)
        .set('Authorization', `Bearer ${guestClaimantToken}`)
      expect(passRes.status).toBe(200)
      expect(passRes.body.enquiry.status).toBe('accepted')
      expect(passRes.body.enquiry.customer.toString()).toBe(guestClaimant._id.toString())
    })
  })

  // =========================================================================
  // ADDITIONAL CHECK: IDEMPOTENCY-KEY SCOPING & CONCURRENCY
  // =========================================================================
  describe('Additional Security Check: Idempotency-Key Scoping & Concurrency', () => {
    const testKey = 'pilot-scoped-key-' + Date.now()

    it('1. Same customer retry returns existing booking (200, 0 additional seats)', async () => {
      const seatsBefore = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats

      // Initial booking with key
      const res1 = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 1,
          customerInfo: { fullName: 'Amina Benali', phone: '0550333333' },
          idempotencyKey: testKey
        })
      expect(res1.status).toBe(201)
      const bRef = res1.body.booking.bookingReference

      // Retry with same key and payload
      const res2 = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 1,
          customerInfo: { fullName: 'Amina Benali', phone: '0550333333' },
          idempotencyKey: testKey
        })
      expect(res2.status).toBe(200)
      expect(res2.body.booking.bookingReference).toBe(bRef)

      const seatsAfter = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore + 1) // Only allocated once!
    })

    it('2. Cross-customer key reuse rejected with 409 Conflict, 0 private data leaked', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken2}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 1,
          customerInfo: { fullName: 'Karim Mansouri', phone: '0550444444' },
          idempotencyKey: testKey // Reusing Tourist 1 key!
        })
      expect(res.status).toBe(409)
      expect(res.body.error).toContain('Idempotency key conflict')
      expect(res.body.booking).toBeUndefined() // Zero private data returned
    })

    it('3. Changed-payload reuse by same customer rejected with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${touristToken1}`)
        .send({
          departureId: sharedDeparture._id,
          seats: 2, // Changed payload (was 1)!
          customerInfo: { fullName: 'Amina Benali', phone: '0550333333' },
          idempotencyKey: testKey
        })
      expect(res.status).toBe(409)
      expect(res.body.error).toContain('parameters do not match')
    })

    it('4. Concurrent duplicate requests with same key allocate exactly 1 seat', async () => {
      const concKey = 'pilot-concurrent-' + Date.now()
      const seatsBefore = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats

      const [r1, r2] = await Promise.all([
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken2}`)
          .send({
            departureId: sharedDeparture._id,
            seats: 1,
            customerInfo: { fullName: 'Karim Mansouri', phone: '0550444444' },
            idempotencyKey: concKey
          }),
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${touristToken2}`)
          .send({
            departureId: sharedDeparture._id,
            seats: 1,
            customerInfo: { fullName: 'Karim Mansouri', phone: '0550444444' },
            idempotencyKey: concKey
          })
      ])

      expect([200, 201]).toContain(r1.status)
      expect([200, 201]).toContain(r2.status)
      expect(r1.body.booking.bookingReference).toBe(r2.body.booking.bookingReference)

      const seatsAfter = (await TripDeparture.findById(sharedDeparture._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore + 1) // Exactly one seat allocated!
    })
  })
})
