const mongoose = require('mongoose')

const InboxSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  }
},
{
  timestamps: true
})

module.exports = mongoose.model('Inbox', InboxSchema)