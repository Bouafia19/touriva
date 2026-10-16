const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    sendToTopics,
    sendToTokens,
    sendToToken,
    subscribe } = require('../controllers/notificationsController')

// require auth for all routes
router.use(requireAuth)

// topics
router.post('/topics', sendToTopics)

// Multiple tokens
router.post('/tokens', sendToTokens)
  
// One token
router.post('/token', sendToToken)

// Subscribe
router.post('/token', subscribe)

module.exports = router