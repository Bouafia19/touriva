const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getAnnouncements,
    getAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnouncement,
    getAnnouncementsByCategory,
    getAnnouncementsById,
    getAnnouncementsByOwnerId,
    getAnnouncementsByCategoryNoImages } = require('../controllers/announcementsController')


// GET all announcements
router.get('/', getAnnouncements)

// require auth for all routes
// router.use(requireAuth)

// GET a single announcement
router.get('/:id', getAnnouncement)

// POST a new announcement
router.post('/', createAnnouncement)

// DELETE a announcement
router.delete('/:id', deleteAnnouncement)

// UPDATE a announcement
router.patch('/:id', updateAnnouncement)

// GET a announcements by user role
router.get('/getAnnouncementsByCategory/:categoryId', getAnnouncementsByCategory)

// UPDATE a announcement
router.patch('/:announcementId', getAnnouncementsById)

// GET a announcements by ownerId
router.get('/getAnnouncementsByOwnerId/:ownerId', getAnnouncementsByOwnerId)

// GET a publications by categoryId no images
router.get('/getAnnouncementsByCategoryNoImages/:categoryId', getAnnouncementsByCategoryNoImages)

module.exports = router