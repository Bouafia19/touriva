const Trip = require('../models/Trip')

// GET all trips
const getTrips = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }
    if (req.query.published !== undefined) {
      filter.published = req.query.published === 'true'
    }
    if (req.query.destination) {
      filter.destination = req.query.destination
    }

    const trips = await Trip.find(filter).sort({ createdAt: -1 })
      .populate({
        path: 'creator',
        model: 'User',
        select: '_id firstName lastName companyName phone typeAccount fileStatus'
      })
      .populate({
        path: 'destination',
        model: 'Wilaya',
        select: '_id name'
      })
    res.json(trips)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trips', error: error.message })
  }
}

// GET trip by ID
const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('creator', '_id firstName lastName companyName phone typeAccount fileStatus')
      .populate('destination', '_id name')
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    res.json(trip)
  } catch (error) {
    res.status(400).json({ message: 'Invalid ID' })
  }
}

// CREATE trip
const createTrip = async (req, res) => {
  try {
    // Verification enforcement: partner agencies must be confirmed by administrator before publishing trips
    if (req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies' && req.user.fileStatus !== 'confirmed') {
      const status = req.user.fileStatus || 'created'
      return res.status(403).json({
        error: 'Access forbidden: Agency account verification is required before publishing trips',
        fileStatus: status,
        rejectionReason: req.user.rejectionReason || null
      })
    }

    const tripPayload = {
      ...req.body,
      creator: req.user.role === 'administrator' && req.body.creator ? req.body.creator : req.user._id
    }
    const trip = await Trip.create(tripPayload)
    res.status(201).json(trip)
  } catch (error) {
    res.status(400).json({ message: 'Trip creation failed', error: error.message })
  }
}

const updateTrip = async (req, res) => {
  try {
    const { id } = req.params

    const existingTrip = await Trip.findById(id)
    if (!existingTrip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Ownership check: must be trip creator or administrator
    const isOwner = existingTrip.creator && existingTrip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: You can only update your own trips' })
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json(updatedTrip)
  } catch (error) {
    console.error('Update trip error:', error)
    res.status(500).json({ message: 'Failed to update trip' })
  }
}

const getTripsByUser = async (req, res) => {
  try {
    const { userId } = req.params

    const isSelf = req.user._id.toString() === userId
    const isAdmin = req.user.role === 'administrator'
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: Access to user trips restricted' })
    }

    const trips = await Trip.find({ creator: userId })
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

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params

    const existingTrip = await Trip.findById(id)
    if (!existingTrip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    // Ownership check: must be trip creator or administrator
    const isOwner = existingTrip.creator && existingTrip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own trips' })
    }

    await Trip.findByIdAndDelete(id)
    res.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Delete trip error:', error)
    res.status(500).json({ message: 'Failed to delete trip' })
  }
}

module.exports = {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  getTripsByUser,
  deleteTrip
}
