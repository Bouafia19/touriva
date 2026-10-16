const Formation = require('../models/Formation')
const mongoose = require('mongoose')

// GET all formations
const getFormations = async (req, res) => {
    const formations = await Formation.find().sort({ createdAt: -1})
    res.status(200).json(formations)
}

// GET a single formation
const getFormation = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such formation'})
    }
    const formation = await Formation.findById(id)

    if(!formation){
        return res.status(404).json({error: 'no such formation'})
    }

    res.status(200).json(formation)
}

// POST a new formation
const createFormation = async (req, res) => {
    const { 
        name,
        description,
        nameFr,
        descriptionFr,
        nameAr,
        descriptionAr,
        audience,
        photo,
        file,
        price,
        duration
    } = req.body
    try {
        // add doc to db
        const formation = await Formation.create({ 
            name,
            description,
            nameFr,
            descriptionFr,
            nameAr,
            descriptionAr,
            audience,
            photo,
            file,
            price,
        duration
        })
        res.status(200).json(formation)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a formation
const deleteFormation = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such formation'})
    }
    const formation = await Formation.findOneAndDelete({_id: id})

    if(!formation){
        return res.status(404).json({error: 'no such formation'})
    }

    res.status(200).json(formation)
}

// UPDATE a formation
const updateFormation = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such formation'})
    }
    const formation = await Formation.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!formation){
        return res.status(404).json({error: 'no such formation'})
    }

    res.status(200).json(formation)
}

module.exports = {
    getFormations,
    getFormation,
    createFormation,
    deleteFormation,
    updateFormation
}