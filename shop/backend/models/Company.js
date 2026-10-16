const mongoose = require('mongoose')

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
  },
  city: {
    type: String,
  },
  street: {
    type: String,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
  },
  mobile: {
    type: String,
  },
  logo: {
    type: String,
  },
  appImage: {
    type: String,
  },
  statisticalIdentifierNumber: {
    type: String,
  },
  taxIdentifierNumber: {
    type: String,
  },
  commercialRegisterNumber: {
    type: String,
  },
  taxArticleNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  siteWeb: {
    type: String,
  },
  fax: {
    type: String,
  },
  bankAccountStatement:{
    type: String,
  },
  businessSector:{
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
})


module.exports = mongoose.model('Company', CompanySchema)