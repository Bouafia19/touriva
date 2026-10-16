const Publication = require('../models/Publication')
const User = require('../models/User')
const mongoose = require('mongoose')

// GET all publications
const getPublications = async (req, res) => {
    const publications = await Publication.find().sort({ createdAt: -1})
    .populate({
        path: 'ownerId',
        model: 'User',
        select: '_id firstName lastName phone'
    })
    .populate({
        path: 'categoryId',
        model: 'Category',
        select: '_id name'
    })
    res.status(200).json(publications)
}

// GET a single trip
const getPublication = async (req, res) => {

    const { id } = req.params
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }

    try {
        
        const publication = await Publication.find({ clientId: id })
        .populate({
            path: 'ownerId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'categoryId',
            model: 'Category',
            select: '_id name'
        })
        res.status(200).json(publication)
        
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    
    // if(!trip){
    //     return res.status(404).json({error: 'no such trip'})
    // }
}

// POST a new trip
const createPublication = async (req, res) => {
    const { 
        ownerId,
        title,
        description
    } = req.body
    
    try {
        const publication = await Publication.create({ 
            ownerId,
            title,
            description
        })

        try {
            
            
        } catch (error) {
            console.log('error', error)
            res.error(error)
        }
        
    } catch (error) {
        res.status(400).json({ error: error.message })
    }

    
}
// DELETE a trip
const deletePublication = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    const trip = await Publication.findOneAndDelete({_id: id})

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

// UPDATE a trip
const updatePublication = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    
    const trip = await Publication.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

const confirmePublication = async (req, res) => {

    try {
        // add doc to db
        const trip = await Publication.create(req.body)
        const result = await Publication.findById(trip._id)
        .populate({
            path: 'clientId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'userId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getOnePublication = async (req, res) => {
    const {id} = req.params
    try {
        // add doc to db
        const result = await Publication.findById(id)
        .populate({
            path: 'ownerId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'categoryId',
            model: 'Category',
            select: '_id name'
        })
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const getPublicationsByCategoryId = async (req, res) => {
    const {categoryId} = req.params

    let date_now = new Date()
    
    try {
        // add doc to db
        const publications = await Publication.find({ categoryId: categoryId, start: { $gt: date_now }, finished: false })
        .populate({
            path: 'clientId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'userId',
            model: 'User',
            select: '_id firstName lastName phone'
        })
        .populate({
            path: 'categoryId',
            model: 'Category',
            select: '_id name'
        })
        res.status(200).json(publications)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const updateAnnulationOfPublication = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such trip'})
    }
    const trip = await Publication.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!trip){
        return res.status(404).json({error: 'no such trip'})
    }

    res.status(200).json(trip)
}

const getPublicationsByUserId = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such professional'})
    }

    const publications = await Publication.find({ userId: id, finished: true, paid: false})
    .populate({
        path: 'clientId',
        model: 'User',
        select: '_id firstName lastName phone'
    })
    .populate({
        path: 'userId',
        model: 'User',
        select: '_id firstName lastName phone'
    })
    
    res.status(200).json(publications)
}

module.exports = {
    getPublications,
    getPublication,
    createPublication,
    deletePublication,
    confirmePublication,
    getOnePublication,
    updatePublication,
    getPublicationsByCategoryId,
    updateAnnulationOfPublication,
    getPublicationsByUserId,
    // getPublicationsByCategoryIdNoImages
}