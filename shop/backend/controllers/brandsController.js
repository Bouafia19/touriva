const Brand = require('../models/Brand')
const mongoose = require('mongoose')

// GET all brands
const getBrands = async (req, res) => {
    const brands = await Brand.find().sort({ createdAt: -1})
    res.status(200).json(brands)
}

// GET a single brand
const getBrand = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such brand'})
    }
    const brand = await Brand.findById(id)

    if(!brand){
        return res.status(404).json({error: 'no such brand'})
    }

    res.status(200).json(brand)
}

// POST a new brand
const createBrand = async (req, res) => {
    try {
        // add doc to db
        const brand = await Brand.create(req.body)
        res.status(200).json(brand)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a brand
const deleteBrand = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such brand'})
    }
    const brand = await Brand.findOneAndDelete({_id: id})

    if(!brand){
        return res.status(404).json({error: 'no such brand'})
    }

    res.status(200).json(brand)
}

// UPDATE a brand
const updateBrand = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such brand'})
    }
    const brand = await Brand.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!brand){
        return res.status(404).json({error: 'no such brand'})
    }

    res.status(200).json(brand)
}

module.exports = {
    getBrands,
    getBrand,
    createBrand,
    deleteBrand,
    updateBrand
}