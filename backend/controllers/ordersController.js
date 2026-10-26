const Order = require('../models/Order')
const mongoose = require('mongoose')

// GET all orders
const getOrders = async (req, res) => {
    // If standard client, return only their own orders
    const filter = (req.user.role === 'administrator' || req.user.role === 'partner')
        ? {}
        : { userId: req.user._id }

    const orders = await Order.find(filter).sort({ order: 1})
    .populate({
        path: 'userId',
        model: 'User',
        select: '_id firstName lastName companyName phone typeAccount'
    })
    .populate({
        path: 'productId',
        model: 'Product',
        select: '_id code price'
    })

    res.status(200).json(orders)
}

// GET a single order
const getOrder = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such order'})
    }
    const order = await Order.findById(id)
    if(!order){
        return res.status(404).json({error: 'no such order'})
    }

    const isOwner = order.userId && order.userId.toString() === req.user._id.toString()
    const isAdminOrPartner = req.user.role === 'administrator' || req.user.role === 'partner'
    if (!isOwner && !isAdminOrPartner) {
        return res.status(403).json({ error: 'Unauthorized: Access to order restricted' })
    }

    res.status(200).json(order)
}

// POST a new order
const createOrder = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            userId: (req.user.role === 'administrator' && req.body.userId) ? req.body.userId : req.user._id
        }
        const order = await Order.create(payload)
        res.status(200).json(order)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a order
const deleteOrder = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such order'})
    }

    const existingOrder = await Order.findById(id)
    if(!existingOrder){
        return res.status(404).json({error: 'no such order'})
    }

    const isOwner = existingOrder.userId && existingOrder.userId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: You can only delete your own orders' })
    }

    await Order.findByIdAndDelete(id)
    res.status(200).json(existingOrder)
}

// UPDATE a order
const updateOrder = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such order'})
    }

    const existingOrder = await Order.findById(id)
    if(!existingOrder){
        return res.status(404).json({error: 'no such order'})
    }

    const isOwner = existingOrder.userId && existingOrder.userId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: You can only update your own orders' })
    }

    const order = await Order.findOneAndUpdate({_id: id},{
        ...req.body
    }, { new: true })

    res.status(200).json(order)
}

// GET a order by UserId
const getOrdersByUserId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
    }

    const isSelf = req.user._id.toString() === id
    const isAdmin = req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized: Access to user orders restricted' })
    }

    const trips = await Order.find({ userId: id }).sort({ order: 1})
        .populate({
            path: 'userId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'productId',
            model: 'Product',
            select: '_id code price'
        })

    res.status(200).json(trips)
}

module.exports = {
    getOrders,
    getOrder,
    createOrder,
    deleteOrder,
    updateOrder,
    getOrdersByUserId
}