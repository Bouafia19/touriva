const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getInboxes,
    getInbox,
    createInbox,
    deleteInbox,
    updateInbox } = require('../controllers/inboxesController')

// Public contact inquiry submission
router.post('/', createInbox)

// Require administrator role to read and manage support inboxes
router.use(requireAuth, requireRole('administrator'))

// GET all inboxes
router.get('/', getInboxes)

// GET a single Inbox
router.get('/:id', getInbox)

// DELETE an Inbox
router.delete('/:id', deleteInbox)

// UPDATE an Inbox
router.patch('/:id', updateInbox)

module.exports = router
