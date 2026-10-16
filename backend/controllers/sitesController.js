const Site = require('../models/Site')
const mongoose = require('mongoose')

// GET all sites
const getSites = async (req, res) => {
    const sites = await Site.find().sort({ createdAt: -1})
    res.status(200).json(sites)
}

// GET a single site
const getSite = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such site'})
    }
    const site = await Site.findById(id)

    if(!site){
        return res.status(404).json({error: 'no such site'})
    }

    res.status(200).json(site)
}

// POST a new site
const createSite = async (req, res) => {
    const { 
        name
    } = req.body
    
    try {
        // add doc to db
        const site = await Site.create(
            req.body
        )
        res.status(200).json(site)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a site
const deleteSite = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such site'})
    }
    const site = await Site.findOneAndDelete({_id: id})

    if(!site){
        return res.status(404).json({error: 'no such site'})
    }

    res.status(200).json(site)
}

// UPDATE a site
const updateSite = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such site'})
    }
    const site = await Site.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!site){
        return res.status(404).json({error: 'no such site'})
    }

    res.status(200).json(site)
}

const importSites = async (req, res) => {
  try {
    const { sites } = req.body

    if (!Array.isArray(sites)) {
      return res.status(400).json({ message: 'Invalid data' })
    }

    const results = []
    
    for (const h of sites) {
      if (!h.name) continue // skip if no name

      // Avoid duplicates
      const exists = await Site.findOne({ googleId: h.name })
      if (exists) continue

      const site = new Site({
        name: h.displayName?.text || '',
        address: h.formattedAddress || '',
        rating: h.rating || null,
        latitude: h.location?.latitude || null,
        longitude: h.location?.longitude || null,
        photo: h.photos?.length ? h.photos[0].name : null,
        description: h.description || '',
        phone: h.phone || '',
        googleId: h.name || ''
      })

      await site.save()
      results.push(site)
    }

    res.json({ success: true, importedCount: results.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getLocalSite = async (req, res) => {
   try {

    const { lat, lng } = req.body
    console.log('req.body:', req.body)
    console.log('Finding local sites near:', lat, lng)
    const sites = await Site.find({
        googleId: { $exists: false },
        status: 'published',
        location: {
            $geoWithin: {
                $centerSphere: [
                [lng, lat],
                20000 / 6378137
                ]
            }
        },

    }).sort({ createdAt: -1 }).select('name address rating latitude longitude photo description phone')
    console.log('Found local sites:', sites)
    res.status(200).json(sites)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    getSites,
    getSite,
    createSite,
    deleteSite,
    updateSite,
    importSites,
    getLocalSite
}