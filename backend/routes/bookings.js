const express = require('express')
const router = express.Router()

const {
  createBooking,
  getBookingByReference,
  getMyBookings,
  cancelTouristBooking
} = require('../controllers/bookingsController')

const {
  submitCustomerPaymentProof,
  getBookingFinancials,
  getPaymentProofFile,
  requestRefund
} = require('../controllers/financialController')

const requireAuth = require('../middleware/requireAuth')

// Optional auth helper: attaches user if valid token exists, but doesn't block guests
const optionalAuth = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next()
  }
  const token = authorization.split(' ')[1]
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return next()
  }
  try {
    const jwt = require('jsonwebtoken')
    const User = require('../models/User')
    const { _id } = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id }).select('_id role email typeAccount fileStatus companyName phone firstName lastName')
    if (user) {
      req.user = user
    }
  } catch (e) {
    // Silently continue as guest
  }
  next()
}

// Traveler booking endpoints
router.post('/', optionalAuth, createBooking)
router.get('/reference/:reference', optionalAuth, getBookingByReference)
router.get('/my', requireAuth, getMyBookings)
router.post('/:id/cancel', optionalAuth, cancelTouristBooking)

// Traveler financial endpoints
router.post('/:id/payments/submit', optionalAuth, submitCustomerPaymentProof)
router.get('/:id/financials', optionalAuth, getBookingFinancials)
router.get('/:bookingId/payments/:paymentId/proof', optionalAuth, getPaymentProofFile)
router.post('/:id/refunds/request', requireAuth, requestRefund)

module.exports = router
