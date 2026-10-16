const Company = require('../models/Company')
const mongoose = require('mongoose')

// GET a single company
const getCompany = async (req, res) => {
    
    const company = await Company.find()

    if(!company){
        return res.status(404).json({error: 'no such company'})
    }

    res.status(200).json(company)
}

// POST a new company
const createCompany = async (req, res) => {
    
    try {
        // add doc to db
        const company = await Company.create(req.body)
        res.status(200).json(company)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE a company
const updateCompany = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such company'})
    }
   
    const company = await Company.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!company){
        return res.status(404).json({error: 'no such company'})
    }

    res.status(200).json(company)
}

// GET 
const getAppImage = async (req, res) => {
    
    const company = await Company.find().select('appImage')

    if(!company){
        return res.status(404).json({error: 'no such company'})
    }

    res.status(200).json(company)
}

module.exports = {
    getCompany,
    createCompany,
    updateCompany,
    getAppImage
}