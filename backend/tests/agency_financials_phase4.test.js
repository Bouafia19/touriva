const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')
const app = require('../server')
const User = require('../models/User')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripPayment = require('../models/TripPayment')
const TripRefund = require('../models/TripRefund')
const { recalculateBookingFinancials, validateDepositConfig } = require('../utils/financialCalculator')

describe('Phase 4 — Financial Tracking, Proof Verification & Audit Suite', () => {
  let adminUser = null
  let adminToken = null

  let agencyUserA = null
  let agencyTokenA = null // Verified Agency A

  let agencyUserB = null
  let agencyTokenB = null // Verified Agency B

  let touristUser = null
  let touristToken = null // Authenticated tourist 1

  let otherTouristUser = null
  let otherTouristToken = null // Authenticated tourist 2

  let tripAgencyA = null
  let departureAgencyA = null
  let bookingAgencyA = null

  let tripAgencyB = null
  let departureAgencyB = null
  let bookingAgencyB = null

  const secret = process.env.SECRET || 'touriva_jwt_secret_dev'

  // Sample valid test proofs
  // 1x1 100% genuine JPEG (FF D8 FF E0 ...)
  const validJpegBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='
  // Minimal valid PDF (%PDF-1.4 ...)
  const validPdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbXWVuZGJvmoo='
  // Disguised script/executable (magic numbers != JPEG/PNG/PDF)
  const invalidExecutableBase64 = 'data:image/jpeg;base64,IyEvYmluL2Jhc2gKZWNobyAiaGFja2VkIgo='

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri)
    }

    const salt = await bcrypt.genSalt(10)
    const testPasswordHash = await bcrypt.hash('TestPass123!', salt)

    // Cleanup previous runs
    await User.deleteMany({
      email: {
        $in: [
          'fin_admin_p4@touriva.dz',
          'fin_agency_a_p4@touriva.dz',
          'fin_agency_b_p4@touriva.dz',
          'fin_tourist_p4@touriva.dz',
          'fin_othertourist_p4@touriva.dz'
        ]
      }
    })

    adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'Touriva',
      email: 'fin_admin_p4@touriva.dz',
      password: testPasswordHash,
      role: 'administrator',
      phone: '0550000044',
      fileStatus: 'confirmed'
    })
    adminToken = jwt.sign({ _id: adminUser._id }, secret, { expiresIn: '1d' })

    agencyUserA = await User.create({
      firstName: 'Directeur',
      lastName: 'Atlas',
      companyName: 'Atlas Voyages Algérie',
      email: 'fin_agency_a_p4@touriva.dz',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      phone: '0550111144',
      fileStatus: 'confirmed'
    })
    agencyTokenA = jwt.sign({ _id: agencyUserA._id }, secret, { expiresIn: '1d' })

    agencyUserB = await User.create({
      firstName: 'Gérant',
      lastName: 'Hoggar',
      companyName: 'Hoggar Sahara Tours',
      email: 'fin_agency_b_p4@touriva.dz',
      password: testPasswordHash,
      role: 'partner',
      typeAccount: 'touristAgencies',
      phone: '0550222244',
      fileStatus: 'confirmed'
    })
    agencyTokenB = jwt.sign({ _id: agencyUserB._id }, secret, { expiresIn: '1d' })

    touristUser = await User.create({
      firstName: 'Amine',
      lastName: 'Client',
      email: 'fin_tourist_p4@touriva.dz',
      password: testPasswordHash,
      role: 'client',
      phone: '0550333344'
    })
    touristToken = jwt.sign({ _id: touristUser._id }, secret, { expiresIn: '1d' })

    otherTouristUser = await User.create({
      firstName: 'Karim',
      lastName: 'Voyageur',
      email: 'fin_othertourist_p4@touriva.dz',
      password: testPasswordHash,
      role: 'client',
      phone: '0550444444'
    })
    otherTouristToken = jwt.sign({ _id: otherTouristUser._id }, secret, { expiresIn: '1d' })

    // Create Packages & Departures for Agency A
    tripAgencyA = await Trip.create({
      name: 'Randonnée Gouraya & Cap Carbon',
      price: '15000',
      durationDays: 1,
      creator: agencyUserA._id,
      status: 'published',
      published: true,
      requiresDeposit: true,
      depositType: 'percentage',
      depositPercentage: 30,
      paymentDueDaysBeforeDeparture: 3
    })

    const futureDateA = new Date()
    futureDateA.setDate(futureDateA.getDate() + 15)

    departureAgencyA = await TripDeparture.create({
      trip: tripAgencyA._id,
      agency: agencyUserA._id,
      startDate: futureDateA,
      endDate: futureDateA,
      priceDZD: 15000,
      capacity: 10,
      bookedSeats: 2,
      status: 'scheduled',
      meetingPoint: 'Place Gueydon, Béjaïa'
    })

    bookingAgencyA = await TripBooking.create({
      trip: tripAgencyA._id,
      departure: departureAgencyA._id,
      agency: agencyUserA._id,
      customer: touristUser._id,
      customerInfo: {
        fullName: 'Amine Client',
        phone: '0550333344',
        email: 'fin_tourist_p4@touriva.dz'
      },
      seats: 2,
      unitPriceDZD: 15000,
      totalPriceDZD: 30000,
      currency: 'DZD',
      financialStatus: 'unpaid',
      totalPaidDZD: 0,
      totalRefundedDZD: 0,
      netPaidDZD: 0,
      balanceDueDZD: 30000,
      status: 'confirmed',
      requiresDeposit: true,
      depositAmountDZD: 9000
    })

    // Create Packages & Departures for Agency B
    tripAgencyB = await Trip.create({
      name: 'Circuit Tassili N\'Ajjer 7 Jours',
      price: '80000',
      durationDays: 7,
      creator: agencyUserB._id,
      status: 'published',
      published: true
    })

    departureAgencyB = await TripDeparture.create({
      trip: tripAgencyB._id,
      agency: agencyUserB._id,
      startDate: futureDateA,
      endDate: futureDateA,
      priceDZD: 80000,
      capacity: 8,
      bookedSeats: 1,
      status: 'scheduled',
      meetingPoint: 'Aéroport de Djanet'
    })

    bookingAgencyB = await TripBooking.create({
      trip: tripAgencyB._id,
      departure: departureAgencyB._id,
      agency: agencyUserB._id,
      customer: otherTouristUser._id,
      customerInfo: {
        fullName: 'Karim Voyageur',
        phone: '0550444444',
        email: 'fin_othertourist_p4@touriva.dz'
      },
      seats: 1,
      unitPriceDZD: 80000,
      totalPriceDZD: 80000,
      currency: 'DZD',
      financialStatus: 'unpaid',
      totalPaidDZD: 0,
      totalRefundedDZD: 0,
      netPaidDZD: 0,
      balanceDueDZD: 80000,
      status: 'confirmed'
    })
  })

  afterAll(async () => {
    // Clean up created records
    if (adminUser) await User.deleteMany({ _id: { $in: [adminUser._id, agencyUserA._id, agencyUserB._id, touristUser._id, otherTouristUser._id] } })
    if (tripAgencyA) await Trip.deleteMany({ _id: { $in: [tripAgencyA._id, tripAgencyB._id] } })
    if (departureAgencyA) await TripDeparture.deleteMany({ _id: { $in: [departureAgencyA._id, departureAgencyB._id] } })
    if (bookingAgencyA) {
      await TripPayment.deleteMany({ booking: { $in: [bookingAgencyA._id, bookingAgencyB._id] } })
      await TripRefund.deleteMany({ booking: { $in: [bookingAgencyA._id, bookingAgencyB._id] } })
      await TripBooking.deleteMany({ _id: { $in: [bookingAgencyA._id, bookingAgencyB._id] } })
    }
  })

  // =========================================================================
  // Section 1: Financial Arithmetic & Calculation Invariants
  // =========================================================================
  describe('Section 1: Financial Arithmetic & Calculation Invariants', () => {
    test('1.1: Integer Arithmetic Verification (whole DZD amounts, no decimal cents)', async () => {
      const res = await request(app)
        .post(`/api/agency/bookings/${bookingAgencyA._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          amountDZD: 10000,
          method: 'cash',
          transactionReference: 'RECU-001'
        })

      expect(res.status).toBe(201)
      expect(Number.isInteger(res.body.payment.amountDZD)).toBe(true)
      expect(res.body.payment.amountDZD).toBe(10000)
      expect(res.body.payment.currency).toBe('DZD')
      expect(res.body.bookingSummary.totalPaidDZD).toBe(10000)
      expect(res.body.bookingSummary.balanceDueDZD).toBe(20000)
      expect(res.body.bookingSummary.financialStatus).toBe('partially_paid')
    })

    test('1.2: Negative Payment Rejection (amountDZD <= 0)', async () => {
      const res = await request(app)
        .post(`/api/agency/bookings/${bookingAgencyA._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          amountDZD: -5000,
          method: 'cash'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/at least 1 DZD/i)
    })

    test('1.3: Zero Payment Rejection (amountDZD: 0)', async () => {
      const res = await request(app)
        .post(`/api/agency/bookings/${bookingAgencyA._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          amountDZD: 0,
          method: 'cash'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/at least 1 DZD/i)
    })

    test('1.4: Overpayment Prevention (payment > balanceDueDZD)', async () => {
      // Outstanding balance is currently 20000 DZD
      const res = await request(app)
        .post(`/api/agency/bookings/${bookingAgencyA._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          amountDZD: 25000,
          method: 'cash'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/exceeds outstanding balance/i)
    })

    test('1.5: Refund Exceeding Net Paid Rejection', async () => {
      // Currently netPaid is 10000 DZD. Cancelling booking to test refund bounds
      const testBooking = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 5000,
        totalPaidDZD: 10000,
        netPaidDZD: 10000,
        status: 'cancelled'
      })

      const res = await request(app)
        .post(`/api/bookings/${testBooking._id}/refunds/request`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 15000,
          reason: 'Demande supérieure au montant collecté',
          method: 'ccp'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/exceeds collected funds/i)

      await TripBooking.findByIdAndDelete(testBooking._id)
    })

    test('1.6: Deterministic Reconciliation Hook (recalculateBookingFinancials)', async () => {
      const reconciled = await recalculateBookingFinancials(bookingAgencyA._id)
      expect(reconciled.totalPaidDZD).toBe(10000)
      expect(reconciled.totalRefundedDZD).toBe(0)
      expect(reconciled.netPaidDZD).toBe(10000)
      expect(reconciled.balanceDueDZD).toBe(20000)
      expect(reconciled.financialStatus).toBe('partially_paid')
    })

    test('1.7: Deposit Configuration Validation Rules (percentage bounds 1-100%, fixed <= price)', () => {
      // Valid percentage
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'percentage', depositPercentage: 30 }).isValid).toBe(true)
      // Invalid percentage: 0% or negative
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'percentage', depositPercentage: 0 }).isValid).toBe(false)
      // Invalid percentage: > 100%
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'percentage', depositPercentage: 110 }).isValid).toBe(false)

      // Valid fixed deposit
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'fixed', depositAmountDZD: 5000, price: 20000 }).isValid).toBe(true)
      // Invalid fixed deposit: negative or zero
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'fixed', depositAmountDZD: -1000, price: 20000 }).isValid).toBe(false)
      // Invalid fixed deposit: exceeds excursion price
      expect(validateDepositConfig({ requiresDeposit: true, depositType: 'fixed', depositAmountDZD: 25000, price: 20000 }).isValid).toBe(false)
    })
  })

  // =========================================================================
  // Section 2: Multi-Tenant Authorization & IDOR Hardening
  // =========================================================================
  describe('Section 2: Multi-Tenant Authorization & IDOR Hardening', () => {
    let paymentAgencyA = null

    beforeAll(async () => {
      paymentAgencyA = await TripPayment.findOne({ booking: bookingAgencyA._id })
    })

    test('2.1: Agency A cannot view Agency B payments', async () => {
      const res = await request(app)
        .get('/api/agency/payments')
        .set('Authorization', `Bearer ${agencyTokenB}`)

      expect(res.status).toBe(200)
      const paymentIds = res.body.payments.map(p => p._id.toString())
      expect(paymentIds).not.toContain(paymentAgencyA._id.toString())
    })

    test('2.2: Agency B cannot verify Agency A payments (403 Forbidden)', async () => {
      // Create submitted proof on Agency A booking
      const submittedPayment = await TripPayment.create({
        booking: bookingAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 5000,
        currency: 'DZD',
        method: 'baridimob',
        status: 'submitted',
        recordedBy: touristUser._id
      })

      const res = await request(app)
        .patch(`/api/agency/payments/${submittedPayment._id}/verify`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({ note: 'Malicious verify attempt' })

      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/cannot modify another agency/i)

      // Clean up test payment
      await TripPayment.findByIdAndDelete(submittedPayment._id)
    })

    test('2.3: Agency B cannot reject Agency A payments (403 Forbidden)', async () => {
      const submittedPayment = await TripPayment.create({
        booking: bookingAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 5000,
        currency: 'DZD',
        method: 'baridimob',
        status: 'submitted',
        recordedBy: touristUser._id
      })

      const res = await request(app)
        .patch(`/api/agency/payments/${submittedPayment._id}/reject`)
        .set('Authorization', `Bearer ${agencyTokenB}`)
        .send({ rejectionReason: 'Raison arbitraire par agence tierce' })

      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/cannot modify another agency/i)

      await TripPayment.findByIdAndDelete(submittedPayment._id)
    })

    test('2.4: Customer cannot view another\'s payments (403 Forbidden)', async () => {
      // otherTouristUser attempts to view touristUser's booking financials
      const res = await request(app)
        .get(`/api/bookings/${bookingAgencyA._id}/financials`)
        .set('Authorization', `Bearer ${otherTouristToken}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/Access forbidden/i)
    })

    test('2.5: Customer cannot view internal agency notes (Data Sanitization)', async () => {
      // Update payment to have internal note
      await TripPayment.findByIdAndUpdate(paymentAgencyA._id, {
        agencyInternalNote: 'Note confidentielle interne agence: client VIP'
      })

      const res = await request(app)
        .get(`/api/bookings/${bookingAgencyA._id}/financials`)
        .set('Authorization', `Bearer ${touristToken}`)

      expect(res.status).toBe(200)
      const returnedPayment = res.body.payments.find(p => p._id.toString() === paymentAgencyA._id.toString())
      expect(returnedPayment).toBeDefined()
      expect(returnedPayment.agencyInternalNote).toBeUndefined()
    })

    test('2.6: Customer cannot verify own payment (403 Forbidden / Role Check)', async () => {
      const res = await request(app)
        .patch(`/api/agency/payments/${paymentAgencyA._id}/verify`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({ note: 'Tentative de validation pirate' })

      expect(res.status).toBe(403)
    })

    test('2.7: Unauthenticated caller rejected (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/agency/payments')

      expect(res.status).toBe(401)
    })

    test('2.8: Administrator global financial dashboard access', async () => {
      const res = await request(app)
        .get(`/api/agency/financials/dashboard?agency=${agencyUserA._id}`)
        .set('Authorization', `Bearer ${adminToken}`)

      expect(res.status).toBe(200)
      expect(res.body.summary).toBeDefined()
      expect(res.body.summary.totalCollectedDZD).toBeGreaterThanOrEqual(10000)
    })
  })

  // =========================================================================
  // Section 3: Concurrency, Idempotency & Race Condition Prevention
  // =========================================================================
  describe('Section 3: Concurrency, Idempotency & Race Condition Prevention', () => {
    test('3.1: Same-Caller Idempotency Retry returns existing payment (200 OK)', async () => {
      const uniqueKey = 'fin-idem-key-' + Date.now()

      const res1 = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          transactionReference: 'BARIDI-01',
          proofData: validJpegBase64,
          idempotencyKey: uniqueKey
        })

      expect(res1.status).toBe(201)
      const payRef1 = res1.body.payment.paymentReference

      // Retry with identical key and payload
      const res2 = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          transactionReference: 'BARIDI-01',
          proofData: validJpegBase64,
          idempotencyKey: uniqueKey
        })

      expect(res2.status).toBe(200)
      expect(res2.body.message).toMatch(/idempotent record/i)
      expect(res2.body.payment.paymentReference).toBe(payRef1)

      // Cleanup
      await TripPayment.findByIdAndDelete(res1.body.payment._id)
    })

    test('3.2: Cross-Caller Idempotency Reuse rejected with 409 Conflict', async () => {
      const sharedKey = 'cross-key-' + Date.now()

      // Tourist 1 submits
      const res1 = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: validJpegBase64,
          idempotencyKey: sharedKey
        })

      expect(res1.status).toBe(201)

      // Other Tourist attempts to use Tourist 1's key
      const res2 = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: validJpegBase64,
          idempotencyKey: sharedKey
        })

      expect(res2.status).toBe(409)
      expect(res2.body.error).toMatch(/already in use by another customer/i)

      await TripPayment.findByIdAndDelete(res1.body.payment._id)
    })

    test('3.3: Changed-Payload Idempotency Reuse rejected with 409 Conflict', async () => {
      const payloadKey = 'payload-key-' + Date.now()

      const res1 = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: validJpegBase64,
          idempotencyKey: payloadKey
        })

      expect(res1.status).toBe(201)

      // Same tourist attempts altered amount with same key
      const res2 = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 8000,
          method: 'baridimob',
          proofData: validJpegBase64,
          idempotencyKey: payloadKey
        })

      expect(res2.status).toBe(409)
      expect(res2.body.error).toMatch(/Request parameters do not match/i)

      await TripPayment.findByIdAndDelete(res1.body.payment._id)
    })

    test('3.4: Concurrent Duplicate Payments allocate exactly 1 record', async () => {
      const concurrentKey = 'concurrent-key-' + Date.now()

      const [r1, r2] = await Promise.all([
        request(app)
          .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            amountDZD: 4000,
            method: 'baridimob',
            proofData: validJpegBase64,
            idempotencyKey: concurrentKey
          }),
        request(app)
          .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
          .set('Authorization', `Bearer ${touristToken}`)
          .send({
            amountDZD: 4000,
            method: 'baridimob',
            proofData: validJpegBase64,
            idempotencyKey: concurrentKey
          })
      ])

      expect([200, 201]).toContain(r1.status)
      expect([200, 201]).toContain(r2.status)

      const ref1 = r1.body.payment?.paymentReference
      const ref2 = r2.body.payment?.paymentReference
      expect(ref1).toBe(ref2)

      const count = await TripPayment.countDocuments({ idempotencyKey: concurrentKey })
      expect(count).toBe(1)

      await TripPayment.deleteMany({ idempotencyKey: concurrentKey })
    })

    test('3.5: Concurrent Overpayment Race (balance due 10,000 DZD; two 10,000 DZD parallel payments)', async () => {
      // Create dedicated test booking with balance 10,000 DZD
      const raceBooking = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 10000,
        totalPriceDZD: 10000,
        balanceDueDZD: 10000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'confirmed'
      })

      // Send 2 parallel direct payment requests of 10,000 DZD each
      const [p1, p2] = await Promise.all([
        request(app)
          .post(`/api/agency/bookings/${raceBooking._id}/payments`)
          .set('Authorization', `Bearer ${agencyTokenA}`)
          .send({
            amountDZD: 10000,
            method: 'cash',
            transactionReference: 'RACE-1'
          }),
        request(app)
          .post(`/api/agency/bookings/${raceBooking._id}/payments`)
          .set('Authorization', `Bearer ${agencyTokenA}`)
          .send({
            amountDZD: 10000,
            method: 'cash',
            transactionReference: 'RACE-2'
          })
      ])

      const statuses = [p1.status, p2.status].sort()
      // Exactly 1 must succeed (201) and exactly 1 must fail with 400
      expect(statuses).toEqual([201, 400])

      const updated = await TripBooking.findById(raceBooking._id)
      expect(updated.totalPaidDZD).toBe(10000)
      expect(updated.balanceDueDZD).toBe(0)
      expect(updated.financialStatus).toBe('paid')

      // Cleanup
      await TripPayment.deleteMany({ booking: raceBooking._id })
      await TripBooking.findByIdAndDelete(raceBooking._id)
    })
  })

  // =========================================================================
  // Section 4: Financial Integrity, Proof Verification & Refunds
  // =========================================================================
  describe('Section 4: Financial Integrity, Proof Verification & Refunds', () => {
    let multiBooking = null

    beforeAll(async () => {
      multiBooking = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 2,
        unitPriceDZD: 30000,
        totalPriceDZD: 60000,
        balanceDueDZD: 60000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'confirmed'
      })
    })

    afterAll(async () => {
      if (multiBooking) {
        await TripPayment.deleteMany({ booking: multiBooking._id })
        await TripRefund.deleteMany({ booking: multiBooking._id })
        await TripBooking.findByIdAndDelete(multiBooking._id)
      }
    })

    test('4.1: Multiple Partial Installments (60k total: 20k -> 20k -> 20k transitions)', async () => {
      // Installment 1: 20k
      const p1 = await request(app)
        .post(`/api/agency/bookings/${multiBooking._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ amountDZD: 20000, method: 'cash' })

      expect(p1.status).toBe(201)
      expect(p1.body.bookingSummary.financialStatus).toBe('partially_paid')
      expect(p1.body.bookingSummary.balanceDueDZD).toBe(40000)

      // Installment 2: 20k
      const p2 = await request(app)
        .post(`/api/agency/bookings/${multiBooking._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ amountDZD: 20000, method: 'baridimob' })

      expect(p2.status).toBe(201)
      expect(p2.body.bookingSummary.financialStatus).toBe('partially_paid')
      expect(p2.body.bookingSummary.balanceDueDZD).toBe(20000)

      // Installment 3: 20k
      const p3 = await request(app)
        .post(`/api/agency/bookings/${multiBooking._id}/payments`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ amountDZD: 20000, method: 'bank_transfer' })

      expect(p3.status).toBe(201)
      expect(p3.body.bookingSummary.financialStatus).toBe('paid')
      expect(p3.body.bookingSummary.balanceDueDZD).toBe(0)
    })

    test('4.2: Proof Submission does NOT credit balance until verified', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 15000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'confirmed'
      })

      const submitRes = await request(app)
        .post(`/api/bookings/${testBkg._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 15000,
          method: 'baridimob',
          transactionReference: 'BARIDI-UNVERIFIED',
          proofData: validJpegBase64
        })

      expect(submitRes.status).toBe(201)
      expect(submitRes.body.payment.status).toBe('submitted')

      // Check that balance due remains 15000 and status remains unpaid
      const bkgAfterSubmit = await TripBooking.findById(testBkg._id)
      expect(bkgAfterSubmit.totalPaidDZD).toBe(0)
      expect(bkgAfterSubmit.balanceDueDZD).toBe(15000)
      expect(bkgAfterSubmit.financialStatus).toBe('unpaid')

      // 4.3: Proof Verification Credits Balance
      const verifyRes = await request(app)
        .patch(`/api/agency/payments/${submitRes.body.payment._id}/verify`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ agencyInternalNote: 'Vérifié conforme' })

      expect(verifyRes.status).toBe(200)
      expect(verifyRes.body.payment.status).toBe('verified')
      expect(verifyRes.body.booking.totalPaidDZD).toBe(15000)
      expect(verifyRes.body.booking.balanceDueDZD).toBe(0)
      expect(verifyRes.body.booking.financialStatus).toBe('paid')

      // Cleanup
      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.4: Proof Rejection leaves balance unchanged', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 15000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'confirmed'
      })

      const submitRes = await request(app)
        .post(`/api/bookings/${testBkg._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 15000,
          method: 'baridimob',
          proofData: validJpegBase64
        })

      const rejectRes = await request(app)
        .patch(`/api/agency/payments/${submitRes.body.payment._id}/reject`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ rejectionReason: 'Récépissé illisible et numéro de virement tronqué' })

      expect(rejectRes.status).toBe(200)
      expect(rejectRes.body.payment.status).toBe('rejected')

      const bkgAfterReject = await TripBooking.findById(testBkg._id)
      expect(bkgAfterReject.totalPaidDZD).toBe(0)
      expect(bkgAfterReject.balanceDueDZD).toBe(15000)
      expect(bkgAfterReject.financialStatus).toBe('unpaid')

      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.5: Cancellation with Unpaid Status sets status cancelled_unpaid', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 15000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'pending'
      })

      const cancelRes = await request(app)
        .post(`/api/bookings/${testBkg._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({ cancellationReason: 'Annulation simple avant paiement' })

      expect(cancelRes.status).toBe(200)
      expect(cancelRes.body.booking.status).toBe('cancelled')
      expect(cancelRes.body.booking.financialStatus).toBe('cancelled_unpaid')

      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.6: Cancellation with Partial Payment sets financial status refund_pending', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 2,
        unitPriceDZD: 15000,
        totalPriceDZD: 30000,
        balanceDueDZD: 10000,
        totalPaidDZD: 20000,
        netPaidDZD: 20000,
        financialStatus: 'partially_paid',
        status: 'confirmed'
      })

      await TripPayment.create({
        booking: testBkg._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 20000,
        currency: 'DZD',
        method: 'cash',
        status: 'verified',
        recordedBy: agencyUserA._id
      })

      const cancelRes = await request(app)
        .post(`/api/bookings/${testBkg._id}/cancel`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({ cancellationReason: 'Imprévu familial' })

      expect(cancelRes.status).toBe(200)
      expect(cancelRes.body.booking.status).toBe('cancelled')
      expect(cancelRes.body.booking.financialStatus).toBe('refund_pending')

      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.7: Full Refund Disbursement marks booking refunded', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 2,
        unitPriceDZD: 10000,
        totalPriceDZD: 20000,
        balanceDueDZD: 0,
        totalPaidDZD: 20000,
        netPaidDZD: 20000,
        financialStatus: 'refund_pending',
        status: 'cancelled'
      })

      await TripPayment.create({
        booking: testBkg._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 20000,
        currency: 'DZD',
        method: 'cash',
        status: 'verified',
        recordedBy: agencyUserA._id
      })

      const refundReq = await request(app)
        .post(`/api/bookings/${testBkg._id}/refunds/request`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 20000,
          reason: 'Annulation avec remboursement demandé',
          method: 'ccp'
        })

      expect(refundReq.status).toBe(201)
      const refundId = refundReq.body.refund._id

      const refundComplete = await request(app)
        .patch(`/api/agency/refunds/${refundId}/complete`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          transactionReference: 'VIR-CCP-888999',
          internalNote: 'Virement CCP effectué'
        })

      expect(refundComplete.status).toBe(200)
      expect(refundComplete.body.booking.financialStatus).toBe('refunded')
      expect(refundComplete.body.booking.totalRefundedDZD).toBe(20000)
      expect(refundComplete.body.booking.netPaidDZD).toBe(0)

      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripRefund.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.9: Repeated refund attempt rejected (400 Bad Request)', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 10000,
        totalPriceDZD: 10000,
        balanceDueDZD: 0,
        totalPaidDZD: 10000,
        totalRefundedDZD: 10000,
        netPaidDZD: 0,
        financialStatus: 'refunded',
        status: 'cancelled'
      })

      const repeatedRefund = await request(app)
        .post(`/api/bookings/${testBkg._id}/refunds/request`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          reason: 'Seconde tentative',
          method: 'ccp'
        })

      expect(repeatedRefund.status).toBe(400)
      expect(repeatedRefund.body.error).toMatch(/No refundable balance remaining/i)

      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.8: Partial Refund with Cancellation Fee', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 20000,
        totalPriceDZD: 20000,
        balanceDueDZD: 0,
        totalPaidDZD: 20000,
        netPaidDZD: 20000,
        financialStatus: 'paid',
        status: 'cancelled'
      })

      await TripPayment.create({
        booking: testBkg._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 20000,
        currency: 'DZD',
        method: 'cash',
        status: 'verified',
        recordedBy: agencyUserA._id
      })

      const refundReq = await request(app)
        .post(`/api/bookings/${testBkg._id}/refunds/request`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 18000,
          reason: 'Remboursement après retenue des frais d\'annulation de 10%',
          method: 'cash'
        })

      expect(refundReq.status).toBe(201)

      const completeRes = await request(app)
        .patch(`/api/agency/refunds/${refundReq.body.refund._id}/complete`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({
          cancellationFeeDZD: 2000,
          internalNote: 'Remboursé 18 000 DZD en espèces. Frais de 2 000 DZD retenus.'
        })

      expect(completeRes.status).toBe(200)
      expect(completeRes.body.booking.financialStatus).toBe('partially_refunded')
      expect(completeRes.body.booking.netPaidDZD).toBe(2000)

      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripRefund.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.10: Refund Approval Workflow (requested -> approved via PATCH /api/agency/refunds/:id/approve)', async () => {
      const testBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 0,
        totalPaidDZD: 15000,
        netPaidDZD: 15000,
        financialStatus: 'paid',
        status: 'cancelled'
      })

      await TripPayment.create({
        booking: testBkg._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 15000,
        currency: 'DZD',
        method: 'cash',
        status: 'verified',
        recordedBy: agencyUserA._id
      })

      const refundReq = await request(app)
        .post(`/api/bookings/${testBkg._id}/refunds/request`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 15000,
          reason: 'Annulation avec demande d approbation',
          method: 'baridimob'
        })

      expect(refundReq.status).toBe(201)
      expect(refundReq.body.refund.status).toBe('requested')
      const refundId = refundReq.body.refund._id

      // Agency A approves the refund
      const approveRes = await request(app)
        .patch(`/api/agency/refunds/${refundId}/approve`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ internalNote: 'Approuvé par le service comptabilité Atlas' })

      expect(approveRes.status).toBe(200)
      expect(approveRes.body.refund.status).toBe('approved')
      expect(approveRes.body.refund.approvedBy).toBe(agencyUserA._id.toString())
      expect(approveRes.body.booking.financialStatus).toBe('refund_pending')

      await TripPayment.deleteMany({ booking: testBkg._id })
      await TripRefund.deleteMany({ booking: testBkg._id })
      await TripBooking.findByIdAndDelete(testBkg._id)
    })

    test('4.11: Agency Financial Dashboard exposes overdueBookingsCount', async () => {
      // Create an overdue booking for Agency A: past paymentDueDate, unpaid
      const pastDueDate = new Date()
      pastDueDate.setDate(pastDueDate.getDate() - 5)

      const overdueBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Overdue Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 12000,
        totalPriceDZD: 12000,
        balanceDueDZD: 12000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        paymentDueDate: pastDueDate,
        financialStatus: 'unpaid',
        status: 'confirmed'
      })

      const dashRes = await request(app)
        .get('/api/agency/financials/dashboard')
        .set('Authorization', `Bearer ${agencyTokenA}`)

      expect(dashRes.status).toBe(200)
      expect(dashRes.body.overdueBookingsCount).toBeGreaterThanOrEqual(1)
      expect(Array.isArray(dashRes.body.overdueBookings)).toBe(true)
      const found = dashRes.body.overdueBookings.find(b => b._id.toString() === overdueBkg._id.toString())
      expect(found).toBeDefined()

      await TripBooking.findByIdAndDelete(overdueBkg._id)
    })

    test('4.12: Agency cancellation immediately recalculates financial status to cancelled_unpaid and restores seats', async () => {
      const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      const agencyCancelBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Cancel Client', phone: '0550333344' },
        seats: 2,
        unitPriceDZD: 15000,
        totalPriceDZD: 30000,
        balanceDueDZD: 30000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        financialStatus: 'unpaid',
        status: 'confirmed'
      })
      await TripDeparture.findByIdAndUpdate(departureAgencyA._id, { $inc: { bookedSeats: 2 } })

      const res = await request(app)
        .patch(`/api/agency/bookings/${agencyCancelBkg._id}/cancel`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ cancellationReason: 'Annulation opérationnelle météo défavorable' })

      expect(res.status).toBe(200)
      expect(res.body.booking.status).toBe('cancelled')
      expect(res.body.booking.financialStatus).toBe('cancelled_unpaid')

      // Verify DB persistence immediately
      const inDb = await TripBooking.findById(agencyCancelBkg._id)
      expect(inDb.status).toBe('cancelled')
      expect(inDb.financialStatus).toBe('cancelled_unpaid')

      // Verify seats released
      const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore)

      await TripBooking.findByIdAndDelete(agencyCancelBkg._id)
    })

    test('4.13: Agency cancellation on partially paid booking immediately transitions to refund_pending', async () => {
      const agencyCancelPartPaid = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Partial Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 20000,
        totalPriceDZD: 20000,
        balanceDueDZD: 10000,
        totalPaidDZD: 10000,
        netPaidDZD: 10000,
        financialStatus: 'partially_paid',
        status: 'confirmed'
      })

      await TripPayment.create({
        booking: agencyCancelPartPaid._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        amountDZD: 10000,
        currency: 'DZD',
        method: 'cash',
        status: 'verified',
        recordedBy: agencyUserA._id
      })

      const res = await request(app)
        .patch(`/api/agency/bookings/${agencyCancelPartPaid._id}/cancel`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ cancellationReason: 'Annulation agence pour raisons techniques' })

      expect(res.status).toBe(200)
      expect(res.body.booking.status).toBe('cancelled')
      expect(res.body.booking.financialStatus).toBe('refund_pending')

      const inDb = await TripBooking.findById(agencyCancelPartPaid._id)
      expect(inDb.status).toBe('cancelled')
      expect(inDb.financialStatus).toBe('refund_pending')

      await TripPayment.deleteMany({ booking: agencyCancelPartPaid._id })
      await TripBooking.findByIdAndDelete(agencyCancelPartPaid._id)
    })

    test('4.14: Agency rejection immediately recalculates financial status to cancelled_unpaid and restores seats', async () => {
      const seatsBefore = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      const pendingBkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Reject Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 15000,
        totalPriceDZD: 15000,
        balanceDueDZD: 15000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        financialStatus: 'unpaid',
        status: 'pending'
      })
      await TripDeparture.findByIdAndUpdate(departureAgencyA._id, { $inc: { bookedSeats: 1 } })

      const res = await request(app)
        .patch(`/api/agency/bookings/${pendingBkg._id}/reject`)
        .set('Authorization', `Bearer ${agencyTokenA}`)
        .send({ rejectionReason: 'Complet sur cette tranche horaire' })

      expect(res.status).toBe(200)
      expect(res.body.booking.status).toBe('rejected')
      expect(res.body.booking.financialStatus).toBe('cancelled_unpaid')

      const seatsAfter = (await TripDeparture.findById(departureAgencyA._id)).bookedSeats
      expect(seatsAfter).toBe(seatsBefore)

      await TripBooking.findByIdAndDelete(pendingBkg._id)
    })
  })

  // =========================================================================
  // Section 5: Proof Document Upload & Streaming Security
  // =========================================================================
  describe('Section 5: Proof Document Upload & Streaming Security', () => {
    let uploadedPaymentId = null

    test('5.1: Valid JPEG Upload stores file and returns 201 Created', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 10000,
          method: 'baridimob',
          transactionReference: 'JPEG-PROOF',
          proofData: validJpegBase64,
          originalName: 'ticket_virement.jpg'
        })

      expect(res.status).toBe(201)
      expect(res.body.payment.proofDocument).toBeDefined()
      expect(res.body.payment.proofDocument.mimeType).toBe('image/jpeg')
      expect(res.body.payment.proofDocument.filename).toMatch(/^proof_/)

      uploadedPaymentId = res.body.payment._id
    })

    test('5.2: Valid PDF Upload validates MIME application/pdf', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 10000,
          method: 'bank_transfer',
          transactionReference: 'PDF-PROOF',
          proofData: validPdfBase64,
          originalName: 'avis_de_debit.pdf'
        })

      expect(res.status).toBe(201)
      expect(res.body.payment.proofDocument.mimeType).toBe('application/pdf')

      await TripPayment.findByIdAndDelete(res.body.payment._id)
    })

    test('5.3: Oversized File Rejection (> 5MB limit yields 413)', async () => {
      // 5.5MB mock buffer encoded in base64
      const largeBuffer = Buffer.alloc(5.5 * 1024 * 1024, 0xFF)
      // Inject JPEG header at start
      largeBuffer[0] = 0xFF
      largeBuffer[1] = 0xD8
      largeBuffer[2] = 0xFF
      const largeBase64 = 'data:image/jpeg;base64,' + largeBuffer.toString('base64')

      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: largeBase64
        })

      expect(res.status).toBe(413)
      expect(res.body.error).toMatch(/exceeds maximum allowed size/i)
    })

    test('5.4: Disguised Executable Rejection (Magic Number Mismatch yields 415)', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: invalidExecutableBase64,
          originalName: 'script.sh'
        })

      expect(res.status).toBe(415)
      expect(res.body.error).toMatch(/Unsupported file format/i)
    })

    test('5.5: Path Traversal Rejection (filename strictly sanitized)', async () => {
      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyB._id}/payments/submit`)
        .set('Authorization', `Bearer ${otherTouristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          proofData: validJpegBase64,
          originalName: '../../../../etc/passwd'
        })

      expect(res.status).toBe(201)
      expect(res.body.payment.proofDocument.originalName).not.toContain('../')
      expect(res.body.payment.proofDocument.originalName).not.toContain('/')

      await TripPayment.findByIdAndDelete(res.body.payment._id)
    })

    test('5.6: Proof Streaming Authorization (Agency A cannot stream Agency B proof -> 403 Forbidden)', async () => {
      // Agency A attempts to stream Agency B proof
      const res = await request(app)
        .get(`/api/bookings/${bookingAgencyB._id}/payments/${uploadedPaymentId}/proof`)
        .set('Authorization', `Bearer ${agencyTokenA}`)

      expect(res.status).toBe(403)
      expect(res.body.error).toMatch(/Access forbidden/i)

      // Authorized stream for Agency B succeeds
      const validStream = await request(app)
        .get(`/api/bookings/${bookingAgencyB._id}/payments/${uploadedPaymentId}/proof`)
        .set('Authorization', `Bearer ${agencyTokenB}`)

      expect(validStream.status).toBe(200)
      expect(validStream.headers['content-type']).toBe('image/jpeg')
      expect(validStream.headers['cache-control']).toMatch(/private/i)

      // Clean up uploaded test payment
      await TripPayment.findByIdAndDelete(uploadedPaymentId)
    })

    test('5.7: Direct Agency Proof Streaming (/api/agency/payments/:id/proof)', async () => {
      const bkg = await TripBooking.create({
        trip: tripAgencyA._id,
        departure: departureAgencyA._id,
        agency: agencyUserA._id,
        customer: touristUser._id,
        customerInfo: { fullName: 'Amine Client', phone: '0550333344' },
        seats: 1,
        unitPriceDZD: 10000,
        totalPriceDZD: 10000,
        balanceDueDZD: 10000,
        totalPaidDZD: 0,
        netPaidDZD: 0,
        status: 'confirmed'
      })

      const submitRes = await request(app)
        .post(`/api/bookings/${bkg._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 10000,
          method: 'baridimob',
          transactionReference: 'BARIDI-STREAM-TEST',
          proofData: validJpegBase64,
          originalName: 'justificatif_baridi.jpg'
        })

      expect(submitRes.status).toBe(201)
      const paymentId = submitRes.body.payment._id

      // Agency A (the owner) can stream proof directly via /api/agency/payments/:id/proof
      const streamRes = await request(app)
        .get(`/api/agency/payments/${paymentId}/proof`)
        .set('Authorization', `Bearer ${agencyTokenA}`)

      expect(streamRes.status).toBe(200)
      expect(streamRes.headers['content-type']).toBe('image/jpeg')
      expect(streamRes.headers['cache-control']).toMatch(/private/i)

      // Agency B (cross-tenant) is rejected with 403 Forbidden
      const unauthorizedRes = await request(app)
        .get(`/api/agency/payments/${paymentId}/proof`)
        .set('Authorization', `Bearer ${agencyTokenB}`)

      expect(unauthorizedRes.status).toBe(403)
      expect(unauthorizedRes.body.error).toMatch(/Access forbidden/i)

      await TripPayment.findByIdAndDelete(paymentId)
      await TripBooking.findByIdAndDelete(bkg._id)
    })

    test('5.8: SVG Payload Rejection (SVG XML payload yields 415 Unsupported Media Type)', async () => {
      // Disguised SVG XML file encoded in Base64
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" /><script>alert("xss")</script></svg>'
      const svgBase64 = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64')

      const res = await request(app)
        .post(`/api/bookings/${bookingAgencyA._id}/payments/submit`)
        .set('Authorization', `Bearer ${touristToken}`)
        .send({
          amountDZD: 5000,
          method: 'baridimob',
          transactionReference: 'MALICIOUS-SVG',
          proofData: svgBase64,
          originalName: 'receipt.svg'
        })

      expect(res.status).toBe(415)
      expect(res.body.error).toMatch(/Unsupported file format/i)
    })
  })
})
