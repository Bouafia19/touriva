const Billing = require('../models/Billing')
const mongoose = require('mongoose')

// GET all billings
const getBillings = async (req, res) => {
    const billings = await Billing.find().sort({ order: 1}).populate("planId").populate("userId")
    .populate({
        path: 'userId',
        model: 'User',
        select: '_id firstName lastName companyName phone typeAccount'
    })
    .populate({
        path: "planId",
        model: 'Plan'
    })
    .populate({
        path: 'pubId',
        model: 'Announcement',
        select: '_id name published paid'
    })
    res.status(200).json(billings)
}

// GET a single billing
const getBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findById(id)
    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    // Ownership or admin check
    const isOwner = billing.userId && billing.userId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Access to billing restricted' })
    }

    res.status(200).json(billing)
}

// POST a new billing
const createBilling = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            userId: req.user.role === 'administrator' && req.body.userId ? req.body.userId : req.user._id
        }
        const billing = await Billing.create(payload)
        res.status(200).json(billing)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a billing
const deleteBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findOneAndDelete({_id: id})

    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    res.status(200).json(billing)
}

// UPDATE a billing
const updateBilling = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such billing'})
    }
    const billing = await Billing.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!billing){
        return res.status(404).json({error: 'no such billing'})
    }

    res.status(200).json(billing)
}

// GET a billing by UserId
const getBillingsByUserId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user._id.toString() === id
    const isAdmin = req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Access to user billings restricted' })
    }

    const trips = await Billing.find({ userId: id }).sort({ order: 1})
        .populate({
            path: 'userId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'pubId',
            model: 'Announcement',
            select: '_id name published paid'
        })

    res.status(200).json(trips)
}

module.exports = {
    getBillings,
    getBilling,
    createBilling,
    deleteBilling,
    updateBilling,
    getBillingsByUserId
}