const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = async (req, res, next) => {
    // verify authentication
    const { authorization } = req.headers
    
    if(!authorization || !authorization.startsWith('Bearer ')){
        return res.status(401).json({error: 'Authorization token required'})
    }

    const token = authorization.split(' ')[1]
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        return res.status(401).json({error: 'Authorization token required'})
    }

    try {
        const {_id} = jwt.verify(token, process.env.SECRET)
        const user = await User.findOne({ _id }).select('_id role email')
        if (!user) {
            return res.status(401).json({error: 'request is not authorized'})
        }
        req.user = user
        next()
        
    } catch (error) {
        res.status(401).json({error: 'request is not authorized'})
    }
}

module.exports = requireAuth