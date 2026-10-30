const mongoose = require('mongoose')
const TripBooking = require('../models/TripBooking')
const TripDeparture = require('../models/TripDeparture')
const Trip = require('../models/Trip')
const { recalculateBookingFinancials } = require('../utils/financialCalculator')

// Active in-flight idempotency keys across requests to prevent race conditions
const inFlightIdempotencyKeys = new Set()

/**
 * Validates Algerian phone number format (+213... or 05/06/07...)
 */
const isValidPhone = (phone) => {
  if (!phone) return false
  const cleaned = String(phone).replace(/[\s.-]/g, '')
  return /^(\+213|00213|0)[567]\d{8}$/.test(cleaned) || /^\+?\d{9,15}$/.test(cleaned)
}

/**
 * POST /api/bookings
 * Public / authenticated traveler booking request with atomic seat reservation.
 */
const createBooking = async (req, res) => {
  let allocatedSeats = 0
  let targetDepartureId = null
  let cleanKey = null

  try {
    const {
      departureId,
      seats = 1,
      customerInfo = {},
      passengers = [],
      specialRequests = '',
      idempotencyKey
    } = req.body

    cleanKey = (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim().length > 0)
      ? idempotencyKey.trim()
      : null

    // 1. Input Validation
    if (!departureId || !mongoose.Types.ObjectId.isValid(departureId)) {
      return res.status(400).json({ error: 'Valid departure session ID is required' })
    }

    const numSeats = Number(seats)
    if (!Number.isInteger(numSeats) || numSeats < 1) {
      return res.status(400).json({ error: 'Seats must be a positive integer of at least 1' })
    }

    const fullName = customerInfo.fullName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : '')
    const phone = customerInfo.phone || (req.user ? req.user.phone : '')
    const email = customerInfo.email || (req.user ? req.user.email : '')

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Traveler full name is required (minimum 2 characters)' })
    }

    if (!phone || !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Valid contact phone number is required (e.g. 0550 12 34 56)' })
    }

    // 2. Idempotency Check with Scoped Identity & Payload Matching
    if (cleanKey) {
      // If another request with this exact key is currently in-flight, wait for it to complete
      if (inFlightIdempotencyKeys.has(cleanKey)) {
        let waitCount = 0
        while (inFlightIdempotencyKeys.has(cleanKey) && waitCount < 20) {
          await new Promise(resolve => setTimeout(resolve, 50))
          waitCount++
        }
      } else {
        // Register in-flight key SYNCHRONOUSLY before any async I/O
        inFlightIdempotencyKeys.add(cleanKey)
      }

      const existing = await TripBooking.findOne({ idempotencyKey: cleanKey })
      if (existing) {
        // A. Identity Scoping: Verify caller owns this idempotency record
        const callerPhone = phone ? String(phone).replace(/[^\d]/g, '') : ''
        const existingPhone = existing.customerInfo?.phone ? String(existing.customerInfo.phone).replace(/[^\d]/g, '') : ''

        let isSameCustomer = false
        if (existing.customer && req.user) {
          isSameCustomer = existing.customer.toString() === req.user._id.toString()
        } else if (!existing.customer) {
          // Guest booking: phone number must match established record
          isSameCustomer = callerPhone && existingPhone && callerPhone === existingPhone
        }

        if (!isSameCustomer) {
          // Security: Cross-customer key reuse must not leak or return the other user's booking
          return res.status(409).json({
            error: 'Idempotency key conflict: This key is already in use by another customer or booking'
          })
        }

        // B. Payload Equivalence: Check if request parameters match original request
        const sameDeparture = existing.departure && existing.departure.toString() === departureId.toString()
        const sameSeats = existing.seats === numSeats

        if (!sameDeparture || !sameSeats) {
          return res.status(409).json({
            error: 'Idempotency key conflict: Request parameters do not match original request for this key'
          })
        }

        // C. Legitimate retry: return existing booking without double-allocating seats
        const populatedExisting = await TripBooking.findById(existing._id)
          .populate('trip', 'name destination image durationDays')
          .populate('departure', 'startDate endDate meetingPoint departureInstructions status')
          .populate('agency', 'companyName phone email')

        return res.status(200).json({
          message: 'Booking retrieved from idempotent record',
          booking: populatedExisting
        })
      }
    }

    // 3. Verify departure exists and is in the future
    const departure = await TripDeparture.findById(departureId)
    if (!departure) {
      return res.status(404).json({ error: 'Scheduled departure session not found' })
    }

    if (!['scheduled', 'guaranteed'].includes(departure.status)) {
      return res.status(400).json({ error: `Cannot book departure with status "${departure.status}"` })
    }

    if (new Date(departure.startDate) < new Date()) {
      return res.status(400).json({ error: 'Cannot book a departure that has already occurred or departed' })
    }

    targetDepartureId = departure._id
    allocatedSeats = numSeats

    // 4. ATOMIC CAPACITY ALLOCATION VIA CONDITIONAL UPDATE
    // This single-document MongoDB operation guarantees zero overbooking even under high concurrency
    // without requiring replica set transactions!
    const updatedDeparture = await TripDeparture.findOneAndUpdate(
      {
        _id: targetDepartureId,
        status: { $in: ['scheduled', 'guaranteed'] },
        $expr: {
          $lte: [
            { $add: ['$bookedSeats', numSeats] },
            '$capacity'
          ]
        }
      },
      {
        $inc: { bookedSeats: numSeats }
      },
      {
        new: true
      }
    )

    if (!updatedDeparture) {
      return res.status(409).json({
        error: 'Unable to reserve seats: Departure is either fully booked or has insufficient remaining capacity'
      })
    }

    // 5. Structure Passenger List
    let finalPassengers = []
    if (Array.isArray(passengers) && passengers.length > 0) {
      finalPassengers = passengers.slice(0, numSeats).map(p => ({
        fullName: p.fullName ? String(p.fullName).trim() : fullName.trim(),
        ageCategory: ['adult', 'child', 'infant'].includes(p.ageCategory) ? p.ageCategory : 'adult',
        specialNotes: p.specialNotes ? String(p.specialNotes).trim() : '',
        emergencyPhone: p.emergencyPhone ? String(p.emergencyPhone).trim() : phone.trim()
      }))
    }

    // Fill remaining passenger slots with primary booker if not specified
    while (finalPassengers.length < numSeats) {
      finalPassengers.push({
        fullName: fullName.trim(),
        ageCategory: 'adult',
        specialNotes: '',
        emergencyPhone: phone.trim()
      })
    }

    // 6. Create TripBooking record with Server-Trusted Pricing & Deposit Settings
    const unitPriceDZD = Number(updatedDeparture.priceDZD) || 0
    const totalPriceDZD = unitPriceDZD * numSeats

    // Load package deposit settings if configured
    let requiresDeposit = false
    let depositAmountDZD = 0
    let paymentDueDate = null

    try {
      const tripDoc = await Trip.findById(updatedDeparture.trip).select(
        'requiresDeposit depositType depositAmountDZD depositPercentage paymentDueDaysBeforeDeparture'
      )
      if (tripDoc && tripDoc.requiresDeposit) {
        requiresDeposit = true
        if (tripDoc.depositType === 'percentage') {
          depositAmountDZD = Math.round((totalPriceDZD * (tripDoc.depositPercentage || 0)) / 100)
        } else if (tripDoc.depositType === 'fixed') {
          depositAmountDZD = Math.min(totalPriceDZD, (Number(tripDoc.depositAmountDZD) || 0) * numSeats)
        }
      }

      if (tripDoc && tripDoc.paymentDueDaysBeforeDeparture && updatedDeparture.startDate) {
        const days = Number(tripDoc.paymentDueDaysBeforeDeparture) || 0
        const dueDate = new Date(updatedDeparture.startDate)
        dueDate.setDate(dueDate.getDate() - days)
        paymentDueDate = dueDate
      }
    } catch (tripErr) {
      // Non-blocking fallback to defaults
    }

    const bookingPayload = {
      trip: updatedDeparture.trip,
      departure: updatedDeparture._id,
      agency: updatedDeparture.agency,
      customer: req.user ? req.user._id : null,
      customerInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : ''
      },
      seats: numSeats,
      unitPriceDZD,
      totalPriceDZD,
      currency: 'DZD',
      financialStatus: 'unpaid',
      totalPaidDZD: 0,
      totalRefundedDZD: 0,
      netPaidDZD: 0,
      balanceDueDZD: totalPriceDZD,
      paymentDueDate,
      requiresDeposit,
      depositAmountDZD,
      passengers: finalPassengers,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedBy: req.user ? req.user._id : null,
          note: 'Booking requested by traveler with seats reserved',
          timestamp: new Date()
        }
      ],
      specialRequests: specialRequests ? String(specialRequests).trim() : '',
      ...(cleanKey ? { idempotencyKey: cleanKey } : {})
    }

    let booking = null
    try {
      booking = await TripBooking.create(bookingPayload)
    } catch (createErr) {
      // 7. FAILURE RECOVERY COMPENSATION
      // If booking document creation failed, release the allocated seats immediately!
      await TripDeparture.findByIdAndUpdate(targetDepartureId, {
        $inc: { bookedSeats: -allocatedSeats }
      })
      throw createErr
    }

    const populated = await TripBooking.findById(booking._id)
      .populate('trip', 'name destination image durationDays')
      .populate('departure', 'startDate endDate meetingPoint departureInstructions status')
      .populate('agency', 'companyName phone email')

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully and seats reserved',
      booking: populated
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking', details: error.message })
  } finally {
    if (cleanKey) {
      inFlightIdempotencyKeys.delete(cleanKey)
    }
  }
}

