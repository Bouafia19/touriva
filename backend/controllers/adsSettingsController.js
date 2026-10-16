const AdsSettings = require('../models/AdsSettings')
const mongoose = require('mongoose')

// GET a single adsSettings
const getAdsSettings = async (req, res) => {
    
    const adsSettings = await AdsSettings.find()

    if(!adsSettings){
        return res.status(404).json({error: 'no such adsSettings'})
    }

    res.status(200).json(adsSettings)
}

// POST a new adsSettings
const createAdsSettings = async (req, res) => {
    
    try {
        // add doc to db
        const adsSettings = await AdsSettings.create(req.body)
        res.status(200).json(adsSettings)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// UPDATE a adsSettings
const updateAdsSettings = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such adsSettings'})
    }
   
    const adsSettings = await AdsSettings.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!adsSettings){
        return res.status(404).json({error: 'no such adsSettings'})
    }

    res.status(200).json(adsSettings)
}

// GET 
const getAppImage = async (req, res) => {
    
    const adsSettings = await AdsSettings.find().select('appImage')

    if(!adsSettings){
        return res.status(404).json({error: 'no such adsSettings'})
    }

    res.status(200).json(adsSettings)
}

module.exports = {
    getAdsSettings,
    createAdsSettings,
    updateAdsSettings,
    getAppImage
}