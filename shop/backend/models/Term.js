const mongoose = require('mongoose')

const TermSchema = new mongoose.Schema({
  order: {
    type: String,
  },
  title: {
    type: String,
  },
  text: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Term', TermSchema)