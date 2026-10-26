require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

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
const productRouters = require('./routes/products')
const categoriesProductsRouters = require('./routes/categoriesProducts')
const orderRouters = require('./routes/orders')

// express app
const app = express()

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
    if (!origin) {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin)
    }
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Body parser - Hardened against payload exhaustion DoS
const defaultBodyLimit = '2mb'
const uploadBodyLimit = '15mb'

const uploadRoutes = [
  '/api/users/uploadPartnerImages',
  '/api/products',
  '/api/advertising',
  '/api/announcements'
]

uploadRoutes.forEach(route => {
  app.use(route, express.json({ limit: uploadBodyLimit }))
  app.use(route, express.urlencoded({ extended: true, limit: uploadBodyLimit }))
})

app.use(express.json({ limit: defaultBodyLimit }))
app.use(express.urlencoded({ extended: true, limit: defaultBodyLimit }))


// health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'touriva-shop-backend', timestamp: new Date().toISOString() })
})

// routes
app.use('/api/users', userRouters)
app.use('/api/categories', categoryRouters)
app.use('/api/publications', publicationRouters)
// app.use('/api/notifications', notificationRouters)
app.use('/api/terms', termRouters)
app.use('/api/announcements', announcementRouters)
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
app.use('/api/products', productRouters)
app.use('/api/catprod', categoriesProductsRouters)
app.use('/api/orders', orderRouters)

// connect to db
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        if (process.env.NODE_ENV !== 'test') {
            console.log('connected to database')
            // listen to port
            app.listen(process.env.PORT, () => {
                console.log('listening for requests on port', process.env.PORT)
            })
        }
    })
    .catch((err) => {
        console.error('Database connection error:', err)
    })

module.exports = app 