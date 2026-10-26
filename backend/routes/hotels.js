const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getHotels,
    getHotel,
    createHotel,
    deleteHotel,
    updateHotel,
    importHotels,
    getLocalHotels } = require('../controllers/hotelsController')

// Public routes
// GET all hotels
router.get('/', getHotels)

// GET local hotels near coordinates
router.post('/localHotels', getLocalHotels)

// GET a single Hotel
router.get('/:id', getHotel)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createHotel)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteHotel)
router.patch('/:id', requireAuth, requireRole('administrator'), updateHotel)
router.post('/import', requireAuth, requireRole('administrator'), importHotels)

module.exports = router
