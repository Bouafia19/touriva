const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getCompany,
    createCompany,
    updateCompany,
    getAppImage } = require('../controllers/companyController')
    
// GET 
router.get('/getAppImage', getAppImage)

// require auth for all routes
router.use(requireAuth)

// GET a single company
router.get('/', getCompany)


// POST a new company
router.post('/', createCompany)

// UPDATE a company
router.patch('/:id', updateCompany)


module.exports = router