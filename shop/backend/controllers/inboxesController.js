const Inbox = require('../models/Inbox')
const mongoose = require('mongoose')

// GET all inboxes
const getInboxes = async (req, res) => {
    const inboxes = await Inbox.find().sort({ createdAt: -1})
    res.status(200).json(inboxes)
}

// GET a single service
const getInbox = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such service'})
    }
    const service = await Inbox.findById(id)

    if(!service){
        return res.status(404).json({error: 'no such service'})
    }

    res.status(200).json(service)
}

// POST a new service
const createInbox = async (req, res) => {
    const { 
        name,
        description,
        phone,
        email
    } = req.body
    try {
        // add doc to db
        const service = await Inbox.create({ 
            name,
            description,
            phone,
            email
        })
        res.status(200).json(service)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a service
const deleteInbox = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such service'})
    }
    const service = await Inbox.findOneAndDelete({_id: id})

    if(!service){
        return res.status(404).json({error: 'no such service'})
    }

    res.status(200).json(service)
}

// UPDATE a service
const updateInbox = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such service'})
    }
    const service = await Inbox.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!service){
        return res.status(404).json({error: 'no such service'})
    }

    res.status(200).json(service)
}

module.exports = {
    getInboxes,
    getInbox,
    createInbox,
    deleteInbox,
    updateInbox
}