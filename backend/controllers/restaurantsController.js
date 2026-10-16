const Restaurant = require('../models/Restaurant')
const mongoose = require('mongoose')

// GET all restaurants
const getRestaurants = async (req, res) => {
    const restaurants = await Restaurant.find().sort({ createdAt: -1})
    res.status(200).json(restaurants)
}

// GET a single restaurant
const getRestaurant = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such restaurant'})
    }
    const restaurant = await Restaurant.findById(id)

    if(!restaurant){
        return res.status(404).json({error: 'no such restaurant'})
    }

    res.status(200).json(restaurant)
}

// POST a new restaurant
const createRestaurant = async (req, res) => {
    const { 
        name
    } = req.body
    try {
        // add doc to db
        const restaurant = await Restaurant.create(
            req.body
        )
        res.status(200).json(restaurant)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a restaurant
const deleteRestaurant = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such restaurant'})
    }
    const restaurant = await Restaurant.findOneAndDelete({_id: id})

    if(!restaurant){
        return res.status(404).json({error: 'no such restaurant'})
    }

    res.status(200).json(restaurant)
}

// UPDATE a restaurant
const updateRestaurant = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such restaurant'})
    }
    const restaurant = await Restaurant.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!restaurant){
        return res.status(404).json({error: 'no such restaurant'})
    }

    res.status(200).json(restaurant)
}

const importRestaurants = async (req, res) => {
  try {
    const { restaurants } = req.body

    if (!Array.isArray(restaurants)) {
      return res.status(400).json({ message: 'Invalid data' })
    }

    const results = []
    
    for (const h of restaurants) {
      if (!h.name) continue // skip if no name

      // Avoid duplicates
      const exists = await Restaurant.findOne({ googleId: h.name })
      if (exists) continue

      const restaurant = new Restaurant({
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

      await restaurant.save()
      results.push(restaurant)
    }

    res.json({ success: true, importedCount: results.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getLocalRestaurant = async (req, res) => {
   try {

    const { lat, lng } = req.body
    console.log('req.body:', req.body)
    console.log('Finding local restaurants near:', lat, lng)
    const restaurants = await Restaurant.find({
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
    console.log('Found local restaurants:', restaurants)
    res.status(200).json(restaurants)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

module.exports = {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    deleteRestaurant,
    updateRestaurant,
    importRestaurants,
    getLocalRestaurant
}