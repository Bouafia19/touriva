const User = require('../models/User')
const Role = require('../models/Role')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
// const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
// const admin = require("firebase-admin")
const { defineRulesFor } = require('../modules/abilities')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })
}

// login user via web (Secured: requires verified password and validates against DB)
const loginUserWeb = async (req, res) => {
    try {
        const { phone, password, role } = req.body
        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' })
        }
        const item = await User.loginPhoneWeb(phone, password, role)
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

// signup user via web (Secured: requires password, hashes it, prevents admin self-assignment)
const signupUserWeb = async (req, res) => {
    const { phone, role, email, firstName, lastName, activated, password } = req.body
    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone and password are required' })
    }
    if (role === 'administrator') {
        return res.status(403).json({ error: 'Self-assignment of administrator privileges is strictly prohibited.' })
    }
    try {
        const item = await User.signupWeb(phone, role, email, firstName, lastName, activated, password)
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

    let phoneWith0
    if(phonenumber.length === 14){
        phoneWith0 = phonenumber.slice(0, 4) + phonenumber.slice(5)
    }else if (phonenumber.length === 13){
        phoneWith0 = phonenumber.slice(0, 4) + '0' + phonenumber.slice(4)
    }
   
    const user = await User.findOne({ phone: phonenumber, role: role })
    const user0 = await User.findOne({ phone: phoneWith0, role: role })

    if(!user && !user0){
        return res.status(404).json({error: 'no such user'})
    }else if(user){
        res.status(200).json(user)
    }else if(user0){
        res.status(200).json(user0)
    }
}



// login user
const loginUser = async (req, res) => {
    try {
        const { email, phone, password, role } = req.body

        // Email-based login for Admin and Sellers
        if (email) {
            const user = await User.loginEmail(email, password, role)
            const token = createToken(user._id)
            const rules = defineRulesFor(user)
            let userObj = {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                language: user.language,
                phone: user.phone,
                role: user.role,
                complete: user.complete,
                status: user.status,
                fileStatus: user.fileStatus,
                companyName: user.companyName,
                expirationOfSubscription: user.expirationOfSubscription
            }
            return res.status(200).json({ rules, user: userObj, token })
        }

        // Phone-based login for client / partner accounts
        const item = await User.loginPhone(phone, password, role)
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
            expirationOfSubscription: item.expirationOfSubscription,
            sectorActivity: item.sectorActivity
        }
        res.status(200).json({ user, token })
    } catch (error) {
        res.status(400).json({error: error.message})
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
        sectorActivity

    } = req.body

    // Prevent self-assignment of administrator or elevated roles via public signup
    if (role === 'administrator') {
        return res.status(403).json({ error: 'Self-assignment of administrator privileges is strictly prohibited.' })
    }
    const safeRole = role || 'client'

    try {
        const item = await User.signup(
            email, 
            firstName, 
            lastName, 
            phone, 
            password, 
            safeRole, 
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
            sectorActivity
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
                sectorActivity: item.sectorActivity
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
// GET all users (ADMIN ONLY)
const getUsers = async (req, res) => {
    if (!req.user || req.user.role !== 'administrator') {
        return res.status(403).json({ error: 'Access forbidden: Administrator privileges required' })
    }
    const users = await User.find().sort({ createdAt: -1}).select('-password').populate("categoryId").populate("authorizationIds")
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

    const item = await User.findById(id).select('-password')
    
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
        const sanitized = user.toObject()
        delete sanitized.password
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

    const target = await User.findById(id)
    if(!target){
        return res.status(404).json({error: 'no such user'})
    }
    if (target.isDemo) {
        return res.status(403).json({ error: 'Demo accounts are protected from deletion.' })
    }

    await User.findByIdAndDelete(id)
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

    const target = await User.findById(id)
    if (!target) {
        return res.status(404).json({ error: 'no such user' })
    }
    if (target.isDemo && (req.body.password || req.body.email)) {
        return res.status(403).json({ error: 'Demo accounts are protected: password and email changes are disabled in demonstration mode.' })
    }

    const updates = { ...req.body }
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

    const target = await User.findById(id)
    if (!target) {
        return res.status(404).json({ error: 'no such user' })
    }
    if (target.isDemo && (req.body.password || req.body.email)) {
        return res.status(403).json({ error: 'Demo accounts are protected: password and email changes are disabled in demonstration mode.' })
    }

    const updates = { ...req.body }
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
    
    const user = await User.findOneAndUpdate({_id: id}, updates, { new: true }).select('-password')

    if(!user){
        return res.status(404).json({error: 'no such user'})
    }
    
    res.status(200).json(user)
}

// upload images (Secured: Self or Admin only, strict document fields)
const uploadPartnerImages = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user && req.user._id.toString() === id
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot modify another partner documents' })
    }

    const allowedFields = ['nisDoc', 'commercialRegister', 'nifDoc', 'id', 'avatar', 'logo', 'cover']
    const safeUpdates = {}
    for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
            safeUpdates[key] = req.body[key]
        }
    }

    const user = await User.findOneAndUpdate({_id: id}, safeUpdates, { new: true }).select('_id')
    
    if(!user){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(user)
}

