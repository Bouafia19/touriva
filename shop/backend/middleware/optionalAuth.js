const jwt = require('jsonwebtoken')
const User = require('../models/User')

const optionalAuth = async (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization || !authorization.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authorization.split(' ')[1]
  if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
    req.user = null
    return next()
  }

  try {
    const { _id } = jwt.verify(token, process.env.SECRET)
    const user = await User.findOne({ _id }).select('_id role email firstName lastName phone')
    req.user = user || null
    next()
  } catch (err) {
    req.user = null
    next()
  }
}

module.exports = optionalAuth
