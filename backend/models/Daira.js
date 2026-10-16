const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DairaSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  nameFr: {
    type: String,
  },
  nameAr: {
    type: String,
  },
  wilayaId: {
    type: Schema.Types.ObjectId,
    ref: 'Wilaya',
    default: null
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Daira', DairaSchema)