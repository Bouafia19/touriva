const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TripDepartureSchema = new mongoose.Schema(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Associated trip package is required'],
      index: true
    },
    agency: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owning agency is required'],
      index: true
    },
    startDate: {
      type: Date,
      required: [true, 'Departure start date and time are required']
    },
    endDate: {
      type: Date,
      required: [true, 'Return end date and time are required']
    },
    priceDZD: {
      type: Number,
      required: [true, 'Departure price in DZD is required'],
      min: [0, 'Price in DZD must be non-negative']
    },
    capacity: {
      type: Number,
      required: [true, 'Total passenger capacity is required'],
      min: [1, 'Capacity must be at least 1 passenger']
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: [0, 'Booked seats cannot be negative']
    },
    minGroupSize: {
      type: Number,
      default: 1,
      min: [1, 'Minimum group size must be at least 1']
    },
    meetingPoint: {
      type: String,
      trim: true,
      default: ''
    },
    departureInstructions: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['scheduled', 'guaranteed', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true
    },
    cancellationReason: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Virtual field: remaining available seats
TripDepartureSchema.virtual('availableSeats').get(function () {
  const cap = typeof this.capacity === 'number' ? this.capacity : 0
  const booked = typeof this.bookedSeats === 'number' ? this.bookedSeats : 0
  return Math.max(0, cap - booked)
})

// Compound index for querying upcoming departures by trip or by agency
TripDepartureSchema.index({ trip: 1, startDate: 1 })
TripDepartureSchema.index({ agency: 1, startDate: 1 })

// Validation hook for chronological dates and capacity invariant
TripDepartureSchema.pre('validate', function () {
  if (this.startDate && this.endDate) {
    const start = new Date(this.startDate).getTime()
    const end = new Date(this.endDate).getTime()
    if (end < start) {
      this.invalidate('endDate', 'Return date (endDate) cannot be earlier than departure date (startDate)')
    }
  }
  if (this.capacity !== undefined && this.bookedSeats !== undefined) {
    if (this.capacity < this.bookedSeats) {
      this.invalidate('capacity', 'Total capacity cannot be reduced below already booked seats')
    }
  }
})

module.exports = mongoose.model('TripDeparture', TripDepartureSchema)
