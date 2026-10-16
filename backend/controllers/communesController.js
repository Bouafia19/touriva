const Commune = require('../models/Commune')
const mongoose = require('mongoose')

// GET all communes
const getCommunes = async (req, res) => {
    const communes = await Commune.find({}, 'name dairaId').sort({ createdAt: -1})
    res.status(200).json(communes)
}

// GET a single commune
const getCommune = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such commune'})
    }
    const commune = await Commune.findById(id)

    if(!commune){
        return res.status(404).json({error: 'no such commune'})
    }

    res.status(200).json(commune)
}

// POST a new commune
const createCommune = async (req, res) => {
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
        const commune = await Commune.create({ 
            name,
            description,
            nameFr,
            descriptionFr,
            nameAr,
            descriptionAr,
            audience,
            photo
        })
        res.status(200).json(commune)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a commune
const deleteCommune = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such commune'})
    }
    const commune = await Commune.findOneAndDelete({_id: id})

    if(!commune){
        return res.status(404).json({error: 'no such commune'})
    }

    res.status(200).json(commune)
}

// UPDATE a commune
const updateCommune = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such commune'})
    }
    const commune = await Commune.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!commune){
        return res.status(404).json({error: 'no such commune'})
    }

    res.status(200).json(commune)
}

module.exports = {
    getCommunes,
    getCommune,
    createCommune,
    deleteCommune,
    updateCommune
}