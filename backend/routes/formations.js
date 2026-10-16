const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getFormations,
    getFormation,
    createFormation,
    deleteFormation,
    updateFormation } = require('../controllers/formationsController')

// require auth for all routes
// router.use(requireAuth)

// GET all formations
router.get('/', getFormations)

// GET a single Formation
router.get('/:id', getFormation)
  
// POST a new Formation
router.post('/', createFormation)

// DELETE a Formation
router.delete('/:id', deleteFormation)

// UPDATE a Formation
router.patch('/:id', updateFormation)


module.exports = router