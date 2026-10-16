const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Activity', ActivitySchema)