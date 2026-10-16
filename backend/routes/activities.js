const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getActivities,
    getActivity,
    createActivity,
    deleteActivity,
    updateActivity } = require('../controllers/activitiesController')

// require auth for all routes
// router.use(requireAuth)

// GET all activities
router.get('/', getActivities)

// GET a single Activity
router.get('/:id', getActivity)
  
// POST a new Activity
router.post('/', createActivity)

// DELETE a Activity
router.delete('/:id', deleteActivity)

// UPDATE a Activity
router.patch('/:id', updateActivity)


module.exports = router