const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getPartners,
    getPartner,
    createPartner,
    deletePartner,
    updatePartner } = require('../controllers/partnersController')

// require auth for all routes
// router.use(requireAuth)

// GET all partners
router.get('/', getPartners)

// GET a single Partner
router.get('/:id', getPartner)
  
// POST a new Partner
router.post('/', createPartner)

// DELETE a Partner
router.delete('/:id', deletePartner)

// UPDATE a Partner
router.patch('/:id', updatePartner)


module.exports = router