const mongoose = require('mongoose')

const AnnouncementSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    price: {
        type: String,
    },
    description: {
        type: String,
    },
    img: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    brandId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    features: [],
    thumbnails: [],
    expirationOfSubscription: {
        type: Date
    },
    published: {
        type: Boolean,
        default: false
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan'
    },
    paid: {
        type: Boolean,
        default: false
    },
},
{
    timestamps: true
})

module.exports = mongoose.model('Announcement', AnnouncementSchema)