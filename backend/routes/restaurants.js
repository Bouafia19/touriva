const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getRestaurants,
    getRestaurant,
    createRestaurant,
    deleteRestaurant,
    updateRestaurant,
    importRestaurants,
    getLocalRestaurant } = require('../controllers/restaurantsController')

// require auth for all routes
// router.use(requireAuth)

// GET all restaurants
router.get('/', getRestaurants)

// GET a single Restaurant
router.get('/:id', getRestaurant)
  
// POST a new Restaurant
router.post('/', createRestaurant)

//
router.post('/localRestaurants', getLocalRestaurant)

// DELETE a Restaurant
router.delete('/:id', deleteRestaurant)

// UPDATE a Restaurant
router.patch('/:id', updateRestaurant)

router.post('/import', importRestaurants)


module.exports = router