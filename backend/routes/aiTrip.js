const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

const { 
    createTripWithAI } = require('../controllers/aiTripController')

router.post('/generate', createTripWithAI)

module.exports = router
