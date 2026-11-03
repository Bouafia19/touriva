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
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  img: {
    type: String,
    default: ''
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
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  stockQuantity: {
    type: Number,
    default: 10,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'suspended', 'archived'],
    default: 'approved' // Default to approved for legacy seed items
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  moderationNotes: {
    type: String,
    default: ''
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  thumbnails: [],
  features: [],
  published: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
})

// Index for fast text search and category filtering
ProductSchema.index({ name: 'text', description: 'text' })
ProductSchema.index({ categoryId: 1, status: 1, published: 1 })
ProductSchema.index({ sellerId: 1, status: 1 })

module.exports = mongoose.model('Product', ProductSchema)
