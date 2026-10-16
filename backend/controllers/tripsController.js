import Trip from '../models/Trip.js'

// GET all trips
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 }).populate("creator").populate("destination")
    .populate({
        path: 'creator',
        model: 'User',
        select: '_id firstName lastName companyName phone typeAccount'
    })
    .populate({
        path: 'destination',
        model: 'Wilaya',
        select: '_id name'
    })
    res.json(trips)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips' })
  }
}

// GET trip by ID
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    res.json(trip)
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID' })
  }
}

// CREATE trip
export const createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body)
    res.status(201).json(trip)
  } catch (error) {
    res.status(400).json({ message: 'Trip creation failed', error })
  }
}

export const updateTrip = async (req, res) => {
  try {
    const { id } = req.params

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!updatedTrip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    res.json(updatedTrip)
  } catch (error) {
    console.error('Update trip error:', error)
    res.status(500).json({ message: 'Failed to update trip' })
  }
}

export const getTripsByUser = async (req, res) => {
  try {
    const { userId } = req.params

    const trips = await Trip.find({ creator: userId }).populate("creator")
    .populate({
      path: 'creator',
      model: 'User',
      select: '_id firstName lastName companyName phone typeAccount'
    })
    .sort({ createdAt: -1 })

    res.status(200).json(trips)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch trips' })
  }
}

export const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params

    const deletedTrip = await Trip.findByIdAndDelete(id)

    if (!deletedTrip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    res.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Delete trip error:', error)
    res.status(500).json({ message: 'Failed to delete trip' })
  }
}
