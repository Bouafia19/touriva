const mongoose = require('mongoose')

const AdvertisingSchema = new mongoose.Schema({
    price: {
        type: String,
    },
    page: {
        type: String,
    },
    space: {
        type: String,
    },
    img: {
        type: String,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    link: {
        type: String,
    },
    duration: {
        type: Number,
        default: 0
    },
    payed: {
        type: Boolean,
        default: false
    },
    billingStatus: {
        type: String,
        enum: ['draft','pending', 'paid', 'cancelled', 'rejected'],
        default: 'draft'
    },
    billingImg: {
        type: String,
    },
    billingDate: {
        type: Date,
    },
    sector: {
        type: String,
        enum: ['BTPH', 'Agricole', 'Industriel', 'Autre'],
        default: 'Autre'
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Advertising', AdvertisingSchema)