const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const TripPayment = require('../models/TripPayment')
const TripRefund = require('../models/TripRefund')
const TripBooking = require('../models/TripBooking')
const TripDeparture = require('../models/TripDeparture')
const { recalculateBookingFinancials } = require('../utils/financialCalculator')
const { saveProofDocument, getProofFilePath } = require('../utils/proofStorage')

// Active in-flight locks across requests to prevent race conditions on standalone MongoDB
const inFlightIdempotencyKeys = new Set()
const inFlightBookingLocks = new Set()

/**
 * Acquires an in-flight booking lock to serialize concurrent payments for the same booking
 * @param {string} bookingId 
 */
const acquireBookingLock = async (bookingId) => {
  let count = 0
  while (inFlightBookingLocks.has(bookingId) && count < 30) {
    await new Promise(r => setTimeout(r, 50))
    count++
  }
  inFlightBookingLocks.add(bookingId)
}

/**
 * Releases an in-flight booking lock
 * @param {string} bookingId 
 */
const releaseBookingLock = (bookingId) => {
  inFlightBookingLocks.delete(bookingId)
}

/**
 * POST /api/bookings/:id/payments/submit
 * Tourist submits an offline payment claim with proof document (CCP, BaridiMob, wire).
 * Does NOT credit balance until verified by agency.
 */
