const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

const { 
    subscribeToTrip,
    getAllSubscriptions,
    getTripSubscriptions } = require('../controllers/tripSubscriptionController')

// public
router.post('/', subscribeToTrip)

// admin
router.get('/', getAllSubscriptions)

router.get('/subscriptionByTrip/:tripId', getTripSubscriptions)


module.exports = router
