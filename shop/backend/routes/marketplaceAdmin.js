const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const {
  getAdminDashboard,
  getSellerApplications,
  reviewSellerApplication,
  getAllSellers,
  updateSellerStatus,
  getProductsForModeration,
  moderateProduct,
  getAllOrders,
  verifyOrderPayment,
  getCommissionLedger,
  settleCommissionPayout,
  getAdminSettings,
  updateAdminSettings,
  getAuditLogs
} = require('../controllers/marketplaceAdminController')

// All marketplace admin routes require authentication and administrator role
router.use(requireAuth)
router.use(requireRole('administrator'))

// Dashboard
router.get('/dashboard', getAdminDashboard)

// Seller Applications & Moderation
router.get('/seller-applications', getSellerApplications)
router.put('/seller-applications/:id/review', reviewSellerApplication)
router.get('/sellers', getAllSellers)
router.put('/sellers/:id/status', updateSellerStatus)

// Product Moderation Queue
router.get('/products/moderation', getProductsForModeration)
router.put('/products/:id/moderate', moderateProduct)

// Order & Payment Verification
router.get('/orders', getAllOrders)
router.put('/orders/:id/payment-status', verifyOrderPayment)

// Commissions & Settlement
router.get('/commissions', getCommissionLedger)
router.put('/commissions/:id/settle', settleCommissionPayout)

// Settings & Audit Logs
router.get('/settings', getAdminSettings)
router.put('/settings', updateAdminSettings)
router.get('/audit-logs', getAuditLogs)

module.exports = router
