const mongoose = require('mongoose')

const MarketplaceSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'global_settings'
  },
  marketplaceName: {
    type: String,
    default: 'Touriva Marketplace'
  },
  tagline: {
    type: String,
    default: "Le Marché Central de l'Artisanat & du Terroir Algérien"
  },
  defaultCommissionPercent: {
    type: Number,
    default: 10
  },
  commissionModel: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  requireSellerApproval: {
    type: Boolean,
    default: true
  },
  requireProductModeration: {
    type: Boolean,
    default: true
  },
  supportedPaymentMethods: {
    type: [String],
    default: ['baridimob', 'cash_on_delivery', 'ccp']
  },
  contactEmail: {
    type: String,
    default: 'contact@market.touriva.nextchallenge.tech'
  },
  contactPhone: {
    type: String,
    default: '+213552569654'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('MarketplaceSettings', MarketplaceSettingsSchema)
