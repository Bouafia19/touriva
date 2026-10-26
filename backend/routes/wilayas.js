const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getWilayas,
    getWilaya,
    createWilaya,
    deleteWilaya,
    updateWilaya,
    createMultWilaya,
    deleteMultWilaya } = require('../controllers/wilayasController')

// Public routes
router.get('/', getWilayas)
router.get('/:id', getWilaya)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createWilaya)
router.post('/multi', requireAuth, requireRole('administrator'), createMultWilaya)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteWilaya)
router.post('/delete', requireAuth, requireRole('administrator'), deleteMultWilaya)
router.patch('/:id', requireAuth, requireRole('administrator'), updateWilaya)

module.exports = router
