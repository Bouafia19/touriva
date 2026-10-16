const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getBrands,
    getBrand,
    createBrand,
    deleteBrand,
    updateBrand } = require('../controllers/brandsController')

// require auth for all routes
// router.use(requireAuth)

// GET all brands
router.get('/', getBrands)

// GET a single Brand
router.get('/:id', getBrand)
  
// POST a new Brand
router.post('/', createBrand)

// DELETE a Brand
router.delete('/:id', deleteBrand)

// UPDATE a Brand
router.patch('/:id', updateBrand)


module.exports = router