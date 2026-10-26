const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getBillings,
    getBilling,
    createBilling,
    deleteBilling,
    updateBilling,
    getBillingsByUserId } = require('../controllers/billingsController')

// Require auth for all billing routes
router.use(requireAuth)

// Admin-only billing listing and management
router.get('/', requireRole('administrator'), getBillings)
router.delete('/:id', requireRole('administrator'), deleteBilling)
router.patch('/:id', requireRole('administrator'), updateBilling)

// User-owned or Admin routes
router.get('/:id', getBilling)
router.post('/', createBilling)
router.get('/getBillingsByUserId/:id', getBillingsByUserId)

module.exports = router
