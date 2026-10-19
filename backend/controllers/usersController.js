const User = require('../models/User')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
// const admin = require("firebase-admin")
const { defineRulesFor } = require('../modules/abilities')
const { transporter } = require("../services/mail")

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: '"Touriva" <no-reply@touriva.com>',
    to,
    subject: "Your password reset code",
    html: `
      <h2>Password reset</h2>
      <p>Your code:</p>
      <h1>${otp}</h1>
      <p>Expires in 10 minutes</p>
    `,
  })
}
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET)
}

// login user via web
const loginUserWeb = async (req, res) => {
    try {
        const { phone, role } = req.body
        const item = await User.loginPhoneWeb(phone, role)
        // create token
        const token = createToken(item._id)
        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
            expirationOfSubscription: item.expirationOfSubscription
        }
        res.status(200).json({ user, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// signup user via web
const signupUserWeb = async (req, res) => {
    const { phone, role, email, firstName, lastName,  activated } = req.body
    try {
        const item = await User.signupWeb( phone, role, email, firstName, lastName,  activated)
        // create token
        const token = createToken(item._id)

        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
            expirationOfSubscription: item.expirationOfSubscription
        }
        
        res.status(200).json({ user, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// GET a single user by phone number
const verifyUser = async (req, res) => {
    const { phonenumber, role } = req.body
    if (!phonenumber) {
        return res.status(400).json({ error: 'Phone number required' })
    }
    const user = await User.loginPhoneWeb(phonenumber, role)
    if (!user) {
        return res.status(404).json({ error: 'no such user' })
    }
    res.status(200).json(user)
}

// login user
const loginUser = async (req, res) => {
    const { role, email, phone, password } = req.body
    try {
        let item
        if (email && !phone) {
            item = await User.loginEmail(email, password, role)
        } else {
            item = await User.loginPhone(phone, password, role)
        }

        // create token
        const token = createToken(item._id)

        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
            complete: item.complete,
            status: item.status,
            fileStatus: item.fileStatus,
            companyName: item.companyName,
            typeAccount: item.typeAccount,
            guideType: item.guideType,
            hasLicense: item.hasLicense,
            associationTypeActivity: item.associationTypeActivity,
            expirationOfSubscription: item.expirationOfSubscription,
            sectorActivity: item.sectorActivity
        }

        if (item.role === 'administrator') {
            const rules = defineRulesFor(item)
            res.status(200).json({ rules, user, token })
        } else {
            res.status(200).json({ user, token })
        }

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// signup user
const signupUser = async (req, res) => {
    const { 
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

    } = req.body
    try {
        const item = await User.signup(
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
        )
        // create token
        const token = createToken(item._id)

        // if(item.fcmToken){
        //     if(item.role != 'administrator'){
        //         // Subscribe the devices corresponding to the registration tokens to the
        //         // topic.
        //         admin.messaging().subscribeToTopic(item.fcmToken, item.role)
        //         .then((response) => {
        //         // See the MessagingTopicManagementResponse reference documentation
        //         // for the contents of response.
        //         console.log('Successfully subscribed to topic:', response);
        //         })
        //         .catch((error) => {
        //         console.log('Error subscribing to topic:', error);
        //         })
        //     }
        // }
        

        
            let user = {
                _id: item._id,
                email: item.email,
                firstName: item.firstName,
                lastName: item.lastName,
                language: item.language,
                phone: item.phone,
                role: item.role,
                complete: item.complete,
                status: item.status,
                companyName: item.companyName,
                fileStatus: item.fileStatus,
                typeAccount: item.typeAccount,
                expirationOfSubscription: item.expirationOfSubscription,
                sectorActivity: item.sectorActivity,
                guideType: item.guideType,
                associationTypeActivity: item.associationTypeActivity,
                hasLicense: item.hasLicense
            }
            res.status(200).json({ user, token})
       
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// verify phone
const verifyPhone = async (req, res) => {
    const { phonenumber, channel, role } = req.body
    
    // validation
    if(!phonenumber || !channel){
        res.status(400).json({error: 'All field must be filled'})
    }
    let phoneWith0
    if(phonenumber.length === 14){
        phoneWith0 = phonenumber.slice(0, 4) + phonenumber.slice(5)
    }else if (phonenumber.length === 13){
        phoneWith0 = phonenumber.slice(0, 4) + '0' + phonenumber.slice(4)
    }

    const exists = await User.findOne({  phone: phonenumber,  role: role })
    const exists0 = await User.findOne({  phone: phoneWith0,  role: role })
    if(exists || exists0){
        return res.status(400).json({error: 'paiu'})
    }
    else if (phonenumber) {
        
        // client.verify.v2.services('VA356ce183c82b283137ee24ee714bc608')
        //         .verifications
        //         .create({to: phonenumber, channel: 'sms'})
        //         .then(verification => {
        //             res.status(200).send({
        //                 message: "Verification is sent!!",
        //                 phonenumber: phonenumber,
        //                 verification
        //             })
        //         })
        res.status(200).send({
            message: "Verification is sent!!",
            phonenumber: phonenumber,
        })
    } 
    else {
       
        res.status(400).send({
            message: "Wrong phone number :(",
            phonenumber: phonenumber,
            // data
        })
     }

}

// verify code
const verifyCode = async (req, res) => {
    const { phonenumber, code } = req.body
    if (phonenumber && code.length === 6) {
        client
            .verify
            .v2
            .services(process.env.SERVICE_ID)
            .verificationChecks
            .create({
                to: phonenumber,
                code: code
            })
            .then(data => {
                if (data.status === "approved") {
                    res.status(200).send({
                        message: "User is Verified!!",
                        data
                    })
                }
            })
    } else {
        res.status(400).send({
            message: "Wrong phone number or code :(",
            phonenumber: phonenumber,
            data
        })
    }
}

// GET all users
const getUsers = async (req, res) => {
    const users = await User.find().sort({ createdAt: -1}).populate("categoryId").populate("authorizationIds")
    res.status(200).json(users)
}

// GET a single user
const getUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    const item = await User.findById(id)
    
    if(!item){
        return res.status(404).json({error: 'no such user'})
    }

    
        let user = {
            _id: item._id,
            email: item.email,
            firstName: item.firstName,
            lastName: item.lastName,
            language: item.language,
            phone: item.phone,
            role: item.role,
            complete: item.complete,
            status: item.status,
            fileStatus: item.fileStatus,
            companyName: item.companyName,
            typeAccount: item.typeAccount,
            categoryId: item.categoryId,
            expirationOfSubscription: item.expirationOfSubscription,
            sectorActivity: item.sectorActivity
        }
        res.status(200).json(user)

}

// POST a new user
const createUser = async (req, res) => {
    const { 
        password,
        
    } = req.body
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        // add doc to db
        const user = await User.create({ 
            ...req.body,
            password: hash
        })
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a user
const deleteUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    const user = await User.findOneAndDelete({_id: id})

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// UPDATE a user
const updateUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    
    const user = await User.findOneAndUpdate({_id: id},{
        ...req.body
    },
    {
        new: true
    }).select('email firstName lastName language phone role complete status fileStatus typeAccount companyName expirationOfSubscription sectorActivity')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// update existing user
const update_existing_user = async (req, res) => {
    const { id } = req.params
    // let { password } = req.body
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    
    if(req.body.password){
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.password, salt)

        req.body.password = hash
    }
    
    const user = await User.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true }
    )

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// upload images
const uploadPartnerImages = async (req, res) => {

    const { id } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
   
    const user = await User.findOneAndUpdate({_id: id},{
        ...req.body
    }).select('_id')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// GET partner photos
const loadPartnerPhotos = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    const images = await User.findById(id).select('nisDoc commercialRegister nifDoc id presidentId diploma accreditation justification')
    
    if(!images){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(images)
}

// verify OTP
const verifyOTP = async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.json({ ok: true })

    const otp = Math.floor(100000 + Math.random() * 900000)
    user.resetOtp = await bcrypt.hash(otp.toString(), 10)
    user.resetOtpExpires = Date.now() + 600000
    await user.save()

    await sendOtpEmail(email, otp)

    res.status(200).send({
        message: "Verification is sent!!",
        email: email,
        otp: otp
    })

}

const checkOTP = async (req, res) => {

    const { phonenumber, code } = req.body

    if (phonenumber && code.length === 6) {
        const user = await User.findOne({ phone: phonenumber })
        if (!user) {
            return res.status(400).json({ error: 'USER_NOT_FOUND' })
        }
        if (user.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: 'OTP_EXPIRED' })
        }
        const isMatch = await bcrypt.compare(code.toString(), user.resetOtp)
        if (!isMatch) {
            return res.status(400).json({ error: 'INVALID_OTP' })
        }
        res.status(200).send(user)
    } else {
        res.status(400).send({
            message: "Wrong phone number or code :(",
            phonenumber: phonenumber,
            data
        })
    }
}

module.exports = {
    loginUser,
    signupUser,
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser,
    verifyCode,
    verifyPhone,
    verifyUser,
    update_existing_user,
    loginUserWeb,
    signupUserWeb,
    uploadPartnerImages,
    loadPartnerPhotos,
    verifyOTP,
    checkOTP
}