const submitCustomerPaymentProof = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  const rawKey = req.headers['idempotency-key'] || req.body.idempotencyKey
  const cleanKey = rawKey ? String(rawKey).trim() : null

  let bookingLockAcquired = false

  try {
    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // 1. Authorization: Tourist owner or matching guest phone or admin
    const isOwner = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()
    const isAdmin = req.user && ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)
    const isGuestMatch = !req.user && req.body.phone && booking.customerInfo?.phone &&
      booking.customerInfo.phone.replace(/[^\d]/g, '') === String(req.body.phone).replace(/[^\d]/g, '')

    if (!isOwner && !isAdmin && !isGuestMatch) {
      return res.status(403).json({ error: 'Access forbidden: You cannot submit payments for another customer\'s booking' })
    }

    // 2. Operational state check
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot submit payment for a booking with status "${booking.status}"` })
    }

    // 3. Idempotency Check with Scoped Identity & Payload Matching
    if (cleanKey) {
      if (inFlightIdempotencyKeys.has(cleanKey)) {
        let waitCount = 0
        while (inFlightIdempotencyKeys.has(cleanKey) && waitCount < 20) {
          await new Promise(r => setTimeout(r, 50))
          waitCount++
        }
      } else {
        inFlightIdempotencyKeys.add(cleanKey)
      }

      const existing = await TripPayment.findOne({ idempotencyKey: cleanKey })
      if (existing) {
        let isSameCaller = false
        if (existing.customer && req.user) {
          isSameCaller = existing.customer.toString() === req.user._id.toString()
        } else if (!existing.customer) {
          isSameCaller = isGuestMatch
        }

        if (!isSameCaller) {
          return res.status(409).json({
            error: 'Idempotency key conflict: This key is already in use by another customer or booking'
          })
        }

        const sameBooking = existing.booking.toString() === booking._id.toString()
        const sameAmount = existing.amountDZD === Number(req.body.amountDZD)

        if (!sameBooking || !sameAmount) {
          return res.status(409).json({
            error: 'Idempotency key conflict: Request parameters do not match original request for this key'
          })
        }

        return res.status(200).json({
          success: true,
          message: 'Payment retrieved from idempotent record',
          payment: existing
        })
      }
    }

    // 4. Input validation
    const amountDZD = Number(req.body.amountDZD)
    if (isNaN(amountDZD) || amountDZD <= 0) {
      return res.status(400).json({ error: 'Payment amount must be at least 1 DZD' })
    }
    if (!Number.isInteger(amountDZD)) {
      return res.status(400).json({ error: 'Payment amount must be a whole integer in DZD' })
    }

    const validMethods = ['ccp', 'baridimob', 'bank_transfer', 'cash', 'other']
    const method = req.body.method
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({ error: 'Valid payment method is required (ccp, baridimob, bank_transfer, cash, other)' })
    }

    // Acquire booking lock for balance check & insertion serialization
    await acquireBookingLock(booking._id.toString())
    bookingLockAcquired = true

    // Refresh booking balance
    const freshBooking = await TripBooking.findById(booking._id)
    if (amountDZD > freshBooking.balanceDueDZD) {
      return res.status(400).json({
        error: `Payment amount (${amountDZD} DZD) exceeds outstanding balance (${freshBooking.balanceDueDZD} DZD)`
      })
    }

    // 5. Proof document handling
    const proofData = req.body.proofData || req.body.proofFile || (req.file ? req.file.buffer.toString('base64') : null)
    if (!proofData) {
      return res.status(400).json({ error: 'Proof document is required for payment verification' })
    }

    let proofMeta = {}
    try {
      proofMeta = await saveProofDocument({
        paymentId: new mongoose.Types.ObjectId().toString(),
        base64Data: proofData,
        originalName: req.body.originalName || req.body.filename || 'payment_proof.jpg'
      })
    } catch (fileErr) {
      return res.status(fileErr.statusCode || 400).json({ error: fileErr.message })
    }

    // 6. Create TripPayment record in 'submitted' status
    const payment = await TripPayment.create({
      booking: freshBooking._id,
      departure: freshBooking.departure,
      agency: freshBooking.agency,
      customer: req.user ? req.user._id : freshBooking.customer,
      amountDZD,
      currency: 'DZD',
      method,
      status: 'submitted',
      transactionReference: req.body.transactionReference ? String(req.body.transactionReference).trim() : '',
      proofDocument: proofMeta,
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
      recordedBy: req.user ? req.user._id : freshBooking.agency,
      customerNote: req.body.customerNote ? String(req.body.customerNote).trim() : '',
      statusHistory: [
        {
          status: 'submitted',
          changedBy: req.user ? req.user._id : freshBooking.agency,
          note: req.body.customerNote || 'Payment proof submitted by traveler',
          timestamp: new Date()
        }
      ],
      ...(cleanKey ? { idempotencyKey: cleanKey } : {})
    })

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. Awaiting agency review.',
      payment
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit payment proof', details: error.message })
  } finally {
    if (bookingLockAcquired) {
      releaseBookingLock(id)
    }
    if (cleanKey) {
      inFlightIdempotencyKeys.delete(cleanKey)
    }
  }
}

/**
 * POST /api/agency/bookings/:id/payments
 * Agency records verified payment (cash at counter, bank receipt verified).
 * Immediately credits booking balance.
 */
const recordAgencyPayment = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  const rawKey = req.headers['idempotency-key'] || req.body.idempotencyKey
  const cleanKey = rawKey ? String(rawKey).trim() : null

  let bookingLockAcquired = false

  try {
    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // 1. Authorization: Agency must own booking, or administrator
    const isAgencyOwner = req.user.role === 'partner' && booking.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s bookings' })
    }

    // 2. Operational state check
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot record payment for a booking with status "${booking.status}"` })
    }

    // 3. Idempotency check
    if (cleanKey) {
      if (inFlightIdempotencyKeys.has(cleanKey)) {
        let waitCount = 0
        while (inFlightIdempotencyKeys.has(cleanKey) && waitCount < 20) {
          await new Promise(r => setTimeout(r, 50))
          waitCount++
        }
      } else {
        inFlightIdempotencyKeys.add(cleanKey)
      }

      const existing = await TripPayment.findOne({ idempotencyKey: cleanKey })
      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Payment retrieved from idempotent record',
          payment: existing,
          bookingSummary: {
            bookingReference: booking.bookingReference,
            totalPriceDZD: booking.totalPriceDZD,
            totalPaidDZD: booking.totalPaidDZD,
            balanceDueDZD: booking.balanceDueDZD,
            financialStatus: booking.financialStatus
          }
        })
      }
    }

    // 4. Input validation
    const amountDZD = Number(req.body.amountDZD)
    if (isNaN(amountDZD) || amountDZD <= 0) {
      return res.status(400).json({ error: 'Payment amount must be at least 1 DZD' })
    }
    if (!Number.isInteger(amountDZD)) {
      return res.status(400).json({ error: 'Payment amount must be a whole integer in DZD' })
    }

    const validMethods = ['cash', 'ccp', 'baridimob', 'bank_transfer', 'gateway_cib', 'other']
    const method = req.body.method
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({ error: 'Valid payment method is required (cash, ccp, baridimob, bank_transfer, gateway_cib, other)' })
    }

    // Acquire booking lock
    await acquireBookingLock(booking._id.toString())
    bookingLockAcquired = true

    // Refresh booking to ensure up-to-date balance
    const freshBooking = await TripBooking.findById(booking._id)
    if (amountDZD > freshBooking.balanceDueDZD) {
      return res.status(400).json({
        error: `Payment amount (${amountDZD} DZD) exceeds outstanding balance (${freshBooking.balanceDueDZD} DZD)`
      })
    }

    // 5. Optional proof handling
    let proofMeta = {}
    const proofData = req.body.proofData || req.body.proofFile || (req.file ? req.file.buffer.toString('base64') : null)
    if (proofData) {
      try {
        proofMeta = await saveProofDocument({
          paymentId: new mongoose.Types.ObjectId().toString(),
          base64Data: proofData,
          originalName: req.body.originalName || req.body.filename || 'receipt.jpg'
        })
      } catch (fileErr) {
        return res.status(fileErr.statusCode || 400).json({ error: fileErr.message })
      }
    }

    // 6. Create verified payment
    const payment = await TripPayment.create({
      booking: freshBooking._id,
      departure: freshBooking.departure,
      agency: freshBooking.agency,
      customer: freshBooking.customer,
      amountDZD,
      currency: 'DZD',
      method,
      status: 'verified',
      transactionReference: req.body.transactionReference ? String(req.body.transactionReference).trim() : '',
      proofDocument: proofMeta,
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
      recordedBy: req.user._id,
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      customerNote: req.body.customerNote ? String(req.body.customerNote).trim() : '',
      agencyInternalNote: req.body.agencyInternalNote ? String(req.body.agencyInternalNote).trim() : '',
      statusHistory: [
        {
          status: 'verified',
          changedBy: req.user._id,
          note: req.body.agencyInternalNote || 'Payment recorded and verified by agency',
          timestamp: new Date()
        }
      ],
      ...(cleanKey ? { idempotencyKey: cleanKey } : {})
    })

    // 7. Synchronize booking financials
    const updatedBooking = await recalculateBookingFinancials(freshBooking._id)

    res.status(201).json({
      success: true,
      message: 'Payment recorded and verified successfully',
      payment,
      bookingSummary: {
        bookingReference: updatedBooking.bookingReference,
        totalPriceDZD: updatedBooking.totalPriceDZD,
        totalPaidDZD: updatedBooking.totalPaidDZD,
        balanceDueDZD: updatedBooking.balanceDueDZD,
        financialStatus: updatedBooking.financialStatus
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to record payment', details: error.message })
  } finally {
    if (bookingLockAcquired) {
      releaseBookingLock(id)
    }
    if (cleanKey) {
      inFlightIdempotencyKeys.delete(cleanKey)
    }
  }
}

/**
 * PATCH /api/agency/payments/:id/verify
 * Agency verifies a customer submitted payment proof and credits balance.
 */
const verifyPayment = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Payment not found' })
  }

  let bookingLockAcquired = false
  let lockedBookingId = null

  try {
    const payment = await TripPayment.findById(id)
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // 1. Authorization: Owning agency or administrator
    const isAgencyOwner = req.user.role === 'partner' && payment.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s payments' })
    }

    // 2. State check
    if (payment.status !== 'submitted') {
      return res.status(400).json({ error: `Cannot verify payment with status "${payment.status}"` })
    }

    const booking = await TripBooking.findById(payment.booking)
    if (!booking) {
      return res.status(404).json({ error: 'Associated booking not found' })
    }

    // Acquire lock on booking
    await acquireBookingLock(booking._id.toString())
    bookingLockAcquired = true
    lockedBookingId = booking._id.toString()

    // Check optional adjusted amount
    let targetAmount = payment.amountDZD
    if (req.body.verifiedAmountDZD !== undefined) {
      const parsedAmount = Number(req.body.verifiedAmountDZD)
      if (isNaN(parsedAmount) || parsedAmount <= 0 || !Number.isInteger(parsedAmount)) {
        return res.status(400).json({ error: 'Verified amount must be a positive integer in DZD' })
      }
      targetAmount = parsedAmount
    }

    // Check overpayment invariant
    if (targetAmount > booking.balanceDueDZD) {
      return res.status(400).json({
        error: `Verified amount (${targetAmount} DZD) exceeds booking balance due (${booking.balanceDueDZD} DZD)`
      })
    }

    // Update payment
    payment.amountDZD = targetAmount
    payment.status = 'verified'
    payment.verifiedBy = req.user._id
    payment.verifiedAt = new Date()
    if (req.body.agencyInternalNote) {
      payment.agencyInternalNote = String(req.body.agencyInternalNote).trim()
    }
    payment.statusHistory.push({
      status: 'verified',
      changedBy: req.user._id,
      note: req.body.note || req.body.agencyInternalNote || 'Payment verified and credited to booking',
      timestamp: new Date()
    })

    await payment.save()

    // Recalculate booking balance
    const updatedBooking = await recalculateBookingFinancials(booking._id)

    res.status(200).json({
      success: true,
      message: 'Payment verified and credited to booking',
      payment,
      booking: {
        totalPaidDZD: updatedBooking.totalPaidDZD,
        balanceDueDZD: updatedBooking.balanceDueDZD,
        financialStatus: updatedBooking.financialStatus
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify payment', details: error.message })
  } finally {
    if (bookingLockAcquired && lockedBookingId) {
      releaseBookingLock(lockedBookingId)
    }
  }
}

/**
 * PATCH /api/agency/payments/:id/reject
 * Agency rejects an invalid or fraudulent payment proof.
 */
const rejectPayment = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Payment not found' })
  }

  try {
    const payment = await TripPayment.findById(id)
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' })
    }

    // 1. Authorization: Owning agency or administrator
    const isAgencyOwner = req.user.role === 'partner' && payment.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s payments' })
    }

    // 2. State check
    if (payment.status !== 'submitted') {
      return res.status(400).json({ error: `Cannot reject payment with status "${payment.status}"` })
    }

    const { rejectionReason, agencyInternalNote } = req.body
    if (!rejectionReason || String(rejectionReason).trim().length < 5) {
      return res.status(400).json({ error: 'Rejection reason is required (minimum 5 characters)' })
    }

    payment.status = 'rejected'
    payment.rejectionReason = String(rejectionReason).trim()
    payment.rejectedAt = new Date()
    if (agencyInternalNote) {
      payment.agencyInternalNote = String(agencyInternalNote).trim()
    }
    payment.statusHistory.push({
      status: 'rejected',
      changedBy: req.user._id,
      note: String(rejectionReason).trim(),
      timestamp: new Date()
    })

    await payment.save()

    // Recalculate booking balance
    await recalculateBookingFinancials(payment.booking)

    res.status(200).json({
      success: true,
      message: 'Payment proof rejected',
      payment
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject payment', details: error.message })
  }
}

