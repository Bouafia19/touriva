const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommissionSchema = new mongoose.Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderItemId: {
    type: Schema.Types.ObjectId,
    ref: 'OrderItem',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grossAmountDZD: {
    type: Number,
    required: true
  },
  commissionRatePercent: {
    type: Number,
    required: true,
    default: 10
  },
  commissionAmountDZD: {
    type: Number,
    required: true
  },
  sellerPayoutDZD: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['accrued', 'paid_to_seller', 'refunded'],
    default: 'accrued'
  },
  paidAt: {
    type: Date,
    default: null
  },
  payoutReference: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Commission', CommissionSchema)
