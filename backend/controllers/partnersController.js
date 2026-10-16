const Partner = require('../models/Partner')
const mongoose = require('mongoose')

// GET all partners
const getPartners = async (req, res) => {
    const partners = await Partner.find().sort({ createdAt: -1})
    res.status(200).json(partners)
}

// GET a single partner
const getPartner = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such partner'})
    }
    const partner = await Partner.findById(id)

    if(!partner){
        return res.status(404).json({error: 'no such partner'})
    }

    res.status(200).json(partner)
}

// POST a new partner
const createPartner = async (req, res) => {
    const { 
        name,
        description,
        nameFr,
        descriptionFr,
        nameAr,
        descriptionAr,
        audience,
        photo
    } = req.body
    try {
        // add doc to db
        const partner = await Partner.create({ 
            name,
            description,
            nameFr,
            descriptionFr,
            nameAr,
            descriptionAr,
            audience,
            photo
        })
        res.status(200).json(partner)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a partner
const deletePartner = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such partner'})
    }
    const partner = await Partner.findOneAndDelete({_id: id})

    if(!partner){
        return res.status(404).json({error: 'no such partner'})
    }

    res.status(200).json(partner)
}

// UPDATE a partner
const updatePartner = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such partner'})
    }
    const partner = await Partner.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!partner){
        return res.status(404).json({error: 'no such partner'})
    }

    res.status(200).json(partner)
}

module.exports = {
    getPartners,
    getPartner,
    createPartner,
    deletePartner,
    updatePartner
}