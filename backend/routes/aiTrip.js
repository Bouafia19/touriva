const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

const { 
    createTripWithAI } = require('../controllers/aiTripController')

// Protected AI trip generation
router.post('/generate', requireAuth, createTripWithAI)

module.exports = router

