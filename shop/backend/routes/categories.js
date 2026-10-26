const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getCategory,
    createCategory,
    deleteCategory,
    updateCategory,
    nestedCategories,
    getCategoryByID,
    getCategoryNestedByParentID,
    getAllCategories,
    getCategoriesNoParent,
    getCategoriesNoParentNoImages,
    getCategoriesChild,
    getCategoriesChildNoImages } = require('../controllers/categoriesController')

// Protected administrator mutation routes
router.post('/add', requireAuth, requireRole('administrator'), createCategory)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteCategory)
router.patch('/:id', requireAuth, requireRole('administrator'), updateCategory)

// Public catalog routes
router.post('/getChild', getCategoriesChild)
router.post('/getChild/noImages', getCategoriesChildNoImages)
router.post('/', getCategoriesNoParent)
router.post('/noImages', getCategoriesNoParentNoImages)
router.get('/all', getAllCategories)
router.get('/:id', getCategory)
router.post('/nested', nestedCategories)
router.post('/:categoryId', getCategoryByID)
router.post('/nested/:parentId', getCategoryNestedByParentID)

module.exports = router