/**
 * GET /api/bookings/:id/financials
 * Retrieves authoritative financial summary, payments, and refunds for a booking.
 */
const getBookingFinancials = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  try {
    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Check caller authorization
    const isAgencyOwner = req.user && req.user.role === 'partner' && booking.agency.toString() === req.user._id.toString()
    const isAdmin = req.user && ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)
    const isCustomerOwner = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()
    const isGuestMatch = !req.user && req.query.phone && booking.customerInfo?.phone &&
      booking.customerInfo.phone.replace(/[^\d]/g, '') === String(req.query.phone).replace(/[^\d]/g, '')

    if (!isAgencyOwner && !isAdmin && !isCustomerOwner && !isGuestMatch) {
      return res.status(403).json({ error: 'Access forbidden: You cannot view financial records for this booking' })
    }

    const [payments, refunds] = await Promise.all([
      TripPayment.find({ booking: booking._id }).sort({ paymentDate: -1, createdAt: -1 }),
      TripRefund.find({ booking: booking._id }).sort({ createdAt: -1 })
    ])

    // Sanitize internal agency notes if caller is customer/guest
    const isInternal = isAgencyOwner || isAdmin
    const sanitizedPayments = payments.map(p => {
      const obj = p.toObject()
      if (!isInternal) {
        delete obj.agencyInternalNote
      }
      obj.hasProof = Boolean(obj.proofDocument && obj.proofDocument.filename)
      return obj
    })

    const sanitizedRefunds = refunds.map(r => {
      const obj = r.toObject()
      if (!isInternal) {
        delete obj.agencyInternalNote
      }
      return obj
    })

    res.status(200).json({
      booking: {
        _id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
        currency: booking.currency || 'DZD',
        unitPriceDZD: booking.unitPriceDZD,
        seats: booking.seats,
        totalPriceDZD: booking.totalPriceDZD,
        totalPaidDZD: booking.totalPaidDZD,
        totalRefundedDZD: booking.totalRefundedDZD,
        netPaidDZD: booking.netPaidDZD,
        balanceDueDZD: booking.balanceDueDZD,
        financialStatus: booking.financialStatus,
        paymentDueDate: booking.paymentDueDate,
        requiresDeposit: booking.requiresDeposit,
        depositAmountDZD: booking.depositAmountDZD
      },
      payments: sanitizedPayments,
      refunds: sanitizedRefunds
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve booking financials', details: error.message })
  }
}

