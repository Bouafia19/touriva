const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getWilayas,
    getWilaya,
    createWilaya,
    deleteWilaya,
    updateWilaya,
    createMultWilaya,
    deleteMultWilaya } = require('../controllers/wilayasController')

// require auth for all routes
// router.use(requireAuth)

// GET all wilayas
router.get('/', getWilayas)

// GET a single Wilaya
router.get('/:id', getWilaya)
  
// POST a new Wilaya
router.post('/', createWilaya)

// POST a new Wilaya
router.post('/multi', createMultWilaya)

// DELETE a Wilaya
router.delete('/:id', deleteWilaya)

// DELETE a Wilaya
router.post('/delete', deleteMultWilaya)

// UPDATE a Wilaya
router.patch('/:id', updateWilaya)


module.exports = router