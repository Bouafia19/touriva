const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ProductSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  img: {
    type: String,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  brandId: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
    default: null
  },
  thumbnails: [],
  features: [],
  published: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Product', ProductSchema)