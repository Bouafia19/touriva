const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PublicationSchema = new mongoose.Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0
  },
  photo: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Publication', PublicationSchema)