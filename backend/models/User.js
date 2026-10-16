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
    type: String
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
    type: String
  },
  resetOtpExpires: {
    type: Date
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

// static loginPhone method
UserSchema.statics.loginPhone = async function( phone, password, role) {
  if(!phone || !password){
    throw Error('All field must be filled')
  }

  let phoneWith0
  if(phone.length === 14){
    phoneWith0 = phone.slice(0, 4) + phone.slice(5)
  }else if (phone.length === 13){
    phoneWith0 = phone.slice(0, 4) + '0' + phone.slice(4)
  }
  console.log('phoneWith0:', phoneWith0)
  console.log('phone:', phone)
  let user = null
  let user0 = null
  if(role === 'client'){
    user = await this.findOne({ phone: phone, role: 'client', activated: true })
    user0 = await this.findOne({ phone: phoneWith0, role: 'client', activated: true })
   
  }else if(role === 'partner'){
    user = await this.findOne({ phone: phone, role: 'partner', activated: true })
    user0 = await this.findOne({ phone: phoneWith0, role: 'partner', activated: true })
  }
  console.log('user:', user)
  console.log('user0:', user0)
  
  if(!user && !user0){
    throw Error('ip')
  }
  if(user){
    const match = await bcrypt.compare(password, user.password)
    if(!match){
      throw Error('ipass')
    }else{
      return user
    }
    
  }else if(user0){
    const match0 = await bcrypt.compare(password, user0.password)
    if(!match0){
      throw Error('ipass')
    }else{
      return user0
    }
    
  }
}

// static loginEmail method
UserSchema.statics.loginEmail = async function( email, password ) {
  if(!email || !password){
    throw Error('All field must be filled')
  }
  const user = await this.findOne({ email, role: 'administrator' }).populate("authorizationIds")
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

  let phoneWith0
  if(phone.length === 14){
    phoneWith0 = phone.slice(0, 4) + phone.slice(5)
  }else if (phone.length === 13){
    phoneWith0 = phone.slice(0, 4) + '0' + phone.slice(4)
  }
  let user
  let user0
  user = await this.findOne({ phone, role: role })
  user0 = await this.findOne({ phoneWith0, role: role })

  if(user){
    return user
  }else if(user0){
    return user0
  }
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