const express = require('express')

const router = express.Router()

// const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getSites,
    getSite,
    createSite,
    deleteSite,
    updateSite,
    importSites,
    getLocalSite } = require('../controllers/sitesController')

// require auth for all routes
// router.use(requireAuth)

// GET all sites
router.get('/', getSites)

// GET a single Site
router.get('/:id', getSite)
  
// POST a new Site
router.post('/', createSite)

//
router.post('/localSites', getLocalSite)

// DELETE a Site
router.delete('/:id', deleteSite)

// UPDATE a Site
router.patch('/:id', updateSite)

router.post('/import', importSites)


module.exports = router