// GET partner photos (Secured: Self or Admin only)
const loadPartnerPhotos = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user && req.user._id.toString() === id
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot view another partner documents' })
    }

    const images = await User.findById(id).select('nisDoc commercialRegister nifDoc id')
    
    if(!images){
        return res.status(404).json({error: 'no such user'})
    }

    res.status(200).json(images)
}

// Whitelist of valid demo accounts for Touriva Independent Marketplace (Non-production only)
// NOTE: Platform Administrator accounts are strictly excluded from demo authentication.
const APPROVED_DEMO_ACCOUNTS = {
    // Sellers
    'seller1': { email: 'demo.seller1@touriva.example', role: 'seller', type: 'seller', storeName: 'Atlas Electronics DZ' },
    'atlas': { email: 'demo.seller1@touriva.example', role: 'seller', type: 'seller', storeName: 'Atlas Electronics DZ' },
    'atlas-electronics-dz': { email: 'demo.seller1@touriva.example', role: 'seller', type: 'seller', storeName: 'Atlas Electronics DZ' },

    'seller2': { email: 'demo.seller2@touriva.example', role: 'seller', type: 'seller', storeName: 'Artisan DZ & Traditions' },
    'artisan': { email: 'demo.seller2@touriva.example', role: 'seller', type: 'seller', storeName: 'Artisan DZ & Traditions' },
    'artisan-dz-traditions': { email: 'demo.seller2@touriva.example', role: 'seller', type: 'seller', storeName: 'Artisan DZ & Traditions' },

    'seller3': { email: 'demo.seller3@touriva.example', role: 'seller', type: 'seller', storeName: 'Maison El Bahdja Déco' },
    'bahdja': { email: 'demo.seller3@touriva.example', role: 'seller', type: 'seller', storeName: 'Maison El Bahdja Déco' },
    'maison-el-bahdja-deco': { email: 'demo.seller3@touriva.example', role: 'seller', type: 'seller', storeName: 'Maison El Bahdja Déco' },

    'seller4': { email: 'demo.seller4@touriva.example', role: 'seller', type: 'seller', storeName: 'Sahara Outdoor Expeditions' },
    'sahara': { email: 'demo.seller4@touriva.example', role: 'seller', type: 'seller', storeName: 'Sahara Outdoor Expeditions' },
    'sahara-outdoor-expeditions': { email: 'demo.seller4@touriva.example', role: 'seller', type: 'seller', storeName: 'Sahara Outdoor Expeditions' },

    // Buyers
    'buyer1': { email: 'demo.buyer1@touriva.example', role: 'client', type: 'buyer', name: 'Yasmine Benali', phone: '+213550000001' },
    'yasmine': { email: 'demo.buyer1@touriva.example', role: 'client', type: 'buyer', name: 'Yasmine Benali', phone: '+213550000001' },

    'buyer2': { email: 'demo.buyer2@touriva.example', role: 'client', type: 'buyer', name: 'Rachid Khellaf', phone: '+213550000002' },
    'rachid': { email: 'demo.buyer2@touriva.example', role: 'client', type: 'buyer', name: 'Rachid Khellaf', phone: '+213550000002' },

    'buyer3': { email: 'demo.buyer3@touriva.example', role: 'client', type: 'buyer', name: 'Amina Bouzid', phone: '+213550000003' },
    'amina': { email: 'demo.buyer3@touriva.example', role: 'client', type: 'buyer', name: 'Amina Bouzid', phone: '+213550000003' },

    'buyer4': { email: 'demo.buyer4@touriva.example', role: 'client', type: 'buyer', name: 'Sofiane Zerrouki', phone: '+213550000004' },
    'sofiane': { email: 'demo.buyer4@touriva.example', role: 'client', type: 'buyer', name: 'Sofiane Zerrouki', phone: '+213550000004' },

    'buyer5': { email: 'demo.buyer5@touriva.example', role: 'client', type: 'buyer', name: 'Nour El Houda Belkacem', phone: '+213550000005' },
    'nour': { email: 'demo.buyer5@touriva.example', role: 'client', type: 'buyer', name: 'Nour El Houda Belkacem', phone: '+213550000005' }
}