/**
 * GET /api/bookings/reference/:reference
 * Retrieves booking details with privacy verification.
 */
const getBookingByReference = async (req, res) => {
  try {
    const { reference } = req.params
    const { phone } = req.query

    if (!reference) {
      return res.status(400).json({ error: 'Booking reference is required' })
    }

    const booking = await TripBooking.findOne({ bookingReference: reference.toUpperCase().trim() })
      .populate('trip', 'name destination image durationDays inclusions exclusions cancellationPolicy')
      .populate('departure', 'startDate endDate meetingPoint departureInstructions status')
      .populate('agency', 'companyName phone email')

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Access control:
    // 1. Authenticated customer owner
    // 2. Owning agency
    // 3. Administrator
    // 4. Guest with matching phone verification
    const isOwnerCustomer = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()
    const isOwnerAgency = req.user && booking.agency && booking.agency._id.toString() === req.user._id.toString()
    const isAdmin = req.user && req.user.role === 'administrator'
    const isPhoneVerified = phone && booking.customerInfo.phone && booking.customerInfo.phone.replace(/[^\d]/g, '') === String(phone).replace(/[^\d]/g, '')

    if (!isOwnerCustomer && !isOwnerAgency && !isAdmin && !isPhoneVerified) {
      return res.status(403).json({ error: 'Access forbidden: You are not authorized to view this booking' })
    }

    res.status(200).json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve booking', details: error.message })
  }
}

