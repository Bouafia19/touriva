const Hotel = require('../models/Hotel')
const mongoose = require('mongoose')

// GET all hotels
const getHotels = async (req, res) => {
    const hotels = await Hotel.find().sort({ createdAt: -1})
    res.status(200).json(hotels)
}

// GET a single hotel
const getHotel = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such hotel'})
    }
    const hotel = await Hotel.findById(id)

    if(!hotel){
        return res.status(404).json({error: 'no such hotel'})
    }

    res.status(200).json(hotel)
}

// POST a new hotel
const createHotel = async (req, res) => {
    const { 
        name
    } = req.body
    
    try {
        // add doc to db
        const hotel = await Hotel.create(
            req.body
        )
        res.status(200).json(hotel)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a hotel
const deleteHotel = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such hotel'})
    }
    const hotel = await Hotel.findOneAndDelete({_id: id})

    if(!hotel){
        return res.status(404).json({error: 'no such hotel'})
    }

    res.status(200).json(hotel)
}

// UPDATE a hotel
const updateHotel = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such hotel'})
    }
    const hotel = await Hotel.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!hotel){
        return res.status(404).json({error: 'no such hotel'})
    }

    res.status(200).json(hotel)
}

const importHotels = async (req, res) => {
  try {
    const { hotels } = req.body

    if (!Array.isArray(hotels)) {
      return res.status(400).json({ message: 'Invalid data' })
    }

    const results = []
    
    for (const h of hotels) {
        
      if (!h.name) continue // skip if no name

      // Avoid duplicates
      const exists = await Hotel.findOne({ googleId: h.name })
      if (exists) continue

      const hotel = new Hotel({
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

      await hotel.save()
      results.push(hotel)
    }

    res.json({ success: true, importedCount: results.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

const getLocalHotels = async (req, res) => {
   try {

    const { lat, lng } = req.body
    console.log('req.body:', req.body)
    console.log('Finding local hotels near:', lat, lng)
    const hotels = await Hotel.find({
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

    })
    .sort({ createdAt: -1 }).select('name address rating latitude longitude photo description phone')
    console.log('Found local hotels:', hotels)
    res.status(200).json(hotels)

    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}


module.exports = {
    getHotels,
    getHotel,
    createHotel,
    deleteHotel,
    updateHotel,
    importHotels,
    getLocalHotels
}