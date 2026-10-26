const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getPartners,
    getPartner,
    createPartner,
    deletePartner,
    updatePartner } = require('../controllers/partnersController')

// Public routes
router.get('/', getPartners)
router.get('/:id', getPartner)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createPartner)
router.delete('/:id', requireAuth, requireRole('administrator'), deletePartner)
router.patch('/:id', requireAuth, requireRole('administrator'), updatePartner)

module.exports = router