/**
 * GET /api/bookings/:bookingId/payments/:paymentId/proof
 * GET /api/agency/payments/:id/proof
 * Streams stored payment proof image or PDF document.
 */
const getPaymentProofFile = async (req, res) => {
  const paymentId = req.params.paymentId || req.params.id
  const bookingId = req.params.bookingId

  if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(404).json({ error: 'Record not found' })
  }

  try {
    const payment = await TripPayment.findById(paymentId)
    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' })
    }

    const booking = await TripBooking.findById(payment.booking)
    if (!booking) {
      return res.status(404).json({ error: 'Associated booking not found' })
    }

    if (bookingId && bookingId.toString() !== booking._id.toString()) {
      return res.status(404).json({ error: 'Payment record not found for this booking' })
    }

    // Authorization
    const isAgencyOwner = req.user && req.user.role === 'partner' && booking.agency.toString() === req.user._id.toString()
    const isAdmin = req.user && ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)
    const isCustomerOwner = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()

    if (!isAgencyOwner && !isAdmin && !isCustomerOwner) {
      return res.status(403).json({ error: 'Access forbidden: You cannot view this proof document' })
    }

    if (!payment.proofDocument || !payment.proofDocument.filename) {
      return res.status(404).json({ error: 'No proof document attached to this payment' })
    }

    const filePath = getProofFilePath(payment.proofDocument.filename)

    res.setHeader('Content-Type', payment.proofDocument.mimeType || 'application/octet-stream')
    res.setHeader('Content-Disposition', `inline; filename="proof-${payment.paymentReference || 'doc'}"`)
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate')

    fs.createReadStream(filePath).pipe(res)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message })
  }
}

