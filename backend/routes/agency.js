const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')
const requireAgencyVerified = require('../middleware/requireAgencyVerified')

const {
  getAgencyProfile,
  getAgencyPackages,
  createAgencyPackage,
  getAgencyPackageById,
  updateAgencyPackage,
  deleteAgencyPackage,
  getAgencyDepartures,
  createAgencyDeparture,
  updateAgencyDeparture,
  cancelAgencyDeparture,
  deleteAgencyDeparture,
  getDepartureManifest,
  getAgencyBookings,
  getAgencyBookingById,
  confirmAgencyBooking,
  rejectAgencyBooking,
  cancelAgencyBooking,
  getAgencyEnquiries,
  getAgencyEnquiryById,
  quoteAgencyEnquiry,
  declineAgencyEnquiry
} = require('../controllers/agencyController')

const {
  recordAgencyPayment,
  verifyPayment,
  rejectPayment,
  getAgencyPayments,
  getPaymentProofFile,
  getAgencyFinancialDashboard,
  approveRefund,
  completeRefund,
  rejectRefund,
  getAgencyRefunds
} = require('../controllers/financialController')

// All agency management endpoints require authentication and partner or administrator role
router.use(requireAuth)
router.use(requireRole('partner', 'administrator'))

// Profile & Dashboard overview
router.get('/profile', getAgencyProfile)

// Package Management
router.get('/packages', getAgencyPackages)
router.get('/packages/:id', getAgencyPackageById)
router.post('/packages', requireAgencyVerified, createAgencyPackage)
router.patch('/packages/:id', updateAgencyPackage)
router.delete('/packages/:id', deleteAgencyPackage)

// Departure Management
router.get('/departures', getAgencyDepartures)
router.post('/departures', requireAgencyVerified, createAgencyDeparture)
router.patch('/departures/:id', updateAgencyDeparture)
router.patch('/departures/:id/cancel', cancelAgencyDeparture)
router.post('/departures/:id/cancel', cancelAgencyDeparture)
router.delete('/departures/:id', deleteAgencyDeparture)
router.get('/departures/:id/manifest', getDepartureManifest)

// Booking Management
router.get('/bookings', getAgencyBookings)
router.get('/bookings/:id', getAgencyBookingById)
router.patch('/bookings/:id/confirm', confirmAgencyBooking)
router.post('/bookings/:id/confirm', confirmAgencyBooking)
router.patch('/bookings/:id/reject', rejectAgencyBooking)
router.post('/bookings/:id/reject', rejectAgencyBooking)
router.patch('/bookings/:id/cancel', cancelAgencyBooking)
router.post('/bookings/:id/cancel', cancelAgencyBooking)

// Custom Enquiries & Quotations
router.get('/enquiries', getAgencyEnquiries)
router.get('/enquiries/:id', getAgencyEnquiryById)
router.post('/enquiries/:id/quote', quoteAgencyEnquiry)
router.patch('/enquiries/:id/quote', quoteAgencyEnquiry)
router.patch('/enquiries/:id/decline', declineAgencyEnquiry)
router.post('/enquiries/:id/decline', declineAgencyEnquiry)

// Financial Management: Payments & Receipts
router.post('/bookings/:id/payments', recordAgencyPayment)
router.get('/payments', getAgencyPayments)
router.get('/payments/:id/proof', getPaymentProofFile)
router.patch('/payments/:id/verify', verifyPayment)
router.post('/payments/:id/verify', verifyPayment)
router.patch('/payments/:id/reject', rejectPayment)
router.post('/payments/:id/reject', rejectPayment)
router.get('/financials/dashboard', getAgencyFinancialDashboard)

// Financial Management: Refunds
router.get('/refunds', getAgencyRefunds)
router.patch('/refunds/:id/approve', approveRefund)
router.post('/refunds/:id/approve', approveRefund)
router.patch('/refunds/:id/complete', completeRefund)
router.post('/refunds/:id/complete', completeRefund)
router.patch('/refunds/:id/reject', rejectRefund)
router.post('/refunds/:id/reject', rejectRefund)

module.exports = router
