const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getRoles,
    getRole,
    createRole,
    deleteRole,
    updateRole } = require('../controllers/rolesController')


// GET all roles
router.get('/', getRoles)

// require auth for all routes
router.use(requireAuth)

// GET a single role
router.get('/:id', getRole)
  
// POST a new role
router.post('/', createRole)

// DELETE a role
router.delete('/:id', deleteRole)

// UPDATE a role
router.patch('/:id', updateRole)


module.exports = router