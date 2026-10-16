const Term = require('../models/Term')
const mongoose = require('mongoose')

// GET all terms
const getTerms = async (req, res) => {
    const terms = await Term.find().sort({ order: 1})
    res.status(200).json(terms)
}

// GET a single term
const getTerm = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such term'})
    }
    const term = await Term.findById(id)

    if(!term){
        return res.status(404).json({error: 'no such term'})
    }

    res.status(200).json(term)
}

// POST a new term
const createTerm = async (req, res) => {
    const { 
        order,
        title,
        text
    } = req.body
    try {
        // add doc to db
        const term = await Term.create({ 
            order,
            title,
            text
        })
        res.status(200).json(term)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a term
const deleteTerm = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such term'})
    }
    const term = await Term.findOneAndDelete({_id: id})

    if(!term){
        return res.status(404).json({error: 'no such term'})
    }

    res.status(200).json(term)
}

// UPDATE a term
const updateTerm = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such term'})
    }
    const term = await Term.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!term){
        return res.status(404).json({error: 'no such term'})
    }

    res.status(200).json(term)
}

module.exports = {
    getTerms,
    getTerm,
    createTerm,
    deleteTerm,
    updateTerm
}