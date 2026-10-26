const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getFormations,
    getFormation,
    createFormation,
    deleteFormation,
    updateFormation } = require('../controllers/formationsController')

// Public routes
router.get('/', getFormations)
router.get('/:id', getFormation)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createFormation)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteFormation)
router.patch('/:id', requireAuth, requireRole('administrator'), updateFormation)

module.exports = router
