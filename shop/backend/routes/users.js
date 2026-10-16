const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    loginUser, 
    signupUser,
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    verifyCode,
    verifyPhone,
    verifyUser,
    update_existing_user,
    loginUserWeb,
    signupUserWeb,
    uploadPartnerImages,
    loadPartnerPhotos } = require('../controllers/usersController')

// login via web route
router.post('/loginWeb', loginUserWeb)

// signup via Web route
router.post('/signupUserWeb', signupUserWeb)

// login route
router.post('/login', loginUser)

// signup route
router.post('/signup', signupUser)

// verify code route
router.post('/verifyCode', verifyCode)

// verify phone route
router.post('/verifyPhone', verifyPhone)

// verify user
router.post('/verifyUser', verifyUser)

// update existing user
router.patch('/update_existing_user/:id', update_existing_user)

// require auth for all routes
router.use(requireAuth)

// GET all users
router.get('/', getUsers)

// GET a single user
router.get('/:id', getUser)
  
// POST a new user
router.post('/', createUser)

// DELETE a user
router.delete('/:id', deleteUser)

// UPDATE a user
router.patch('/:id', updateUser)

// upload partner images
router.patch('/uploadPartnerImages/:id', uploadPartnerImages)

// GET load Partner Photos
router.get('/loadPartnerPhotos/:id', loadPartnerPhotos)


module.exports = router