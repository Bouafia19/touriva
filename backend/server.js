require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

require("./cronJobs.js")

const userRouters = require('./routes/users')
const categoryRouters = require('./routes/categories')
const publicationRouters = require('./routes/publications')
// const notificationRouters = require('./routes/notifications')
const termRouters = require('./routes/terms')
const roleRouters = require('./routes/roles')
const announcementRouters = require('./routes/announcements')
const billingRouters = require('./routes/billings')
const companyRouters = require('./routes/company')
const wilayaRouters = require('./routes/wilayas')
const brandRouters = require('./routes/brands')
const planRouters = require('./routes/plans')
const partnerRouters = require('./routes/partners')
const dairaRouters = require('./routes/dairas')
const communeRouters = require('./routes/communes')
const formationRouters = require('./routes/formations')
const inboxRouters = require('./routes/inboxes')
const advertisingRouters = require('./routes/advertising')
const adsSettingsRouters = require('./routes/adsSettings')
const tripRouters = require('./routes/trips')
const hotelRouters = require('./routes/hotels')
const siteRouters = require('./routes/sites')
const restaurantRouters = require('./routes/restaurants')
const tripSubscriptionRouters = require('./routes/tripSubscriptions')
const aiTripRouters = require('./routes/aiTrip')
const activityRouters = require('./routes/activities')
const productRouters = require('./routes/products')
const categoriesProductsRouters = require('./routes/categoriesProducts')
const orderRouters = require('./routes/orders')
const agencyRouters = require('./routes/agency')
const bookingRouters = require('./routes/bookings')
const enquiryRouters = require('./routes/enquiries')
const financialRouters = require('./routes/financial')

// express app
const app = express()

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Request logging in development/production
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// CORS configuration - explicit production and development allowlist
const defaultAllowedOrigins = [
  'https://touriva-web.onrender.com',
  'https://touriva-admin.onrender.com',
  'https://touriva-shop-web.onrender.com',
  'https://touriva-shop-admin.onrender.com',
  'https://touriva-shop-seller-admin.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:2020',
  'http://localhost:2021',
  'http://localhost:2022',
  'http://localhost:2023',
  'http://localhost:2024',
  'http://localhost:3000',
  'capacitor://localhost',
  'http://localhost'
]

const envOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(o => o && o !== '*')
  : []

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]))

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) {
      return callback(null, true)
    }
    // Check against explicit allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin)
    }
    // Deny unauthorized origins without reflecting them or granting credentials
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parser - Hardened against payload exhaustion DoS
// Standard 2MB limit for general API routes; dedicated 15MB limit strictly for media/import routes
const defaultBodyLimit = '2mb'
const uploadBodyLimit = '15mb'

const uploadRoutes = [
  '/api/users/uploadPartnerImages',
  '/api/trips',
  '/api/agency/packages',
  '/api/products',
  '/api/advertising',
  '/api/announcements',
  '/api/sites/import',
  '/api/hotels/import',
  '/api/restaurants/import',
  '/api/bookings',
  '/api/agency'
]

uploadRoutes.forEach(route => {
  app.use(route, express.json({ limit: uploadBodyLimit }))
  app.use(route, express.urlencoded({ extended: true, limit: uploadBodyLimit }))
})

app.use(express.json({ limit: defaultBodyLimit }))
app.use(express.urlencoded({ extended: true, limit: defaultBodyLimit }))

// Rate limiting for public APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // generous max requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
})
app.use('/api/', apiLimiter)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Touriva Tourism API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Core API routes
app.use('/api/users', userRouters)
app.use('/api/categories', categoryRouters)
app.use('/api/publications', publicationRouters)
// app.use('/api/notifications', notificationRouters)
app.use('/api/announcements', announcementRouters)
app.use('/api/terms', termRouters)
app.use('/api/billings', billingRouters)
app.use('/api/company', companyRouters)
app.use('/api/roles', roleRouters)
app.use('/api/wilayas', wilayaRouters)
app.use('/api/brands', brandRouters)
app.use('/api/plans', planRouters)
app.use('/api/partners', partnerRouters)
app.use('/api/dairas', dairaRouters)
app.use('/api/communes', communeRouters)
app.use('/api/formations', formationRouters)
app.use('/api/inboxes', inboxRouters)
app.use('/api/advertising', advertisingRouters)
app.use('/api/adsSettings', adsSettingsRouters)
app.use('/api/trips', tripRouters)
app.use('/api/agency', agencyRouters)
app.use('/api/hotels', hotelRouters)
app.use('/api/sites', siteRouters)
app.use('/api/restaurants', restaurantRouters)
app.use('/api/tripSubscriptions', tripSubscriptionRouters)
app.use('/api/aiTrips', aiTripRouters)
app.use('/api/activities', activityRouters)
app.use('/api/products', productRouters)
app.use('/api/catprod', categoriesProductsRouters)
app.use('/api/orders', orderRouters)
app.use('/api/bookings', bookingRouters)
app.use('/api/enquiries', enquiryRouters)
app.use('/api/financial', financialRouters)

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl })
})

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  })
})

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/touriva'

// connect to db only when not required by test runner
if (process.env.NODE_ENV !== 'test') {
  mongoose.set('strictQuery', true)
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to Touriva database:', MONGO_URI)
      app.listen(PORT, () => {
        console.log(`Touriva API listening on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('Touriva database connection failure:', err)
    })
}

module.exports = app