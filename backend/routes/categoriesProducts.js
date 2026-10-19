const express = require('express')

const router = express.Router()

const { 
    getProductsByCategoryChilds
} = require('../controllers/categoriesProductsController')

router.post('/getProductsByCategoryChilds/:categoryId', getProductsByCategoryChilds)

module.exports = router