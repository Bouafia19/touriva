const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

// controller functions
const { 
    getSites,
    getSite,
    createSite,
    deleteSite,
    updateSite,
    importSites,
    getLocalSite } = require('../controllers/sitesController')

// Public routes
// GET all sites
router.get('/', getSites)

// GET local sites near coordinates
router.post('/localSites', getLocalSite)

// GET a single Site
router.get('/:id', getSite)

// Protected administrator mutation routes
router.post('/', requireAuth, requireRole('administrator'), createSite)
router.delete('/:id', requireAuth, requireRole('administrator'), deleteSite)
router.patch('/:id', requireAuth, requireRole('administrator'), updateSite)
router.post('/import', requireAuth, requireRole('administrator'), importSites)

module.exports = router
