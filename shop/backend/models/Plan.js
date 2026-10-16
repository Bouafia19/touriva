const mongoose = require('mongoose')

const PlanSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  duration: {
    type: Number,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Plan', PlanSchema)