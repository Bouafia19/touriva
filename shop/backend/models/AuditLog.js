const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuditLogSchema = new mongoose.Schema({
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actorRole: {
    type: String,
    default: 'system'
  },
  action: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  entityId: {
    type: String,
    default: ''
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: ''
  },
  isDemo: {
    type: Boolean,
    default: false
  },
  seedId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('AuditLog', AuditLogSchema)
