const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const { 
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    getTripsByUser,
    deleteTrip } = require('../controllers/tripsController')

// Public browsing routes
router.get('/', getTrips)
router.get('/:id', getTripById)

// Protected routes
router.post('/', requireAuth, requireRole('partner', 'administrator'), createTrip)
router.put('/:id', requireAuth, updateTrip)
router.delete('/:id', requireAuth, deleteTrip)
router.get('/user/:userId', requireAuth, getTripsByUser)

module.exports = router

