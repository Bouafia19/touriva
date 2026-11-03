const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const {
  getSellerProfile,
  updateSellerProfile,
  getSellerDashboard,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateFulfillmentStatus,
  getSellerFinances
} = require('../controllers/sellerController')

// All seller routes require authentication and seller or administrator role
router.use(requireAuth)
router.use(requireRole('seller', 'administrator'))

// Store Profile & Dashboard
router.get('/profile', getSellerProfile)
router.put('/profile', updateSellerProfile)
router.get('/dashboard', getSellerDashboard)

// Product Management (Scoped to logged in seller)
router.get('/products', getSellerProducts)
router.post('/products', createSellerProduct)
router.put('/products/:id', updateSellerProduct)
router.delete('/products/:id', deleteSellerProduct)

// Order Fulfillment (Scoped to items belonging to this seller)
router.get('/orders', getSellerOrders)
router.put('/orders/:orderItemId/fulfillment', updateFulfillmentStatus)

// Financials & Net Payouts
router.get('/finances', getSellerFinances)

module.exports = router
