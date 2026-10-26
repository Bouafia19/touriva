const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getCompany,
    createCompany,
    updateCompany,
    getAppImage } = require('../controllers/companyController')
    
// Public endpoint
router.get('/getAppImage', getAppImage)

// Require administrator role for all management routes
router.use(requireAuth, requireRole('administrator'))

// GET a single company
router.get('/', getCompany)

// POST a new company
router.post('/', createCompany)

// UPDATE a company
router.patch('/:id', updateCompany)

module.exports = router
