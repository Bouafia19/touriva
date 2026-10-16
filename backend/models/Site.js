const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SiteSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  rating: {
    type: Number,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  description: {
    type: String,
  },
  phone: {
    type: String,
  },
  photo: {
    type: String,
  },
  wilayaId: {
    type: Schema.Types.ObjectId,
    ref: 'Wilaya',
    default: null
  },
  dairaId: {
    type: Schema.Types.ObjectId,
    ref: 'Daira',
    default: null
  },
  communeId: {
    type: Schema.Types.ObjectId,
    ref: 'Commune',
    default: null
  },
  googleId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'published', 'rejected']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number] // [lng, lat]
    }
  }
},
{
  timestamps: true
})

SiteSchema.index({ location: "2dsphere" })

module.exports = mongoose.model('Site', SiteSchema)