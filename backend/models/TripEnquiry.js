const mongoose = require('mongoose')
const crypto = require('crypto')

/**
 * Quotation Sub-Schema
 * Represents a formal, time-bound price and itinerary offer from an agency.
 */
const quotationSubSchema = new mongoose.Schema({
  quotedPriceDZD: {
    type: Number,
    min: [0, 'Quoted price cannot be negative']
  },
  itinerarySummary: {
    type: String,
    trim: true
  },
  inclusions: {
    type: [String],
    default: []
  },
  exclusions: {
    type: [String],
    default: []
  },
  cancellationPolicy: {
    type: String,
    trim: true
  },
  validUntil: {
    type: Date
  },
  agencyNotes: {
    type: String,
    trim: true
  },
  quotedAt: {
    type: Date
  },
  quotedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { _id: false })

/**
 * TripEnquiry Schema
 * Tailor-made excursion requests submitted by tourists to Algerian tourism agencies.
 */
const tripEnquirySchema = new mongoose.Schema({
  enquiryReference: {
    type: String,
    unique: true,
    index: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  customerInfo: {
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    }
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null
  },
  destination: {
    type: String,
    required: [true, 'Target destination or Wilaya is required'],
    trim: true
  },
  wilaya: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wilaya',
    default: null
  },
  startDate: {
    type: Date,
    required: [true, 'Desired start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Desired end date is required']
  },
  groupSize: {
    type: Number,
    required: [true, 'Group size is required'],
    min: [1, 'Group size must be at least 1'],
    default: 2
  },
  budgetDZD: {
    type: Number,
    min: [0, 'Budget must be non-negative'],
    default: null
  },
  theme: {
    type: String,
    trim: true,
    default: 'Circuit Sur Mesure'
  },
  preferences: {
    type: [String],
    default: []
  },
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['requested', 'quoted', 'accepted', 'declined', 'expired'],
    default: 'requested',
    index: true
  },
  quotation: {
    type: quotationSubSchema,
    default: null
  },
  declineReason: {
    type: String,
    trim: true
  },
  declinedAt: {
    type: Date
  },
  declinedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Auto-generate human-readable unique enquiry reference
tripEnquirySchema.pre('validate', function(next) {
  if (!this.enquiryReference) {
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
    this.enquiryReference = `TRV-ENQ-${randomSuffix}`
  }
  next()
})

// Compound indexes
tripEnquirySchema.index({ agency: 1, status: 1, createdAt: -1 })
tripEnquirySchema.index({ customer: 1, createdAt: -1 })
tripEnquirySchema.index({ 'customerInfo.phone': 1 })

module.exports = mongoose.model('TripEnquiry', tripEnquirySchema)
