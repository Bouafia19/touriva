const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getTerms,
    getTerm,
    createTerm,
    deleteTerm,
    updateTerm } = require('../controllers/termsController')


// GET all terms
router.get('/', getTerms)

// require auth for all routes
router.use(requireAuth)

// GET a single term
router.get('/:id', getTerm)
  
// POST a new term
router.post('/', createTerm)

// DELETE a term
router.delete('/:id', deleteTerm)

// UPDATE a term
router.patch('/:id', updateTerm)


module.exports = router