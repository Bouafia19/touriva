const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getPlans,
    getPlan,
    createPlan,
    deletePlan,
    updatePlan } = require('../controllers/plansController')

// Public routes
router.get('/', getPlans)
router.get('/:id', getPlan)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createPlan)
router.delete('/:id', requireAuth, requireRole('administrator'), deletePlan)
router.patch('/:id', requireAuth, requireRole('administrator'), updatePlan)

module.exports = router
