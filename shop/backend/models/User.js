const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const Schema = mongoose.Schema 

const UserSchema = new mongoose.Schema({
  email: {
    type: String
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
    type: String
  },
  role: {
    type: String, 
    enum: ['administrator', 'client', 'partner', 'seller']
  },
  activated: {
    type: Boolean
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
  isDemo: {
    type: Boolean,
    default: false
  },
  seedId: {
    type: String,
    default: ''
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
                                  // typeAccount,
                                  companyName
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
    throw Error('Email already in use')
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
    // typeAccount,
    companyName
  })

  return user
}

// Helper to verify password with automatic safe bcrypt migration for legacy accounts
const verifyPasswordWithMigration = async (userDoc, plainPassword) => {
  if (!userDoc || !userDoc.password || !plainPassword) return false
  const isBcrypt = typeof userDoc.password === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(userDoc.password)
  if (isBcrypt) {
    return await bcrypt.compare(plainPassword, userDoc.password)
  }
  // Legacy plaintext match: safely upgrade to bcrypt without logging or exposing credentials
  if (userDoc.password === plainPassword) {
    const salt = await bcrypt.genSalt(10)
    userDoc.password = await bcrypt.hash(plainPassword, salt)
    await userDoc.save()
    return true
  }
  return false
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
  
  let user = null
  let user0 = null
  if(role === 'client'){
    user = await this.findOne({ phone, role: 'client', activated: true }).select('+password')
    user0 = await this.findOne({ phoneWith0, role: 'client', activated: true }).select('+password')
    
  }else if(role === 'partner' || role === 'seller'){
    user = await this.findOne({ phone, role: role, activated: true }).select('+password')
    user0 = await this.findOne({ phoneWith0, role: role, activated: true }).select('+password')
  }
  
  if(!user && !user0){
    throw Error('ip')
  }
  if(user){
    const match = await verifyPasswordWithMigration(user, password)
    if(!match){
      throw Error('ipass')
    }
    return user
  }else if(user0){
    const match0 = await verifyPasswordWithMigration(user0, password)
    if(!match0){
      throw Error('ipass')
    }
    return user0
  }
}

// static loginEmail method
UserSchema.statics.loginEmail = async function( email, password, role ) {
  if(!email || !password){
    throw Error('All field must be filled')
  }
  const query = { email: email.toLowerCase().trim() }
  if (role) {
    query.role = role
  }
  const user = await this.findOne(query).select('+password').populate("authorizationIds")
  if(!user){
    throw Error('Invalid email or password')
  }
  const match = await verifyPasswordWithMigration(user, password)
  if(!match){
    throw Error('Invalid email or password')
  }
  return user
}

// static loginPhoneWeb method (Secured: requires verified password)
UserSchema.statics.loginPhoneWeb = async function( phone, password, role ) {
  if(!phone || !password){
    throw Error('Phone and password fields must be filled')
  }

  let phoneWith0
  if(phone.length === 14){
    phoneWith0 = phone.slice(0, 4) + phone.slice(5)
  }else if (phone.length === 13){
    phoneWith0 = phone.slice(0, 4) + '0' + phone.slice(4)
  }
  let user = await this.findOne({ phone, role: role }).select('+password')
  let user0 = await this.findOne({ phoneWith0, role: role }).select('+password')

  const target = user || user0
  if(!target){
    throw Error('User not found')
  }

  const match = await verifyPasswordWithMigration(target, password)
  if(!match){
    throw Error('Invalid password')
  }

  return target
}

// static signup web method (Secured: enforces password hashing and disallows admin self-assignment)
UserSchema.statics.signupWeb = async function( phone, role, email, firstName, lastName, activated, password ) {
  if(!phone || !password){
    throw Error('Phone and password fields must be filled')
  }

  // Prevent self-assignment of administrator or elevated roles
  const safeRole = (role === 'administrator') ? 'client' : (role || 'client')
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)

  const user = await this.create({
    phone,
    role: safeRole,
    email,
    firstName,
    lastName,
    activated: !!activated,
    password: hash
  })

  return user
}

module.exports = mongoose.model('User', UserSchema)