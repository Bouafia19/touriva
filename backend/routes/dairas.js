const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getDairas,
    getDaira,
    createDaira,
    deleteDaira,
    updateDaira } = require('../controllers/dairasController')

// require auth for all routes
// router.use(requireAuth)

// GET all dairas
router.get('/', getDairas)

// GET a single Daira
router.get('/:id', getDaira)
  
// POST a new Daira
router.post('/', createDaira)

// DELETE a Daira
router.delete('/:id', deleteDaira)

// UPDATE a Daira
router.patch('/:id', updateDaira)


module.exports = router