/**
 * GET /api/agency/payments
 * Lists all payment records for the agency with filters and pagination.
 */
const getAgencyPayments = async (req, res) => {
  try {
    const filter = {}

    if (req.user.role === 'partner') {
      filter.agency = req.user._id
    } else if (req.query.agency) {
      filter.agency = req.query.agency
    }

    if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.method) {
      filter.method = req.query.method
    }
    if (req.query.bookingId && mongoose.Types.ObjectId.isValid(req.query.bookingId)) {
      filter.booking = req.query.bookingId
    }
    if (req.query.departureId && mongoose.Types.ObjectId.isValid(req.query.departureId)) {
      filter.departure = req.query.departureId
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i')
      filter.$or = [
        { paymentReference: searchRegex },
        { transactionReference: searchRegex }
      ]
    }
    if (req.query.startDate || req.query.endDate) {
      filter.paymentDate = {}
      if (req.query.startDate) filter.paymentDate.$gte = new Date(req.query.startDate)
      if (req.query.endDate) filter.paymentDate.$lte = new Date(req.query.endDate)
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      TripPayment.find(filter)
        .populate('booking', 'bookingReference totalPriceDZD balanceDueDZD financialStatus customerInfo seats')
        .populate('departure', 'startDate meetingPoint status')
        .populate('customer', 'fullName phone email')
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TripPayment.countDocuments(filter)
    ])

    res.status(200).json({
      payments,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', details: error.message })
  }
}

/**
 * GET /api/agency/financials/dashboard
 * Aggregates financial KPIs for an agency.
 */
