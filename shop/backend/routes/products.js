const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductsByCategory,
    getProductsByCategoryNoImages,
    getProductsNoImages } = require('../controllers/productsController')

// Public catalog routes
router.get('/', getProducts)
router.get('/:id', getProduct)
router.post('/noImages', getProductsNoImages)
router.get('/getProductsByCategory/:categoryId', getProductsByCategory)
router.get('/getProductsByCategoryNoImages/:categoryId', getProductsByCategoryNoImages)

// Protected partner (seller) & administrator mutation routes
router.post('/', requireAuth, requireRole('partner', 'administrator'), createProduct)
router.delete('/:id', requireAuth, requireRole('partner', 'administrator'), deleteProduct)
router.patch('/:id', requireAuth, requireRole('partner', 'administrator'), updateProduct)

module.exports = router
