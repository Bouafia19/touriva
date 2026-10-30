const mongoose = require('mongoose')
const crypto = require('crypto')

/**
 * Passenger sub-schema
 * Collects necessary identity and logistics fields while avoiding collecting sensitive
 * government document numbers unless strictly necessary for specific regional permits.
 */
const passengerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Passenger full name is required'],
    trim: true
  },
  ageCategory: {
    type: String,
    enum: ['adult', 'child', 'infant'],
    default: 'adult'
  },
  specialNotes: {
    type: String,
    trim: true,
    default: ''
  },
  emergencyPhone: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: false })

/**
 * Status history audit trail sub-schema
 */
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed']
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
 * TripBooking Schema
 * Represents an authenticated or guest reservation for an agency excursion departure session.
 */
const tripBookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    unique: true,
    index: true,
    trim: true
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: [true, 'Associated trip package is required'],
    index: true
  },
  departure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TripDeparture',
    required: [true, 'Associated scheduled departure session is required'],
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
      required: [true, 'Customer contact phone is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    }
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [1, 'At least 1 seat must be requested'],
    default: 1
  },
  unitPriceDZD: {
    type: Number,
    required: [true, 'Unit price in DZD is required'],
    min: [0, 'Unit price cannot be negative']
  },
  totalPriceDZD: {
    type: Number,
    required: [true, 'Total price in DZD is required'],
    min: [0, 'Total price cannot be negative']
  },
  passengers: {
    type: [passengerSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
    default: 'pending',
    index: true
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: []
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  rejectedAt: {
    type: Date
  },
  idempotencyKey: {
    type: String,
    sparse: true,
    index: true,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true,
    default: ''
  },
  currency: {
    type: String,
    default: 'DZD',
    enum: ['DZD'],
    immutable: true
  },
  financialStatus: {
    type: String,
    enum: [
      'unpaid',
      'partially_paid',
      'paid',
      'refund_pending',
      'partially_refunded',
      'refunded',
      'cancelled_unpaid'
    ],
    default: 'unpaid',
    index: true
  },
  totalPaidDZD: {
    type: Number,
    default: 0,
    min: [0, 'Total paid cannot be negative']
  },
  totalRefundedDZD: {
    type: Number,
    default: 0,
    min: [0, 'Total refunded cannot be negative']
  },
  netPaidDZD: {
    type: Number,
    default: 0,
    min: [0, 'Net paid cannot be negative']
  },
  balanceDueDZD: {
    type: Number,
    default: function() {
      return this.totalPriceDZD || 0
    },
    min: [0, 'Balance due cannot be negative']
  },
  paymentDueDate: {
    type: Date,
    default: null
  },
  requiresDeposit: {
    type: Boolean,
    default: false
  },
  depositAmountDZD: {
    type: Number,
    default: 0,
    min: [0, 'Deposit amount cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Auto-generate human-readable unique booking reference before saving
tripBookingSchema.pre('validate', function(next) {
  if (!this.bookingReference) {
    const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase()
    this.bookingReference = `TRV-BKG-${randomSuffix}`
  }
  if (this.balanceDueDZD === undefined || this.balanceDueDZD === null) {
    this.balanceDueDZD = Math.max(0, (this.totalPriceDZD || 0) - (this.netPaidDZD || 0))
  }
  next()
})

// Compound indexes for optimal performance and query isolation
tripBookingSchema.index({ agency: 1, status: 1, createdAt: -1 })
tripBookingSchema.index({ agency: 1, financialStatus: 1, createdAt: -1 })
tripBookingSchema.index({ departure: 1, status: 1 })
tripBookingSchema.index({ customer: 1, createdAt: -1 })
tripBookingSchema.index({ 'customerInfo.phone': 1 })

module.exports = mongoose.model('TripBooking', tripBookingSchema)