const getAgencyFinancialDashboard = async (req, res) => {
  try {
    let agencyId = null
    if (req.user.role === 'partner') {
      agencyId = req.user._id
    } else if (req.query.agency && mongoose.Types.ObjectId.isValid(req.query.agency)) {
      agencyId = new mongoose.Types.ObjectId(req.query.agency)
    }

    const bookingFilter = {
      ...(agencyId ? { agency: agencyId } : {}),
      status: { $in: ['pending', 'confirmed', 'completed'] }
    }

    const paymentFilter = {
      ...(agencyId ? { agency: agencyId } : {}),
      status: 'verified'
    }

    const refundFilter = {
      ...(agencyId ? { agency: agencyId } : {}),
      status: 'completed'
    }

    const [
      activeBookings,
      collectedAgg,
      refundedAgg,
      paymentsByMethod,
      recentPayments,
      recentRefunds
    ] = await Promise.all([
      TripBooking.find(bookingFilter).select('totalPriceDZD balanceDueDZD totalPaidDZD financialStatus status paymentDueDate'),
      TripPayment.aggregate([
        { $match: paymentFilter },
        { $group: { _id: null, total: { $sum: '$amountDZD' } } }
      ]),
      TripRefund.aggregate([
        { $match: refundFilter },
        { $group: { _id: null, total: { $sum: '$amountDZD' } } }
      ]),
      TripPayment.aggregate([
        { $match: paymentFilter },
        { $group: { _id: '$method', total: { $sum: '$amountDZD' }, count: { $sum: 1 } } }
      ]),
      TripPayment.find(agencyId ? { agency: agencyId } : {})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('booking', 'bookingReference customerInfo'),
      TripRefund.find(agencyId ? { agency: agencyId } : {})
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('booking', 'bookingReference customerInfo')
    ])

    const grossBookedValueDZD = activeBookings.reduce((sum, b) => sum + (b.totalPriceDZD || 0), 0)
    const totalCollectedDZD = collectedAgg.length > 0 ? collectedAgg[0].total : 0
    const totalRefundedDZD = refundedAgg.length > 0 ? refundedAgg[0].total : 0
    const netRevenueDZD = Math.max(0, totalCollectedDZD - totalRefundedDZD)
    const outstandingReceivablesDZD = activeBookings.reduce((sum, b) => sum + (b.balanceDueDZD || 0), 0)

    const now = new Date()
    const activeBookingsCount = activeBookings.length
    const unpaidBookingsCount = activeBookings.filter(b => b.financialStatus === 'unpaid').length
    const partiallyPaidBookingsCount = activeBookings.filter(b => b.financialStatus === 'partially_paid').length
    const fullyPaidBookingsCount = activeBookings.filter(b => b.financialStatus === 'paid').length
    const overdueBookings = activeBookings.filter(b =>
      ['unpaid', 'partially_paid'].includes(b.financialStatus) &&
      b.paymentDueDate &&
      new Date(b.paymentDueDate) < now
    )
    const overdueBookingsCount = overdueBookings.length

    const byMethod = {}
    paymentsByMethod.forEach(m => {
      byMethod[m._id] = { amountDZD: m.total, count: m.count }
    })

    res.status(200).json({
      summary: {
        currency: 'DZD',
        grossBookedValueDZD,
        totalCollectedDZD,
        totalRefundedDZD,
        netRevenueDZD,
        outstandingReceivablesDZD,
        activeBookingsCount,
        unpaidBookingsCount,
        partiallyPaidBookingsCount,
        fullyPaidBookingsCount,
        overdueBookingsCount
      },
      overdueBookingsCount,
      overdueBookings,
      byMethod,
      recentTransactions: {
        payments: recentPayments,
        refunds: recentRefunds
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate financial dashboard', details: error.message })
  }
}

/**
 * POST /api/bookings/:id/refunds/request
 * Customer requests refund on a cancelled or rejected booking.
 */
const requestRefund = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Booking not found' })
  }

  try {
    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // 1. Authorization: Customer owner
    const isOwner = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()
    if (!isOwner) {
      return res.status(403).json({ error: 'Access forbidden: You cannot request a refund for this booking' })
    }

    // 2. Operational state: must be cancelled or rejected
    if (!['cancelled', 'rejected'].includes(booking.status)) {
      return res.status(400).json({ error: 'Booking must be cancelled or rejected before requesting a refund' })
    }

    // 3. Invariant check: netPaidDZD must be > 0
    if (booking.netPaidDZD <= 0) {
      return res.status(400).json({ error: 'No refundable balance remaining' })
    }

    // 4. Input validation
    const amountDZD = Number(req.body.amountDZD)
    if (isNaN(amountDZD) || amountDZD <= 0 || !Number.isInteger(amountDZD)) {
      return res.status(400).json({ error: 'Valid refund amount in DZD is required' })
    }

    if (amountDZD > booking.netPaidDZD) {
      return res.status(400).json({
        error: `Refund amount (${amountDZD} DZD) exceeds collected funds (${booking.netPaidDZD} DZD)`
      })
    }

    const { reason, method, customerNote } = req.body
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'Refund reason is mandatory' })
    }

    const refund = await TripRefund.create({
      booking: booking._id,
      departure: booking.departure,
      agency: booking.agency,
      customer: booking.customer,
      amountDZD,
      currency: 'DZD',
      method: ['cash', 'ccp', 'baridimob', 'bank_transfer', 'other'].includes(method) ? method : 'ccp',
      status: 'requested',
      reason: String(reason).trim(),
      requestedBy: req.user._id,
      customerNotificationNote: customerNote ? String(customerNote).trim() : '',
      statusHistory: [
        {
          status: 'requested',
          changedBy: req.user._id,
          note: String(reason).trim(),
          timestamp: new Date()
        }
      ]
    })

    // Synchronize booking financial status (sets refund_pending)
    await recalculateBookingFinancials(booking._id)

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      refund
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit refund request', details: error.message })
  }
}

