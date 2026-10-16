const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getInboxes,
    getInbox,
    createInbox,
    deleteInbox,
    updateInbox } = require('../controllers/inboxesController')

// require auth for all routes
// router.use(requireAuth)

// GET all inboxes
router.get('/', getInboxes)

// GET a single Inbox
router.get('/:id', getInbox)
  
// POST a new Inbox
router.post('/', createInbox)

// DELETE a Inbox
router.delete('/:id', deleteInbox)

// UPDATE a Inbox
router.patch('/:id', updateInbox)


module.exports = router