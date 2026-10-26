const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getActivities,
    getActivity,
    createActivity,
    deleteActivity,
    updateActivity } = require('../controllers/activitiesController')

// Public routes
// GET all activities
router.get('/', getActivities)

// GET a single Activity
router.get('/:id', getActivity)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createActivity)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteActivity)
router.patch('/:id', requireAuth, requireRole('administrator'), updateActivity)

module.exports = router
