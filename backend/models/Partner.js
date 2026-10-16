const mongoose = require('mongoose')

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  nameFr: {
    type: String,
  },
  descriptionFr: {
    type: String,
  },
  nameAr: {
    type: String,
  },
  descriptionAr: {
    type: String,
  },
  photo: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Partner', PartnerSchema)