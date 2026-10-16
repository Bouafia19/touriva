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

// middleware
app.use(cors({ origin: '*' }))

app.use(express.json({limit: '50mb'}))


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
        console.log('connected to database')
        // listen to port
        app.listen(process.env.PORT, () => {
            console.log('listening for requests on port', process.env.PORT)
        })
    })
    .catch((err) => {
        console.log(err)
    }) 