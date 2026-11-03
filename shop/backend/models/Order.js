const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Legacy single-product reference (preserved for backward compatibility)
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  // Multi-vendor line items
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  customerInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    wilaya: { type: String, default: '' },
    city: { type: String, default: '' },
    shippingAddress: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  subtotalDZD: {
    type: Number,
    default: 0
  },
  deliveryFeeDZD: {
    type: Number,
    default: 600
  },
  totalAmountDZD: {
    type: Number,
    required: true,
    default: 0
  },
  // Legacy amount field (synced with totalAmountDZD)
  amount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['baridimob', 'cash_on_delivery', 'ccp'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending_verification', 'verified', 'failed'],
    default: 'pending_verification'
  },
  paymentProof: {
    transactionReference: { type: String, default: '' },
    receiptImageUrl: { type: String, default: '' },
    submittedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'processing', 'partially_fulfilled', 'completed', 'cancelled'],
    default: 'pending'
  },
  // Legacy status field (synced with overallStatus)
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
})

OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ overallStatus: 1 })

module.exports = mongoose.model('Order', OrderSchema)
