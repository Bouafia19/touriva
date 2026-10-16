const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getPublications,
    getPublication,
    createPublication,
    deletePublication,
    confirmePublication,
    getOnePublication,
    updatePublication,
    getPublicationsByCategoryId,
    updateAnnulationOfPublication,
    getPublicationsByUserId,
    getPublicationsByCategoryIdNoImages } = require('../controllers/publicationsController')

// require auth for all routes
router.use(requireAuth)

// GET all publications
router.get('/', getPublications)

// GET a single publication
router.patch('/:id', getPublication)
  
// POST a new publication
router.post('/', createPublication)

// DELETE a publication
router.delete('/:id', deletePublication)

// POST a new publication
router.post('/confirmePublication', confirmePublication)

// GET a single publication
router.get('/getOnePublication/:id', getOnePublication)

// UPDATE a publication
router.patch('/updatePublication/:id', updatePublication)

// GET a publications by categoryId
router.get('/getPublicationsByCategoryId/:categoryId', getPublicationsByCategoryId)

// Update Annulation Of Publication
router.patch('/updateAnnulationOfPublication/:id', updateAnnulationOfPublication)

// GET a publications by categoryId
router.get('/getPublicationsByUserId/:id', getPublicationsByUserId)

module.exports = router