const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getRoles,
    getRole,
    createRole,
    deleteRole,
    updateRole } = require('../controllers/rolesController')

// require admin auth for all role configuration routes
router.use(requireAuth, requireRole('administrator'))

// GET all roles
router.get('/', getRoles)

// GET a single role
router.get('/:id', getRole)
  
// POST a new role
router.post('/', createRole)

// DELETE a role
router.delete('/:id', deleteRole)

// UPDATE a role
router.patch('/:id', updateRole)

module.exports = router
