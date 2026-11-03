const express = require('express')
const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const optionalAuth = require('../middleware/optionalAuth')

const {
  getMarketplaceSettings,
  getPublicProducts,
  getPublicProduct,
  getFeaturedProducts,
  getCategories,
  getPublicSellers,
  getPublicSellerStore,
  applyForSeller,
  createMarketplaceOrder,
  getMyOrders,
  getOrderDetails,
  submitPaymentProof
} = require('../controllers/marketplaceController')

// Public Storefront Routes
router.get('/settings', getMarketplaceSettings)
router.get('/products', getPublicProducts)
router.get('/products/:id', getPublicProduct)
router.get('/featured', getFeaturedProducts)
router.get('/categories', getCategories)
router.get('/sellers', getPublicSellers)
router.get('/sellers/:slug', getPublicSellerStore)

// Seller Application
router.post('/sellers/apply', applyForSeller)

// Cart & Orders
router.post('/orders', optionalAuth, createMarketplaceOrder)
router.get('/orders/my', requireAuth, getMyOrders)
router.get('/orders/:id', optionalAuth, getOrderDetails)
router.post('/orders/:id/payment-proof', optionalAuth, submitPaymentProof)

module.exports = router
