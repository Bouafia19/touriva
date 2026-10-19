const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

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

// require auth for all routes
// router.use(requireAuth)

// GET all products
router.get('/', getProducts)

// GET a single Product
router.get('/:id', getProduct)
  
// POST a new Product
router.post('/', createProduct)

// DELETE a Product
router.delete('/:id', deleteProduct)

// UPDATE a Product
router.patch('/:id', updateProduct)

router.post('/noImages', getProductsNoImages)

// GET a products by category
router.get('/getProductsByCategory/:categoryId', getProductsByCategory)

// GET a product by category no images
router.get('/getProductsByCategoryNoImages/:categoryId', getProductsByCategoryNoImages)

module.exports = router