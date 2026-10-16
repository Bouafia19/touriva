const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommuneSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  nameFr: {
    type: String,
  },
  nameAr: {
    type: String,
  },
  dairaId: {
    type: Schema.Types.ObjectId,
    ref: 'Daira',
    default: null
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Commune', CommuneSchema)