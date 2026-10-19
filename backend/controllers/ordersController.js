const Order = require('../models/Order')
const mongoose = require('mongoose')

// GET all orders
const getOrders = async (req, res) => {
    const orders = await Order.find().sort({ order: 1})
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

    res.status(200).json(order)
}

// POST a new order
const createOrder = async (req, res) => {
    try {
        // add doc to db
        const order = await Order.create(
            req.body
        )
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
    const order = await Order.findOneAndDelete({_id: id})

    if(!order){
        return res.status(404).json({error: 'no such order'})
    }

    res.status(200).json(order)
}

// UPDATE a order
const updateOrder = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such order'})
    }
    const order = await Order.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!order){
        return res.status(404).json({error: 'no such order'})
    }

    res.status(200).json(order)
}

// GET a order by UserId
const getOrdersByUserId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such user'})
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