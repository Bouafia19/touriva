const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')
const requireAgencyVerified = require('../middleware/requireAgencyVerified')

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
    loadPartnerPhotos,
    verifyOTP,
    checkOTP,
    demoLogin
 } = require('../controllers/usersController')

// demo login route (customer and agency only; admin explicitly prohibited)
router.post('/demo-login', demoLogin)

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

// verify OTP route
router.post('/verifyOTP', verifyOTP)

// check OTP route
router.post('/checkOTP', checkOTP)

// require auth for all subsequent routes
router.use(requireAuth)

// update existing user (AUTH REQUIRED: Self or Admin)
router.patch('/update_existing_user/:id', update_existing_user)

// GET all users (ADMIN ONLY)
router.get('/', getUsers)

// GET agency verification status (ADMIN or VERIFIED AGENCY PARTNER)
router.get('/agency/status', requireAgencyVerified, (req, res) => {
    res.status(200).json({
        verified: true,
        agencyId: req.user._id,
        role: req.user.role,
        typeAccount: req.user.typeAccount,
        fileStatus: req.user.fileStatus
    })
})

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