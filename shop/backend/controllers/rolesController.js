const Role = require('../models/Role')
const mongoose = require('mongoose')

// GET all roles
const getRoles = async (req, res) => {
    const roles = await Role.find().sort({ order: 1})
    res.status(200).json(roles)
}

// GET a single role
const getRole = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such role'})
    }
    const role = await Role.findById(id)

    if(!role){
        return res.status(404).json({error: 'no such role'})
    }

    res.status(200).json(role)
}

// POST a new role
const createRole = async (req, res) => {
    
    try {
        // add doc to db
        const role = await Role.create(req.body)
        res.status(200).json(role)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}
// DELETE a role
const deleteRole = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such role'})
    }
    const role = await Role.findOneAndDelete({_id: id})

    if(!role){
        return res.status(404).json({error: 'no such role'})
    }

    res.status(200).json(role)
}

// UPDATE a role
const updateRole = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such role'})
    }
    const role = await Role.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!role){
        return res.status(404).json({error: 'no such role'})
    }

    res.status(200).json(role)
}

module.exports = {
    getRoles,
    getRole,
    createRole,
    deleteRole,
    updateRole
}