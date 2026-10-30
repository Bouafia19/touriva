const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ItemSchema = new mongoose.Schema({
  title: String,
  time: String,
  description: String,
  lat: Number,
  lng: Number,
  image: String
})

const DaySchema = new mongoose.Schema({
  day: Number,
  items: [ItemSchema]
})

const TripSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    creator: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, 
      required: true
    },
    destination: { 
      type: Schema.Types.ObjectId,
      ref: 'Wilaya',
      default: null
    },
    image: String,
    photos: [{ type: String }],
    price: String,
    rating: { type: Number, default: 0 },
    durationDays: { type: Number, default: 1, min: 1 },
    theme: { type: String, default: 'Circuit & Découverte' },
    inclusions: [{ type: String, trim: true }],
    exclusions: [{ type: String, trim: true }],
    cancellationPolicy: { type: String, default: '' },
    meetingPoint: { type: String, default: '' },
    days: [Number],
    items: [DaySchema],
    status: {
      type: String,
      default: 'created',
      enum: ['created', 'pending', 'published', 'paused', 'archived']
    },
    published: {
      type: Boolean,
      default: false
    },
    requiresDeposit: {
      type: Boolean,
      default: false
    },
    depositType: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'percentage'
    },
    depositAmountDZD: {
      type: Number,
      default: 0,
      min: [0, 'Deposit amount cannot be negative']
    },
    depositPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Deposit percentage cannot be negative'],
      max: [100, 'Deposit percentage cannot exceed 100%']
    },
    paymentDueDaysBeforeDeparture: {
      type: Number,
      default: 2,
      min: [0, 'Payment due days cannot be negative']
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Trip', TripSchema)
