const { generateTripAI } = require('../services/aiTripGenerator')
const Trip = require('../models/Trip')

const createTripWithAI = async (req, res) => {
  try {
    const { city, days, budget, preferences, creator, hotels, restaurants, sites } = req.body

    const aiTrip = await generateTripAI({
      city,
      days,
      budget,
      preferences: preferences || [],
      hotels: hotels || [],
      restaurants: restaurants || [],
      sites: sites || []
    })

    const trip = await Trip.create({
      ...aiTrip,
      creator
    })

    res.status(201).json(trip)
  } catch (error) {
    console.error('AI trip error:', error)
    res.status(500).json({ message: 'AI trip generation failed', error: error.message })
  }
}

module.exports = {
  createTripWithAI
}
