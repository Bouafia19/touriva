const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderItemSchema = new mongoose.Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productCode: {
    type: String,
    default: ''
  },
  productImage: {
    type: String,
    default: ''
  },
  unitPriceDZD: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalItemPriceDZD: {
    type: Number,
    required: true
  },
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingCarrier: {
    type: String,
    default: ''
  },
  trackingNumber: {
    type: String,
    default: ''
  },
  shippedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancellationReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('OrderItem', OrderItemSchema)
