/**
 * In-memory token bucket rate limiter for public and auth endpoints
 */
const rateLimits = new Map()

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000 // 15 minutes
  const maxRequests = options.max || 100
  const message = options.message || { error: 'Too many requests from this IP, please try again later.' }

  return (req, res, next) => {
    // Skip in test environment if needed
    if (process.env.NODE_ENV === 'test') {
      return next()
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    const record = rateLimits.get(ip)

    if (!record || now - record.startTime > windowMs) {
      rateLimits.set(ip, { count: 1, startTime: now })
      return next()
    }

    record.count += 1
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((windowMs - (now - record.startTime)) / 1000))
      return res.status(429).json(message)
    }

    return next()
  }
}

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimits.entries()) {
    if (now - record.startTime > 15 * 60 * 1000) {
      rateLimits.delete(ip)
    }
  }
}, 10 * 60 * 1000).unref()

module.exports = {
  apiLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }),
  authLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many authentication attempts, please try again in 15 minutes.' } }),
  demoLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 60, message: { error: 'Too many demo authentication attempts, please try again later.' } }),
  checkoutLimiter: createRateLimiter({ windowMs: 10 * 60 * 1000, max: 30, message: { error: 'Too many checkout requests, please try again later.' } })
}
