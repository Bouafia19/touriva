const mongoose = require('mongoose')

const AdsSettingsSchema = new mongoose.Schema({
  unitPrice: {
    type: Number,
    default: 0
  },
  interval: {
    type: Number,
    default: 0
  }
}, 
{
  timestamps: true
})

module.exports = mongoose.model('AdsSettings', AdsSettingsSchema)