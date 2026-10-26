const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getTerms,
    getTerm,
    createTerm,
    deleteTerm,
    updateTerm } = require('../controllers/termsController')

// Public terms reading
router.get('/', getTerms)

// Require administrator role for terms management
router.use(requireAuth, requireRole('administrator'))

// GET a single term
router.get('/:id', getTerm)
  
// POST a new term
router.post('/', createTerm)

// DELETE a term
router.delete('/:id', deleteTerm)

// UPDATE a term
router.patch('/:id', updateTerm)

module.exports = router