/**
 * PATCH /api/agency/refunds/:id/approve
 * Agency approves a customer refund request before actual disbursement.
 */
const approveRefund = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Refund not found' })
  }

  try {
    const refund = await TripRefund.findById(id)
    if (!refund) {
      return res.status(404).json({ error: 'Refund record not found' })
    }

    // 1. Authorization: Agency owner or admin
    const isAgencyOwner = req.user.role === 'partner' && refund.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s refunds' })
    }

    if (refund.status !== 'requested') {
      return res.status(400).json({ error: `Cannot approve refund with status "${refund.status}". Status must be "requested"` })
    }

    refund.status = 'approved'
    refund.approvedBy = req.user._id
    refund.approvedAt = new Date()
    refund.processedBy = req.user._id
    refund.processedAt = new Date()
    if (req.body.agencyInternalNote || req.body.internalNote) {
      refund.agencyInternalNote = String(req.body.agencyInternalNote || req.body.internalNote).trim()
    }

    refund.statusHistory.push({
      status: 'approved',
      changedBy: req.user._id,
      note: req.body.agencyInternalNote || req.body.internalNote || 'Refund request approved by agency',
      timestamp: new Date()
    })

    await refund.save()

    // Recalculate booking financials (ensures status reflects refund_pending)
    const updatedBooking = await recalculateBookingFinancials(refund.booking)

    res.status(200).json({
      success: true,
      message: 'Refund request approved successfully',
      refund,
      booking: {
        totalPaidDZD: updatedBooking.totalPaidDZD,
        totalRefundedDZD: updatedBooking.totalRefundedDZD,
        netPaidDZD: updatedBooking.netPaidDZD,
        financialStatus: updatedBooking.financialStatus
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve refund', details: error.message })
  }
}

/**
 * PATCH /api/agency/refunds/:id/complete
 * Agency completes and disburses refund (e.g. wire sent, cash returned).
 */
const completeRefund = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Refund not found' })
  }

  try {
    const refund = await TripRefund.findById(id)
    if (!refund) {
      return res.status(404).json({ error: 'Refund record not found' })
    }

    // 1. Authorization: Agency owner or admin
    const isAgencyOwner = req.user.role === 'partner' && refund.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s refunds' })
    }

    if (!['requested', 'approved'].includes(refund.status)) {
      return res.status(400).json({ error: `Cannot complete refund with status "${refund.status}"` })
    }

    const booking = await TripBooking.findById(refund.booking)
    if (!booking) {
      return res.status(404).json({ error: 'Associated booking not found' })
    }

    const cancellationFeeDZD = Number(req.body.cancellationFeeDZD) || 0
    if (cancellationFeeDZD < 0 || !Number.isInteger(cancellationFeeDZD)) {
      return res.status(400).json({ error: 'Cancellation fee must be a non-negative integer' })
    }

    refund.status = 'completed'
    refund.cancellationFeeDZD = cancellationFeeDZD
    refund.processedBy = req.user._id
    refund.processedAt = new Date()
    refund.transactionReference = req.body.transactionReference ? String(req.body.transactionReference).trim() : ''
    if (req.body.agencyInternalNote || req.body.internalNote) {
      refund.agencyInternalNote = String(req.body.agencyInternalNote || req.body.internalNote).trim()
    }

    refund.statusHistory.push({
      status: 'completed',
      changedBy: req.user._id,
      note: req.body.agencyInternalNote || req.body.internalNote || 'Refund disbursed and completed',
      timestamp: new Date()
    })

    await refund.save()

    // Recalculate booking financials
    const updatedBooking = await recalculateBookingFinancials(booking._id)

    res.status(200).json({
      success: true,
      message: 'Refund completed successfully',
      refund,
      booking: {
        totalPaidDZD: updatedBooking.totalPaidDZD,
        totalRefundedDZD: updatedBooking.totalRefundedDZD,
        netPaidDZD: updatedBooking.netPaidDZD,
        financialStatus: updatedBooking.financialStatus
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete refund', details: error.message })
  }
}

/**
 * PATCH /api/agency/refunds/:id/reject
 * Agency rejects a refund request with justification.
 */
const rejectRefund = async (req, res) => {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Refund not found' })
  }

  try {
    const refund = await TripRefund.findById(id)
    if (!refund) {
      return res.status(404).json({ error: 'Refund record not found' })
    }

    const isAgencyOwner = req.user.role === 'partner' && refund.agency.toString() === req.user._id.toString()
    const isAdmin = ['administrator', 'agencyAdmin', 'superAdmin'].includes(req.user.role)

    if (!isAgencyOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s refunds' })
    }

    if (!['requested', 'approved'].includes(refund.status)) {
      return res.status(400).json({ error: `Cannot reject refund with status "${refund.status}"` })
    }

    const { rejectionReason, agencyInternalNote } = req.body
    if (!rejectionReason || !String(rejectionReason).trim()) {
      return res.status(400).json({ error: 'Rejection reason is mandatory' })
    }

    refund.status = 'rejected'
    refund.rejectionReason = String(rejectionReason).trim()
    refund.processedBy = req.user._id
    refund.processedAt = new Date()
    if (agencyInternalNote) {
      refund.agencyInternalNote = String(agencyInternalNote).trim()
    }

    refund.statusHistory.push({
      status: 'rejected',
      changedBy: req.user._id,
      note: String(rejectionReason).trim(),
      timestamp: new Date()
    })

    await refund.save()

    // Recalculate booking financials
    await recalculateBookingFinancials(refund.booking)

    res.status(200).json({
      success: true,
      message: 'Refund request rejected',
      refund
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject refund', details: error.message })
  }
}

/**
 * GET /api/agency/refunds
 * Lists all refund requests and transactions.
 */
const getAgencyRefunds = async (req, res) => {
  try {
    const filter = {}

    if (req.user.role === 'partner') {
      filter.agency = req.user._id
    } else if (req.query.agency) {
      filter.agency = req.query.agency
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [refunds, total] = await Promise.all([
      TripRefund.find(filter)
        .populate('booking', 'bookingReference totalPriceDZD netPaidDZD customerInfo')
        .populate('customer', 'fullName phone email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TripRefund.countDocuments(filter)
    ])

    res.status(200).json({
      refunds,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch refunds', details: error.message })
  }
}

module.exports = {
  submitCustomerPaymentProof,
  recordAgencyPayment,
  verifyPayment,
  rejectPayment,
  getBookingFinancials,
  getPaymentProofFile,
  getAgencyPayments,
  getAgencyFinancialDashboard,
  requestRefund,
  approveRefund,
  completeRefund,
  rejectRefund,
  getAgencyRefunds
}
