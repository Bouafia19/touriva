const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getHotels,
    getHotel,
    createHotel,
    deleteHotel,
    updateHotel,
    importHotels,
    getLocalHotels } = require('../controllers/hotelsController')

// require auth for all routes
// router.use(requireAuth)

// GET all hotels
router.get('/', getHotels)

// GET a single Hotel
router.get('/:id', getHotel)
  
// POST a new Hotel
router.post('/', createHotel)

//
router.post('/localHotels', getLocalHotels)

// DELETE a Hotel
router.delete('/:id', deleteHotel)

// UPDATE a Hotel
router.patch('/:id', updateHotel)

router.post('/import', importHotels)


module.exports = router