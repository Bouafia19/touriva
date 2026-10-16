const Plan = require('../models/Plan')
const mongoose = require('mongoose')

// GET all plans
const getPlans = async (req, res) => {
    const plans = await Plan.find().sort({ createdAt: -1})
    res.status(200).json(plans)
}

// GET a single plan
const getPlan = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such plan'})
    }
    const plan = await Plan.findById(id)

    if(!plan){
        return res.status(404).json({error: 'no such plan'})
    }

    res.status(200).json(plan)
}

// POST a new plan
const createPlan = async (req, res) => {
    const { 
        title,
        price,
        description,
        duration
    } = req.body
    console.log('req.body', req.body)
    try {
        // add doc to db
        const plan = await Plan.create({ 
            title,
            price,
            description,
            duration
        })
        res.status(200).json(plan)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a plan
const deletePlan = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such plan'})
    }
    const plan = await Plan.findOneAndDelete({_id: id})

    if(!plan){
        return res.status(404).json({error: 'no such plan'})
    }

    res.status(200).json(plan)
}

// UPDATE a plan
const updatePlan = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such plan'})
    }
    const plan = await Plan.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!plan){
        return res.status(404).json({error: 'no such plan'})
    }

    res.status(200).json(plan)
}

module.exports = {
    getPlans,
    getPlan,
    createPlan,
    deletePlan,
    updatePlan
}