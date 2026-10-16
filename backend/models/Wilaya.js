const mongoose = require('mongoose')

const WilayaSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  nameFr: {
    type: String,
  },
  nameAr: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Wilaya', WilayaSchema)