const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },
    amount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled']
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Order', OrderSchema)