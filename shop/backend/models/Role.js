const mongoose = require('mongoose')

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    subject: {
        type: String,
    },
    actions: {
        read: {
            type: Boolean,
        },    
        create: {
            type: Boolean,
        },
        update: {
            type: Boolean,    
        },
        delete: {
            type: Boolean,
        }
    }
  
},
{
  timestamps: true
})

module.exports = mongoose.model('Role', RoleSchema)