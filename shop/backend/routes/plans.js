const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getPlans,
    getPlan,
    createPlan,
    deletePlan,
    updatePlan } = require('../controllers/plansController')

// require auth for all routes
// router.use(requireAuth)

// GET all plans
router.get('/', getPlans)

// GET a single Plan
router.get('/:id', getPlan)
  
// POST a new Plan
router.post('/', createPlan)

// DELETE a Plan
router.delete('/:id', deletePlan)

// UPDATE a Plan
router.patch('/:id', updatePlan)


module.exports = router