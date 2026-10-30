const express = require('express')
const router = express.Router()

const {
  createEnquiry,
  getMyEnquiries,
  acceptQuotation,
  declineQuotation
} = require('../controllers/enquiriesController')

const requireAuth = require('../middleware/requireAuth')

// Optional auth helper
const optionalAuth = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next()
  }
  const token = authorization.split(' ')[1]
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    return next()
  }
  try {
    const jwt = require('jsonwebtoken')
    const User = require('../models/User')
    const { _id } = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id }).select('_id role email typeAccount fileStatus companyName phone firstName lastName')
    if (user) {
      req.user = user
    }
  } catch (e) {
    // Continue
  }
  next()
}

router.post('/', optionalAuth, createEnquiry)
router.get('/my', requireAuth, getMyEnquiries)
router.patch('/:id/accept', optionalAuth, acceptQuotation)
router.patch('/:id/decline', optionalAuth, declineQuotation)

module.exports = router
