const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getAdsSettings,
    createAdsSettings,
    updateAdsSettings,
    getAppImage } = require('../controllers/adsSettingsController')
    
// Public endpoint
router.get('/getAppImage', getAppImage)

// Require administrator role for all management routes
router.use(requireAuth, requireRole('administrator'))

// GET a single adsSettings
router.get('/', getAdsSettings)

// POST a new adsSettings
router.post('/', createAdsSettings)

// UPDATE a adsSettings
router.patch('/:id', updateAdsSettings)

module.exports = router
