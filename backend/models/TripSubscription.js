const mongoose = require('mongoose')

const TripSubscriptionSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('TripSubscription', TripSubscriptionSchema)
