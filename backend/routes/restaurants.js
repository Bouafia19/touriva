const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getRestaurants,
    getRestaurant,
    createRestaurant,
    deleteRestaurant,
    updateRestaurant,
    importRestaurants,
    getLocalRestaurant } = require('../controllers/restaurantsController')

// Public routes
// GET all restaurants
router.get('/', getRestaurants)

// GET local restaurants near coordinates
router.post('/localRestaurants', getLocalRestaurant)

// GET a single Restaurant
router.get('/:id', getRestaurant)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createRestaurant)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteRestaurant)
router.patch('/:id', requireAuth, requireRole('administrator'), updateRestaurant)
router.post('/import', requireAuth, requireRole('administrator'), importRestaurants)

module.exports = router
