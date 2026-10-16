const Activity = require('../models/Activity')
const mongoose = require('mongoose')

// GET all activities
const getActivities = async (req, res) => {
    const activities = await Activity.find().sort({ createdAt: -1})
    res.status(200).json(activities)
}

// GET a single activity
const getActivity = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such activity'})
    }
    const activity = await Activity.findById(id)

    if(!activity){
        return res.status(404).json({error: 'no such activity'})
    }

    res.status(200).json(activity)
}

// POST a new activity
const createActivity = async (req, res) => {
    const { 
        name
    } = req.body
    console.log('req.body', req.body)
    try {
        // add doc to db
        const activity = await Activity.create({ 
            name
        })
        res.status(200).json(activity)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a activity
const deleteActivity = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such activity'})
    }
    const activity = await Activity.findOneAndDelete({_id: id})

    if(!activity){
        return res.status(404).json({error: 'no such activity'})
    }

    res.status(200).json(activity)
}

// UPDATE a activity
const updateActivity = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such activity'})
    }
    const activity = await Activity.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!activity){
        return res.status(404).json({error: 'no such activity'})
    }

    res.status(200).json(activity)
}

module.exports = {
    getActivities,
    getActivity,
    createActivity,
    deleteActivity,
    updateActivity
}