/**
 * GET /api/bookings/my
 * Lists bookings belonging to the currently authenticated traveler.
 */
const getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const bookings = await TripBooking.find({
      $or: [
        { customer: req.user._id },
        { 'customerInfo.phone': req.user.phone }
      ]
    })
      .populate('trip', 'name destination image durationDays')
      .populate('departure', 'startDate endDate meetingPoint status')
      .populate('agency', 'companyName phone')
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve bookings', details: error.message })
  }
}

/**
 * POST /api/bookings/:id/cancel
 * Allows a traveler to cancel their booking under valid business rules.
 * Atomically releases the reserved seats.
 */
const cancelTouristBooking = async (req, res) => {
  try {
    const { id } = req.params
    const { cancellationReason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    // Verify ownership
    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const isCustomer = req.user && booking.customer && booking.customer.toString() === req.user._id.toString()
    const isPhoneMatch = req.body.phone && booking.customerInfo.phone.replace(/[^\d]/g, '') === String(req.body.phone).replace(/[^\d]/g, '')
    const isAdmin = req.user && req.user.role === 'administrator'

    if (!isCustomer && !isPhoneMatch && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot cancel this booking' })
    }

    // Atomic status transition from active state ('pending' or 'confirmed') to 'cancelled'
    const updated = await TripBooking.findOneAndUpdate(
      {
        _id: id,
        status: { $in: ['pending', 'confirmed'] }
      },
      {
        $set: {
          status: 'cancelled',
          cancellationReason: cancellationReason ? String(cancellationReason).trim() : 'Cancelled by customer',
          cancelledAt: new Date(),
          cancelledBy: req.user ? req.user._id : null
        },
        $push: {
          statusHistory: {
            status: 'cancelled',
            changedBy: req.user ? req.user._id : null,
            note: cancellationReason ? String(cancellationReason).trim() : 'Cancelled by customer',
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )

    if (!updated) {
      return res.status(400).json({ error: 'Booking cannot be cancelled (already cancelled, completed, or rejected)' })
    }

    // Atomically release seats on departure exactly once
    await TripDeparture.findOneAndUpdate(
      {
        _id: updated.departure,
        bookedSeats: { $gte: updated.seats }
      },
      {
        $inc: { bookedSeats: -updated.seats }
      }
    )

    // Synchronize financial status on cancellation (e.g. cancelled_unpaid or refund_pending)
    const reconciled = await recalculateBookingFinancials(updated._id)

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and seats released',
      booking: reconciled
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message })
  }
}

module.exports = {
  createBooking,
  getBookingByReference,
  getMyBookings,
  cancelTouristBooking
}
