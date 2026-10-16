import { generateTripAI } from '../services/aiTripGenerator.js'
import Trip from '../models/Trip.js'

export const createTripWithAI = async (req, res) => {
  try {
    const { city, days, budget, preferences, creator, destination, hotels, restaurants, sites } = req.body

    

    const aiTrip = await generateTripAI({
      city,
      days,
      budget,
      preferences,
      creator,
      // destination,
      hotels,
      restaurants,
      sites
    })
    console.log('AI Trip Generated:', aiTrip)
    const trip = await Trip.create({
      ...aiTrip,
      creator,
      // destination
    })

    res.status(201).json(trip)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'AI trip generation failed' })
  }
}
