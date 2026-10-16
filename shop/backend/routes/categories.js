const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    // getCategories,
    getCategory,
    createCategory,
    deleteCategory,
    updateCategory,
    nestedCategories,
    getCategoryByID,
    getCategoryNestedByParentID,
    getAllCategories,
    // getCategoriesNoImages,
    getCategoriesNoParent,
    getCategoriesNoParentNoImages,
    getCategoriesChild,
    getCategoriesChildNoImages } = require('../controllers/categoriesController')

// require auth for all routes
// router.use(requireAuth)

// new routes

// GET parent categories

router.post('/getChild', getCategoriesChild)

router.post('/getChild/noImages', getCategoriesChildNoImages)

router.post('/', getCategoriesNoParent)

router.post('/noImages', getCategoriesNoParentNoImages)



// GET all categories
router.get('/all', getAllCategories)

// GET all categories
// router.post('/', getCategories)

// router.post('/noImages', getCategoriesNoImages)

// GET a single category
router.get('/:id', getCategory)
  
// POST a new category
router.post('/add', createCategory)

// DELETE a category
router.delete('/:id', deleteCategory)

// UPDATE a category
router.patch('/:id', updateCategory)

// GET all categories
router.post('/nested', nestedCategories)

// 
router.post('/:categoryId', getCategoryByID)

// 
router.post('/nested/:parentId', getCategoryNestedByParentID)




module.exports = router