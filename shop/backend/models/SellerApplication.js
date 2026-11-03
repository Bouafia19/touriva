const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SellerApplicationSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  legalRepresentativeName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  wilaya: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: true
  },
  businessCategory: {
    type: String,
    default: 'Artisanat & Terroir'
  },
  businessDescription: {
    type: String,
    required: true
  },
  rcNumber: {
    type: String,
    default: ''
  },
  nifNumber: {
    type: String,
    default: ''
  },
  idCardDocumentUrl: {
    type: String,
    default: ''
  },
  businessRegistrationDocUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
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

module.exports = mongoose.model('SellerApplication', SellerApplicationSchema)
