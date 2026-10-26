const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const { 
    subscribeToTrip,
    getAllSubscriptions,
    getTripSubscriptions } = require('../controllers/tripSubscriptionController')

// Public trip booking (traveler reservation with input validation)
router.post('/', subscribeToTrip)

// Admin only: view all trip subscriptions grouped by trip
router.get('/', requireAuth, requireRole('administrator'), getAllSubscriptions)

// Trip creator or Admin: view subscriptions for a specific trip
router.get('/subscriptionByTrip/:tripId', requireAuth, getTripSubscriptions)

module.exports = router

