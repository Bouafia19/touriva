const mongoose = require('mongoose')
const crypto = require('crypto')

/**
 * Status history audit trail sub-schema for payments
 */
const paymentStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'verified', 'rejected', 'cancelled']
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false })

/**
 * Proof document metadata sub-schema
 * Stores file properties on disk outside MongoDB document to prevent BSON bloat
 */
const proofDocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    trim: true,
    default: null
  },
  originalName: {
    type: String,
    trim: true,
    default: null
  },
  mimeType: {
    type: String,
    trim: true,
    default: null
  },
  sizeBytes: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: null
  }
}, { _id: false })

/**
 * TripPayment Schema
 * Authoritative credit ledger for traveler booking payments and agency receipts.
 */
const tripPaymentSchema = new mongoose.Schema({
  paymentReference: {
    type: String,
    unique: true,
    index: true,
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripBooking',
    required: [true, 'Associated booking is required'],
    index: true
  },
  departure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripDeparture',
    required: [true, 'Associated departure session is required'],
    index: true
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owning agency is required'],
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  amountDZD: {
    type: Number,
    required: [true, 'Payment amount in DZD is required'],
    min: [1, 'Payment amount must be at least 1 DZD'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} DZD is not an integer. Touriva uses whole Dinar currency values.'
    }
  },
  currency: {
    type: String,
    default: 'DZD',
    enum: ['DZD'],
    immutable: true
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'ccp', 'baridimob', 'bank_transfer', 'gateway_cib', 'other'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'verified', 'rejected', 'cancelled'],
    default: 'submitted',
    index: true
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  proofDocument: {
    type: proofDocumentSchema,
    default: () => ({})
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor who recorded this payment is required']
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: ''
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  customerNote: {
    type: String,
    trim: true,
    default: ''
  },
  agencyInternalNote: {
    type: String,
    trim: true,
    default: ''
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true,
    trim: true
  },
  statusHistory: {
    type: [paymentStatusHistorySchema],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Auto-generate human-readable unique payment reference before saving
tripPaymentSchema.pre('validate', function(next) {
  if (!this.paymentReference) {
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
    this.paymentReference = `TRV-PAY-${randomSuffix}`
  }
  next()
})

// Compound indexes for optimal multi-tenant querying and report filtering
tripPaymentSchema.index({ agency: 1, status: 1, paymentDate: -1 })
tripPaymentSchema.index({ booking: 1, status: 1 })
tripPaymentSchema.index({ customer: 1, status: 1 })
tripPaymentSchema.index({ departure: 1, status: 1 })

module.exports = mongoose.model('TripPayment', tripPaymentSchema)
