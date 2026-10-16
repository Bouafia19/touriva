const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getCommunes,
    getCommune,
    createCommune,
    deleteCommune,
    updateCommune } = require('../controllers/communesController')

// require auth for all routes
// router.use(requireAuth)

// GET all communes
router.get('/', getCommunes)

// GET a single Commune
router.get('/:id', getCommune)
  
// POST a new Commune
router.post('/', createCommune)

// DELETE a Commune
router.delete('/:id', deleteCommune)

// UPDATE a Commune
router.patch('/:id', updateCommune)


module.exports = router