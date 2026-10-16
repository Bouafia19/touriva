const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

const { 
    getTrips,
    getTripById,
    createTrip,
    updateTrip,
    getTripsByUser,
    deleteTrip } = require('../controllers/tripsController')

router.get('/', getTrips)
router.get('/:id', getTripById)
router.post('/', createTrip)
router.put('/:id', updateTrip)
router.get('/user/:userId', getTripsByUser)
router.delete('/:id', deleteTrip)

module.exports = router
