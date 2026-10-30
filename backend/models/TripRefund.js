const mongoose = require('mongoose')
const crypto = require('crypto')

/**
 * Status history audit trail sub-schema for refunds
 */
const refundStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['requested', 'approved', 'completed', 'rejected']
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
 * TripRefund Schema
 * Authoritative debit ledger for traveler refunds and cancellations.
 */
const tripRefundSchema = new mongoose.Schema({
  refundReference: {
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
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripPayment',
    default: null
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
    required: [true, 'Refund amount in DZD is required'],
    min: [1, 'Refund amount must be at least 1 DZD'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} DZD is not an integer. Touriva uses whole Dinar currency values.'
    }
  },
  cancellationFeeDZD: {
    type: Number,
    default: 0,
    min: [0, 'Cancellation fee cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} DZD is not an integer.'
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
    required: [true, 'Refund disbursement method is required'],
    enum: ['cash', 'ccp', 'baridimob', 'bank_transfer', 'other']
  },
  status: {
    type: String,
    required: true,
    enum: ['requested', 'approved', 'completed', 'rejected'],
    default: 'requested',
    index: true
  },
  reason: {
    type: String,
    required: [true, 'Refund reason is mandatory'],
    trim: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Actor who initiated refund request is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  transactionReference: {
    type: String,
    trim: true,
    default: ''
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: ''
  },
  customerNotificationNote: {
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
    type: [refundStatusHistorySchema],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Auto-generate human-readable unique refund reference before saving
tripRefundSchema.pre('validate', function(next) {
  if (!this.refundReference) {
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
    this.refundReference = `TRV-RFD-${randomSuffix}`
  }
  next()
})

// Compound indexes
tripRefundSchema.index({ agency: 1, status: 1, createdAt: -1 })
tripRefundSchema.index({ booking: 1, status: 1 })
tripRefundSchema.index({ customer: 1, status: 1 })

module.exports = mongoose.model('TripRefund', tripRefundSchema)
