const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SellerProfileSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  storeSlug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  wilaya: {
    type: String,
    required: true
  },
  city: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspensionReason: {
    type: String,
    default: ''
  },
  commissionRateOverride: {
    type: Number,
    default: null // null means use global marketplace default
  },
  totalSalesCount: {
    type: Number,
    default: 0
  },
  totalRevenueDZD: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  seedId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('SellerProfile', SellerProfileSchema)
