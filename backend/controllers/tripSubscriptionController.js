const TripSubscription = require('../models/TripSubscription')

// CREATE subscription
const subscribeToTrip = async (req, res) => {
  try {
    const { tripId, fullName, phone } = req.body

    if (!tripId || !fullName || !phone) {
      return res.status(400).json({ message: 'tripId, fullName and phone are required' })
    }

    const subscription = await TripSubscription.create({
      trip: tripId,
      fullName,
      phone
    })

    res.status(201).json(subscription)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Subscription failed', error: error.message })
  }
}

// ADMIN: get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const result = await TripSubscription.aggregate([
      // Join Trip collection
      {
        $lookup: {
          from: 'trips',
          localField: 'trip',
          foreignField: '_id',
          as: 'trip'
        }
      },
      // Trip is an array → unwrap it
      { $unwind: '$trip' },
      // Sort subscriptions (newest first)
      { $sort: { createdAt: -1 } },
      // Group by trip name
      {
        $group: {
          _id: '$trip.name',
          subscriptions: {
            $push: {
              _id: '$_id',
              fullName: '$fullName',
              phone: '$phone',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              trip: {
                _id: '$trip._id',
                name: '$trip.name'
              }
            }
          }
        }
      },
      // Final shape
      {
        $project: {
          _id: 0,
          name: '$_id',
          subscriptions: 1
        }
      }
    ])

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch subscriptions' })
  }
}

const getTripSubscriptions = async (req, res) => {
  try {
    const { tripId } = req.params

    const subscriptions = await TripSubscription.find({ trip: tripId })
      .populate('trip', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      name: subscriptions[0]?.trip?.name || "Trip Subscriptions",
      subscriptions: subscriptions
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch trips' })
  }
}

module.exports = {
  subscribeToTrip,
  getAllSubscriptions,
  getTripSubscriptions
}