// 1-Click Demo Authentication for Touriva Independent Marketplace (Non-production only)
const demoLogin = async (req, res) => {
    // Strictly disable demo login in production environments
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN !== 'true') {
        return res.status(404).json({ error: 'Endpoint not found' })
    }

    try {
        const { demoType, role: requestedRole } = req.body
        const key = String(demoType || '').toLowerCase().trim()

        // Explicitly block any administrator demo authentication
        if (key === 'admin' || key === 'administrator' || requestedRole === 'administrator') {
            return res.status(403).json({
                error: 'Administrator demo authentication is strictly prohibited.'
            })
        }

        // Match against whitelist by key or email
        let account = APPROVED_DEMO_ACCOUNTS[key]
        if (!account) {
            account = Object.values(APPROVED_DEMO_ACCOUNTS).find(a => a.email === key)
        }

        if (!account) {
            return res.status(400).json({
                error: 'Invalid demoType. Permitted options: seller1, seller2, seller3, seller4, buyer1, buyer2, buyer3, buyer4, buyer5.'
            })
        }

        // Enforce role consistency if requestedRole is provided
        if (requestedRole && requestedRole !== account.role) {
            return res.status(403).json({
                error: `Role mismatch: demo account '${key}' has role '${account.role}', cannot authenticate as '${requestedRole}'.`
            })
        }

        // Prohibit administrator role under all circumstances
        if (account.role === 'administrator') {
            return res.status(403).json({
                error: 'Administrator demo authentication is strictly prohibited.'
            })
        }

        // Query database with strict demo verification
        const item = await User.findOne({
            email: account.email,
            role: account.role,
            isDemo: true,
            seedId: 'TOURIVA-DEMO-2026'
        }).populate('authorizationIds')

        if (!item) {
            return res.status(404).json({
                error: `Demo account (${account.email}) not found or uninitialized. Please run demo seeder.`
            })
        }

        if (item.status === false || item.activated === false) {
            return res.status(403).json({ error: 'This demo account is currently disabled.' })
        }

        const token = createToken(item._id)
        const rules = (item.authorizationIds && item.authorizationIds.length > 0) ? defineRulesFor(item) : []

        const user = {
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
            expirationOfSubscription: item.expirationOfSubscription,
            isDemo: true,
            seedId: item.seedId,
            demoRole: account.type
        }

        res.status(200).json({ rules, user, token, isDemo: true })
    } catch (error) {
        res.status(500).json({ error: error.message || 'Demo authentication failed.' })
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
    demoLogin
}