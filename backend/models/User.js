const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema 

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  language: {
    type: String,
    default: 'fr'
  },
  password: {
    type: String,
    select: false
  },
  phone: {
    type: String,
    unique: true
  },
  role: {
    type: String, 
    enum: ['administrator', 'client', 'partner']
  },
  typeAccount: {
    type: String, 
    default: 'others',
    enum: ['touristGuide', 'associations', 'touristAgencies', 'visitor', 'others']
  },
  activated: {
    type: Boolean,
    default: true
  },
  nis: {
    type: String,
  },
  nif: {
    type: String,
  },
  rc: {
    type: String,
  },
  art: {
    type: String,
  },
  companyName: {
    type: String,
  },
  wilayaId: {
    type: Schema.Types.ObjectId,
    ref: 'Wilaya',
    default: null
  },
  dairaId: {
    type: Schema.Types.ObjectId,
    ref: 'Daira',
    default: null
  },
  communeId: {
    type: Schema.Types.ObjectId,
    ref: 'Commune',
    default: null
  },
  grayCard: {
    type: String
  },
  commercialRegister: {
    type: String
  },
  transportCard: {
    type: String
  },
  trafficPermit: {
    type: String
  },
  id: {
    type: String
  },
  nifDoc: {
    type: String
  },
  nisDoc: {
    type: String
  },
  presidentId: {  
    type: String
  },
  diploma: {
    type: String
  },
  accreditation: {
    type: String
  },
  justification: {
    type: String
  },
  complete: {
    type: Boolean
  },
  avatar: {
    type: String
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  // fcmToken: {
  //   type: String
  // },
  // lastLatLng: {
  //   lat: {
  //     type: Number
  //   },
  //   lng: {
  //     type: Number
  //   }
  // },
  // codePartenaire: {
  //   type: String
  // },
  // code: {
  //   type: String
  // },
  status: {
    type: Boolean
  },
  authorizationIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  fileStatus: {
    type: String, 
    enum: ['created', 'pending', 'confirmed']
  },
  expirationOfSubscription: {
    type: Date,
    default: Date.now
  },
  sectorActivity: {
    type: String, 
    enum: ['BTPH', 'Agricole', 'Industriel', 'Autre'],
    default: 'Autre'
  },
  guideType: {
    type: String, 
    enum: ['accompanist', 'nationalGuide', 'localGuide', 'none'],
    default: 'none'
  },
  associationTypeActivity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  },
  hasLicense: {
    type: Boolean,
    default: false
  },
  resetOtp: {
    type: String,
    select: false
  },
  resetOtpExpires: {
    type: Date,
    select: false
  }
},
{
  timestamps: true
})

// static signup method
UserSchema.statics.signup = async function( 
                                  email, 
                                  firstName, 
                                  lastName, 
                                  phone, 
                                  password, 
                                  role, 
                                  // fcmToken, 
                                  // codePartenaire, 
                                  // code, 
                                  activated,
                                  complete,
                                  status,
                                  fileStatus,
                                  rc,
                                  nis,
                                  nif,
                                  art,
                                  wilayaId,
                                  dairaId,
                                  communeId,
                                  typeAccount,
                                  companyName,
                                  sectorActivity,
                                  guideType,
                                  associationTypeActivity,
                                  hasLicense
                                ) {

  // validation
  if(!email || !password){
    throw Error('All field must be filled')
  }
  if(!validator.isEmail(email)){
    throw Error('email is not valid')
  }
  // if(!validator.isStrongPassword(password)){
  //   throw Error('password not strong enough')
  // }
  
  const exists = await this.findOne({ email, role })
  
  if(exists){
    throw Error('EMAIL_ALREADY_IN_USE')
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)


  const user = await this.create({ 
    email, 
    firstName, 
    lastName, 
    phone, 
    password: hash, 
    role, 
    // fcmToken, 
    // codePartenaire, 
    // code, 
    activated,
    complete,
    status,
    fileStatus,
    rc,
    nis,
    nif,
    art,
    wilayaId,
    dairaId,
    communeId,
    typeAccount,
    companyName,
    sectorActivity,
    guideType,
    associationTypeActivity,
    hasLicense
  })

  return user
}

// Helper to generate phone number variants for Algerian formats
const normalizePhoneVariants = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') return []
  const cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '')
  const variants = new Set([rawPhone, cleaned])

  let digits = cleaned
  if (digits.startsWith('+213')) {
    digits = digits.slice(4)
  } else if (digits.startsWith('00213')) {
    digits = digits.slice(5)
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  if (/^[567]\d{8}$/.test(digits) || /^\d{8,10}$/.test(digits)) {
    variants.add(`+213${digits}`)
    variants.add(`+2130${digits}`)
    variants.add(`00213${digits}`)
    variants.add(`0${digits}`)
    variants.add(digits)
  }
  return Array.from(variants)
}

// static loginPhone method
UserSchema.statics.loginPhone = async function( phone, password, role) {
  if(!phone || !password){
    throw Error('All field must be filled')
  }

  const phoneVariants = normalizePhoneVariants(phone)
  let user = null

  // 1. If role is explicitly provided, check that role first
  if (role) {
    user = await this.findOne({
      phone: { $in: phoneVariants },
      role: role,
      $or: [{ activated: true }, { activated: { $exists: false } }]
    }).select('+password').populate("authorizationIds")
  }

  // 2. If not found under the specified role (or role omitted), check across all active accounts
  if (!user) {
    user = await this.findOne({
      phone: { $in: phoneVariants },
      $or: [{ activated: true }, { activated: { $exists: false } }]
    }).select('+password').populate("authorizationIds")
  }

  if(!user){
    throw Error('ip')
  }

  const match = await bcrypt.compare(password, user.password)
  if(!match){
    throw Error('ipass')
  }

  return user
}

// static loginEmail method
UserSchema.statics.loginEmail = async function( email, password, role ) {
  if(!email || !password){
    throw Error('All field must be filled')
  }
  const cleanEmail = email.toLowerCase().trim()
  let user = null

  if (role) {
    user = await this.findOne({
      email: cleanEmail,
      role: role,
      $or: [{ activated: true }, { activated: { $exists: false } }]
    }).select('+password').populate("authorizationIds")
  }

  if (!user) {
    user = await this.findOne({
      email: cleanEmail,
      $or: [{ activated: true }, { activated: { $exists: false } }]
    }).select('+password').populate("authorizationIds")
  }

  if(!user){
    throw Error('ie')
  }
  
  const match = await bcrypt.compare(password, user.password) 
  if(!match){
    throw Error('ipass')
  }
  return user
}

// static loginPhoneWeb method
UserSchema.statics.loginPhoneWeb = async function( phone, role ) {
  if(!phone){
    throw Error('Phone field must be filled')
  }

  const phoneVariants = normalizePhoneVariants(phone)
  let user = null
  if (role) {
    user = await this.findOne({ phone: { $in: phoneVariants }, role })
  }
  if (!user) {
    user = await this.findOne({ phone: { $in: phoneVariants } })
  }

  return user
}

// static signup web method
UserSchema.statics.signupWeb = async function( phone, role, email, firstName, lastName, activated ) {

  // validation
  if(!phone){
    throw Error('Phone field must be filled')
  }
 
  const user = await this.create({ phone, role, email, firstName, lastName, activated })

  return user
}

module.exports = mongoose.model('User', UserSchema)