const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getBrands,
    getBrand,
    createBrand,
    deleteBrand,
    updateBrand } = require('../controllers/brandsController')

// Public routes
router.get('/', getBrands)
router.get('/:id', getBrand)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createBrand)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteBrand)
router.patch('/:id', requireAuth, requireRole('administrator'), updateBrand)

module.exports = router
