const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getDairas,
    getDaira,
    createDaira,
    deleteDaira,
    updateDaira } = require('../controllers/dairasController')

// Public routes
router.get('/', getDairas)
router.get('/:id', getDaira)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createDaira)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteDaira)
router.patch('/:id', requireAuth, requireRole('administrator'), updateDaira)

module.exports = router
