const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillingSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    photo: {
        type: String,
    },
    billingMethod: {
        type: String,
    },
    amount: {
        type: Number
    },
    date: {
        type: Date
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed']
    },
    brutAmount: {
        type: Number
    },
    period: {
        type: Number
    },
    planId: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        default: null
    },
    pubId: {
        type: Schema.Types.ObjectId,
        ref: 'Announcement',
        default: null
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Billing', BillingSchema)