const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

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

// Public routes
router.get('/', getAnnouncements)
router.get('/:id', getAnnouncement)
router.get('/getAnnouncementsByCategory/:categoryId', getAnnouncementsByCategory)
router.get('/getAnnouncementsByCategoryNoImages/:categoryId', getAnnouncementsByCategoryNoImages)

// Protected partner & administrator mutation routes
router.post('/', requireAuth, requireRole('partner', 'administrator'), createAnnouncement)
router.delete('/:id', requireAuth, requireRole('partner', 'administrator'), deleteAnnouncement)
router.patch('/:id', requireAuth, requireRole('partner', 'administrator'), updateAnnouncement)
router.patch('/:announcementId', requireAuth, requireRole('partner', 'administrator'), getAnnouncementsById)
router.get('/getAnnouncementsByOwnerId/:ownerId', requireAuth, getAnnouncementsByOwnerId)

module.exports = router
