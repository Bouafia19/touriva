const mongoose = require('mongoose')

const FormationSchema = new mongoose.Schema({
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
    },
    price: {
        type: String,
    },
    duration: {
        type: String,
    },
    file: {
        type: String,
    }
},
{
  timestamps: true
})

module.exports = mongoose.model('Formation', FormationSchema)