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
    name: { type: String },
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
    price: String,
    rating: { type: Number, default: 0 },
    days: [Number],
    items: [DaySchema],
    status: {
      type: String,
      default: 'created',
      enum: ['created', 'pending', 'published']
    },
    published: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Trip', TripSchema)
