const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getAdvertisings,
    getAdvertising,
    createAdvertising,
    deleteAdvertising,
    updateAdvertising,
    getAdvertisingById,
    getAdvertisingByOwnerId } = require('../controllers/advertisingController')


// GET all advertising
router.get('/', getAdvertisings)

// require auth for all routes
// router.use(requireAuth)

// GET a single advertising
router.get('/:id', getAdvertising)

// POST a new advertising
router.post('/', createAdvertising)

// DELETE a advertising
router.delete('/:id', deleteAdvertising)

// UPDATE a advertising
router.patch('/:id', updateAdvertising)

// UPDATE a advertising
router.patch('/:advertisingId', getAdvertisingById)

// GET a advertising by ownerId
router.get('/getAdvertisingByOwnerId/:ownerId', getAdvertisingByOwnerId)


module.exports = router