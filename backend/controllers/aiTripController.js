const { generateTripAIResult } = require('../services/aiTripGenerator')
const Trip = require('../models/Trip')

const createTripWithAI = async (req, res) => {
  try {
    const {
      city,
      days,
      budget,
      partyType,
      preferences,
      hotels,
      restaurants,
      sites,
      startDate,
      endDate,
      theme
    } = req.body

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({ message: 'Destination city is required for AI trip generation.' })
    }

    // Resolve creator ID strictly from authenticated user session
    const creatorId = req.user?._id || req.body.creator
    if (!creatorId) {
      return res.status(401).json({ message: 'User must be authenticated to generate and save a trip.' })
    }

    const { trip: aiTrip, provider, model } = await generateTripAIResult({
      city: city.trim(),
      days: parseInt(days, 10) || 3,
      budget: budget || 'medium',
      partyType: partyType || 'Solo',
      preferences: Array.isArray(preferences) ? preferences : [],
      hotels: Array.isArray(hotels) ? hotels : [],
      restaurants: Array.isArray(restaurants) ? restaurants : [],
      sites: Array.isArray(sites) ? sites : [],
      startDate,
      endDate,
      theme,
      creator: creatorId
    })

    const trip = await Trip.create({
      ...aiTrip,
      creator: creatorId
    })

    const populatedTrip = await Trip.findById(trip._id)
      .populate('creator', '_id firstName lastName companyName phone typeAccount')
      .populate('destination', '_id name nameFr nameAr')

    // Set provider transparency headers
    res.setHeader('X-AI-Provider', provider)
    if (model) res.setHeader('X-AI-Model', model)

    // Attach provider transparency property in response JSON without polluting DB schema
    const responseData = populatedTrip ? populatedTrip.toObject() : trip.toObject()
    responseData.aiProvider = provider
    responseData.aiModel = model

    res.status(201).json(responseData)
  } catch (error) {
    console.error('AI trip generation error:', error)
    res.status(500).json({ message: 'AI trip generation failed', error: error.message })
  }
}

module.exports = {
  createTripWithAI
}
