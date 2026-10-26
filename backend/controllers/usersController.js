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
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '7d' })
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

// GET all users (ADMINISTRATOR ONLY)
const getUsers = async (req, res) => {
    if (!req.user || req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access forbidden: Administrator privileges required' })
    }
    const users = await User.find()
        .sort({ createdAt: -1 })
        .select('-password -resetOtp -resetOtpExpires')
        .populate("categoryId")
        .populate("authorizationIds")
    res.status(200).json(users)
}

// GET a single user (Self or Admin only)
const getUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user && req.user._id.toString() === id
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot view another user\'s profile' })
    }

    const item = await User.findById(id).select('-password -resetOtp -resetOtpExpires')
    
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

// POST a new user (ADMIN ONLY)
const createUser = async (req, res) => {
    if (!req.user || req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access forbidden: Administrator privileges required' })
    }
    const { password } = req.body
    
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const user = await User.create({ 
            ...req.body,
            password: hash
        })
        const sanitized = user.toObject()
        delete sanitized.password
        delete sanitized.resetOtp
        delete sanitized.resetOtpExpires
        res.status(200).json(sanitized)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a user (ADMIN ONLY)
const deleteUser = async (req, res) => {
    if (!req.user || req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access forbidden: Administrator privileges required' })
    }
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }
    const user = await User.findOneAndDelete({_id: id})

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json({ message: 'User deleted successfully', _id: id })
}

// UPDATE a user (Self or Admin only, strictly prevents privilege escalation)
const updateUser = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user && req.user._id.toString() === id
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot modify another user' })
    }

    const updates = { ...req.body }
    // Non-admins cannot escalate roles, modify authorizationIds or status flags
    if (!isAdmin) {
        delete updates.role
        delete updates.authorizationIds
        delete updates.activated
        delete updates.status
        delete updates.fileStatus
        delete updates.expirationOfSubscription
    }

    if (updates.password) {
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(updates.password, salt)
    }
    
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true })
        .select('email firstName lastName language phone role complete status fileStatus typeAccount companyName expirationOfSubscription sectorActivity')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// update existing user (Self or Admin only, strictly prevents privilege escalation)
const update_existing_user = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user && req.user._id.toString() === id
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot modify another user' })
    }

    const updates = { ...req.body }
    // Non-admins cannot escalate roles, modify authorizationIds or status flags
    if (!isAdmin) {
        delete updates.role
        delete updates.authorizationIds
        delete updates.activated
        delete updates.status
        delete updates.fileStatus
        delete updates.expirationOfSubscription
    }
    
    if(updates.password){
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(updates.password, salt)
    }
    
    const user = await User.findOneAndUpdate(
        { _id: id },
        updates,
        { new: true }
    ).select('-password -resetOtp -resetOtpExpires')

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

// verify OTP (never return plaintext OTP in response)
const verifyOTP = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ error: 'Email is required' })
    }
    const user = await User.findOne({ email })
    if (!user) return res.json({ ok: true })

    const otp = Math.floor(100000 + Math.random() * 900000)
    user.resetOtp = await bcrypt.hash(otp.toString(), 10)
    user.resetOtpExpires = Date.now() + 600000
    await user.save()

    try {
        await sendOtpEmail(email, otp)
    } catch (mailErr) {
        console.error('Failed to send OTP email:', mailErr.message)
    }

    res.status(200).json({
        message: "Verification code sent successfully",
        email: email
    })
}

const checkOTP = async (req, res) => {
    const { phonenumber, code } = req.body

    if (phonenumber && code && code.toString().length === 6) {
        const user = await User.findOne({ phone: phonenumber }).select('+resetOtp +resetOtpExpires')
        if (!user) {
            return res.status(400).json({ error: 'USER_NOT_FOUND' })
        }
        if (!user.resetOtpExpires || user.resetOtpExpires < Date.now()) {
            return res.status(400).json({ error: 'OTP_EXPIRED' })
        }
        const isMatch = await bcrypt.compare(code.toString(), user.resetOtp)
        if (!isMatch) {
            return res.status(400).json({ error: 'INVALID_OTP' })
        }

        // Invalidate OTP to prevent replay
        user.resetOtp = undefined
        user.resetOtpExpires = undefined
        await user.save()

        // Generate scoped reset token valid for 15 minutes
        const resetToken = jwt.sign(
            { _id: user._id, role: user.role, purpose: 'password_reset' },
            process.env.SECRET,
            { expiresIn: '15m' }
        )

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token: resetToken,
            resetToken
        })
    } else {
        res.status(400).json({
            error: "Wrong phone number or code"
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