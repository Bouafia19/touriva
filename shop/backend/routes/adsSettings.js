const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getAdsSettings,
    createAdsSettings,
    updateAdsSettings,
    getAppImage } = require('../controllers/adsSettingsController')
    
// GET 
router.get('/getAppImage', getAppImage)

// require auth for all routes
router.use(requireAuth)

// GET a single adsSettings
router.get('/', getAdsSettings)


// POST a new adsSettings
router.post('/', createAdsSettings)

// UPDATE a adsSettings
router.patch('/:id', updateAdsSettings)


module.exports = router