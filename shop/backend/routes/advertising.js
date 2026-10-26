const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getAdvertisings,
    getAdvertising,
    createAdvertising,
    deleteAdvertising,
    updateAdvertising,
    getAdvertisingById,
    getAdvertisingByOwnerId } = require('../controllers/advertisingController')

// Public routes
router.get('/', getAdvertisings)
router.get('/:id', getAdvertising)

// Protected partner & administrator mutation routes
router.post('/', requireAuth, requireRole('partner', 'administrator'), createAdvertising)
router.delete('/:id', requireAuth, requireRole('partner', 'administrator'), deleteAdvertising)
router.patch('/:id', requireAuth, requireRole('partner', 'administrator'), updateAdvertising)
router.patch('/:advertisingId', requireAuth, requireRole('partner', 'administrator'), getAdvertisingById)
router.get('/getAdvertisingByOwnerId/:ownerId', requireAuth, getAdvertisingByOwnerId)

module.exports = router
