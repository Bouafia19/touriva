const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getCommunes,
    getCommune,
    createCommune,
    deleteCommune,
    updateCommune } = require('../controllers/communesController')

// Public routes
router.get('/', getCommunes)
router.get('/:id', getCommune)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createCommune)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteCommune)
router.patch('/:id', requireAuth, requireRole('administrator'), updateCommune)

module.exports = router
