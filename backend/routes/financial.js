const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const {
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
} = require('../controllers/financialController')

// Public / Tourist routes
router.post('/bookings/:id/payments/submit', submitCustomerPaymentProof)
router.get('/bookings/:id/financials', getBookingFinancials)
router.get('/bookings/:bookingId/payments/:paymentId/proof', getPaymentProofFile)
router.post('/bookings/:id/refunds/request', requireAuth, requestRefund)

// Agency routes
router.post('/agency/bookings/:id/payments', requireAuth, requireRole('partner', 'administrator'), recordAgencyPayment)
router.get('/agency/payments', requireAuth, requireRole('partner', 'administrator'), getAgencyPayments)
router.get('/agency/payments/:id/proof', requireAuth, requireRole('partner', 'administrator'), getPaymentProofFile)
router.patch('/agency/payments/:id/verify', requireAuth, requireRole('partner', 'administrator'), verifyPayment)
router.post('/agency/payments/:id/verify', requireAuth, requireRole('partner', 'administrator'), verifyPayment)
router.patch('/agency/payments/:id/reject', requireAuth, requireRole('partner', 'administrator'), rejectPayment)
router.post('/agency/payments/:id/reject', requireAuth, requireRole('partner', 'administrator'), rejectPayment)
router.get('/agency/financials/dashboard', requireAuth, requireRole('partner', 'administrator'), getAgencyFinancialDashboard)
router.get('/agency/refunds', requireAuth, requireRole('partner', 'administrator'), getAgencyRefunds)
router.patch('/agency/refunds/:id/approve', requireAuth, requireRole('partner', 'administrator'), approveRefund)
router.post('/agency/refunds/:id/approve', requireAuth, requireRole('partner', 'administrator'), approveRefund)
router.patch('/agency/refunds/:id/complete', requireAuth, requireRole('partner', 'administrator'), completeRefund)
router.post('/agency/refunds/:id/complete', requireAuth, requireRole('partner', 'administrator'), completeRefund)
router.patch('/agency/refunds/:id/reject', requireAuth, requireRole('partner', 'administrator'), rejectRefund)
router.post('/agency/refunds/:id/reject', requireAuth, requireRole('partner', 'administrator'), rejectRefund)

module.exports = router
