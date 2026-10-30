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
            rejectionReason: item.rejectionReason || null,
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

// demo login for prospective clients (Customer & Agency Director)
const demoLogin = async (req, res) => {
    try {
        const { demoType } = req.body

        // Critical Security Restriction:
        // Administrator demo access CANNOT be obtained via this public endpoint.
        // Platform administrators must authenticate explicitly via the admin portal.
        if (demoType === 'admin' || demoType === 'administrator') {
            return res.status(403).json({
                error: 'Administrator demo access is strictly restricted. Platform administrators must authenticate through the dedicated admin portal.'
            })
        }

        let targetEmail = null
        let expectedRole = null

        if (demoType === 'customer' || demoType === 'tourist') {
            targetEmail = 'demo.customer@touriva.test'
            expectedRole = 'client'
        } else if (demoType === 'agency' || demoType === 'director') {
            targetEmail = 'demo.agency@touriva.test'
            expectedRole = 'partner'
        } else {
            return res.status(400).json({
                error: 'Invalid demoType. Permitted options: "customer", "agency".'
            })
        }

        const item = await User.findOne({
            email: targetEmail,
            role: expectedRole,
            $or: [{ activated: true }, { activated: { $exists: false } }]
        }).populate('authorizationIds')

        if (!item) {
            return res.status(404).json({
                error: `Demo account (${targetEmail}) has not been seeded yet. Please run the demo seeder.`
            })
        }

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
            rejectionReason: item.rejectionReason || null,
            companyName: item.companyName,
            typeAccount: item.typeAccount,
            guideType: item.guideType,
            hasLicense: item.hasLicense,
            associationTypeActivity: item.associationTypeActivity,
            expirationOfSubscription: item.expirationOfSubscription,
            sectorActivity: item.sectorActivity
        }

        res.status(200).json({ user, token })
    } catch (error) {
        res.status(500).json({ error: 'Demo authentication failed', details: error.message })
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
                rejectionReason: item.rejectionReason || null,
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
        rejectionReason: item.rejectionReason || null,
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

// Helper: In-app compliance notification on partner verification status change (ADM-01)
const createComplianceNotification = (user, fileStatus, rejectionReason) => {
    if (!user.notifications) user.notifications = []

    // Deduplication: if latest compliance notification matches current status and reason, avoid duplicate
    const latest = user.notifications[user.notifications.length - 1]
    if (latest && latest.type === 'compliance' && latest.metadata && latest.metadata.fileStatus === fileStatus) {
        if (fileStatus === 'rejected' && latest.metadata.rejectionReason === rejectionReason) {
            return false
        }
        if (fileStatus === 'confirmed') {
            return false
        }
    }

    if (fileStatus === 'rejected') {
        user.notifications.push({
            title: 'Dossier Partenaire Non Conforme',
            message: rejectionReason || 'Votre dossier d\'accréditation n\'a pas été validé par l\'administration.',
            type: 'compliance',
            status: 'unread',
            metadata: { fileStatus: 'rejected', rejectionReason: rejectionReason || null },
            createdAt: new Date()
        })
        return true
    } else if (fileStatus === 'confirmed') {
        user.notifications.push({
            title: 'Dossier Partenaire Validé',
            message: 'Félicitations ! Votre dossier d\'accréditation a été validé par l\'administration. Vous pouvez désormais publier vos offres sur Touriva.',
            type: 'compliance',
            status: 'unread',
            metadata: { fileStatus: 'confirmed' },
            createdAt: new Date()
        })
        return true
    }
    return false
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
        delete updates.expirationOfSubscription
        delete updates.rejectionReason

        // Self-modification of fileStatus: Only allow transitioning to 'pending' (submission / resubmission)
        // Strictly prevent self-approval ('confirmed') or unauthorized status mutations
        if (updates.fileStatus !== undefined) {
            if (updates.fileStatus === 'pending') {
                // Allowed: partner submitting documents for admin review
            } else {
                delete updates.fileStatus
            }
        }
    } else {
        // Administrator updates:
        // When administrator approves an agency/partner, automatically clear any prior rejectionReason
        if (updates.fileStatus === 'confirmed') {
            updates.rejectionReason = null
        }
    }

    if (updates.password) {
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(updates.password, salt)
    }

    const targetUser = await User.findById(id)
    if (!targetUser) {
        return res.status(404).json({error: 'no such user'})
    }

    // In-app notification on partner compliance status change (ADM-01)
    if (isAdmin && updates.fileStatus && updates.fileStatus !== targetUser.fileStatus) {
        createComplianceNotification(targetUser, updates.fileStatus, updates.rejectionReason)
        updates.notifications = targetUser.notifications
    }
    
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true })
        .select('email firstName lastName language phone role complete status fileStatus rejectionReason typeAccount companyName expirationOfSubscription sectorActivity notifications')
    
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
        delete updates.expirationOfSubscription
        delete updates.rejectionReason

        // Self-modification of fileStatus: Only allow transitioning to 'pending' (submission / resubmission)
        // Strictly prevent self-approval ('confirmed') or unauthorized status mutations
        if (updates.fileStatus !== undefined) {
            if (updates.fileStatus === 'pending') {
                // Allowed: partner submitting documents for admin review
            } else {
                delete updates.fileStatus
            }
        }
    } else {
        // Administrator updates:
        // When administrator approves an agency/partner, automatically clear any prior rejectionReason
        if (updates.fileStatus === 'confirmed') {
            updates.rejectionReason = null
        }
    }
    
    if(updates.password){
        const salt = await bcrypt.genSalt(10)
        updates.password = await bcrypt.hash(updates.password, salt)
    }

    const targetUser = await User.findById(id)
    if (!targetUser) {
        return res.status(404).json({error: 'no such user'})
    }

    // In-app notification on partner compliance status change (ADM-01)
    if (isAdmin && updates.fileStatus && updates.fileStatus !== targetUser.fileStatus) {
        createComplianceNotification(targetUser, updates.fileStatus, updates.rejectionReason)
        updates.notifications = targetUser.notifications
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

// upload partner images/documents (Self or Admin only, strictly whitelisted document fields)
const uploadPartnerImages = async (req, res) => {
    const { id } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const isSelf = req.user._id.toString() === id
    const isAdmin = req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot modify another partner\'s documents' })
    }

    const ALLOWED_DOCUMENT_FIELDS = [
        'nisDoc', 'commercialRegister', 'nifDoc', 'id', 'presidentId', 
        'diploma', 'accreditation', 'justification', 'grayCard', 
        'transportCard', 'trafficPermit'
    ]

    const updates = {}
    for (const key of ALLOWED_DOCUMENT_FIELDS) {
        if (req.body[key] !== undefined) {
            // Safety check: protect against BSON 16MB document overflow
            // Base64 document payload should not exceed 5MB (~3.7MB binary)
            if (typeof req.body[key] === 'string' && req.body[key].length > 5 * 1024 * 1024) {
                return res.status(413).json({ 
                    error: `Document payload for ${key} exceeds 5MB limit. Please compress or optimize the file before uploading.` 
                })
            }
            updates[key] = req.body[key]
        }
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid document fields provided' })
    }
   
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true }).select('_id')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// GET partner photos/documents (Self or Admin only)
const loadPartnerPhotos = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    if (!req.user) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const isSelf = req.user._id.toString() === id
    const isAdmin = req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot view another partner\'s documents' })
    }

    const images = await User.findById(id).select('nisDoc commercialRegister nifDoc id presidentId diploma accreditation justification grayCard transportCard trafficPermit')
    
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

// GET user notifications (Self or Admin)
const getUserNotifications = async (req, res) => {
    const userId = req.params.id || (req.user ? req.user._id : null)
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ error: 'no such user' })
    }

    const isSelf = req.user && req.user._id.toString() === userId.toString()
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot view notifications of another user' })
    }

    const user = await User.findById(userId).select('notifications')
    if (!user) {
        return res.status(404).json({ error: 'no such user' })
    }

    const notifications = (user.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.status(200).json({ notifications })
}

// PATCH mark notification as read (Self or Admin)
const markNotificationRead = async (req, res) => {
    const { notifId } = req.params
    const userId = req.user ? req.user._id : null
    if (!userId) {
        return res.status(401).json({ error: 'Authorization token required' })
    }

    const user = await User.findById(userId)
    if (!user) {
        return res.status(404).json({ error: 'no such user' })
    }

    const notif = (user.notifications || []).find(n => n._id.toString() === notifId)
    if (!notif) {
        return res.status(404).json({ error: 'Notification not found' })
    }

    notif.status = 'read'
    await user.save()

    res.status(200).json({ message: 'Notification marked as read', notification: notif })
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
    checkOTP,
    demoLogin,
    getUserNotifications,
    markNotificationRead
}