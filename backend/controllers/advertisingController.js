const Advertising = require('../models/Advertising')
const mongoose = require('mongoose')

// GET all advertising
const getAdvertisings = async (req, res) => {
    const advertising = await Advertising.find().sort({ order: 1})
    .populate({
        path: 'ownerId',
        model: 'User',
        select: '_id firstName lastName phone'
    })
    res.status(200).json(advertising)
}

// GET a single advertising
const getAdvertising = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such advertising'})
    }

    const advertising = await Advertising.findById(id).populate('ownerId')

    if(!advertising){
        return res.status(404).json({error: 'no such advertising'})
    }

    res.status(200).json(advertising)
}

// POST a new advertising
const createAdvertising = async (req, res) => {
   
    try {
        const advertising = new Advertising(req.body);
        const savedAdvertising = await advertising.save();
        res.status(200).json(savedAdvertising);
    } catch (err) {
        res.status(400).send(err.message);
    }
}

// DELETE a advertising
const deleteAdvertising = async (req, res) => {

    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such advertising'})
    }

    const advertising = await Advertising.findOneAndDelete({_id: id})

    if(!advertising){
        return res.status(404).json({error: 'no such advertising'})
    }

    res.status(200).json(advertising)
}

// UPDATE a advertising
const updateAdvertising = async (req, res) => {

    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such advertising'})
    }
    const advertising = await Advertising.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!advertising){
        return res.status(404).json({error: 'no such advertising'})
    }

    res.status(200).json(advertising)
}

// Advertising by ID
const getAdvertisingById = async (req, res) => {
    try {
        const advertising = await Advertising.findById(req.params.advertisingId)
        if (!advertising) {
          return res.status(404).json({ error: 'Advertising not found' });
        }
        res.status(200).json(advertising)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch advertising details' });
    }
}

// Advertising by OwnerID
const getAdvertisingByOwnerId = async (req, res) => {

    const { ownerId } = req.params
   
    const advertising = await Advertising.findOne({ ownerId: ownerId, payed: false }).sort({ createdAt: -1 })

    res.status(200).json(advertising)
}




module.exports = {
    getAdvertisings,
    getAdvertising,
    createAdvertising,
    deleteAdvertising,
    updateAdvertising,
    getAdvertisingById,
    getAdvertisingByOwnerId
}