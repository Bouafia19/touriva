const Daira = require('../models/Daira')
const mongoose = require('mongoose')

// GET all dairas
const getDairas = async (req, res) => {
    const dairas = await Daira.find({}, 'name wilayaId').sort({ createdAt: -1})
    res.status(200).json(dairas)
}

// GET a single daira
const getDaira = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such daira'})
    }
    const daira = await Daira.findById(id)

    if(!daira){
        return res.status(404).json({error: 'no such daira'})
    }

    res.status(200).json(daira)
}

// POST a new daira
const createDaira = async (req, res) => {
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
        const daira = await Daira.create({ 
            name,
            description,
            nameFr,
            descriptionFr,
            nameAr,
            descriptionAr,
            audience,
            photo
        })
        res.status(200).json(daira)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a daira
const deleteDaira = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such daira'})
    }
    const daira = await Daira.findOneAndDelete({_id: id})

    if(!daira){
        return res.status(404).json({error: 'no such daira'})
    }

    res.status(200).json(daira)
}

// UPDATE a daira
const updateDaira = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such daira'})
    }
    const daira = await Daira.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!daira){
        return res.status(404).json({error: 'no such daira'})
    }

    res.status(200).json(daira)
}

module.exports = {
    getDairas,
    getDaira,
    createDaira,
    deleteDaira,
    updateDaira
}