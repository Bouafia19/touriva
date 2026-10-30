const mongoose = require('mongoose')
const Trip = require('../models/Trip')
const TripDeparture = require('../models/TripDeparture')
const TripBooking = require('../models/TripBooking')
const TripEnquiry = require('../models/TripEnquiry')
const User = require('../models/User')
const { recalculateBookingFinancials, validateDepositConfig } = require('../utils/financialCalculator')

/**
 * GET /api/agency/profile
 * Returns agency accreditation status, contact info, and operational metrics.
 */
const getAgencyProfile = async (req, res) => {
  try {
    const isAgency = req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies'
    const isAdmin = req.user.role === 'administrator'

    if (!isAgency && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Tourism agency account required' })
    }

    const agencyId = req.user._id

    // Aggregate statistics
    const [packagesCount, publishedPackagesCount, activeDeparturesCount, bookedAggregation, pendingBookingsCount, pendingEnquiriesCount] = await Promise.all([
      Trip.countDocuments({ creator: agencyId }),
      Trip.countDocuments({ creator: agencyId, status: 'published' }),
      TripDeparture.countDocuments({
        agency: agencyId,
        status: { $in: ['scheduled', 'guaranteed'] },
        startDate: { $gte: new Date(Date.now() - 3600000) }
      }),
      TripDeparture.aggregate([
        { $match: { agency: agencyId } },
        { $group: { _id: null, totalBooked: { $sum: '$bookedSeats' } } }
      ]),
      TripBooking.countDocuments({ agency: agencyId, status: 'pending' }),
      TripEnquiry.countDocuments({ agency: agencyId, status: 'requested' })
    ])

    const totalBookedTravelers = bookedAggregation[0]?.totalBooked || 0

    res.status(200).json({
      agency: {
        _id: req.user._id,
        email: req.user.email,
        companyName: req.user.companyName,
        phone: req.user.phone,
        fileStatus: req.user.fileStatus,
        rejectionReason: req.user.rejectionReason,
        role: req.user.role,
        typeAccount: req.user.typeAccount,
        isVerified: req.user.fileStatus === 'confirmed'
      },
      metrics: {
        packagesCount,
        publishedPackagesCount,
        activeDeparturesCount,
        totalBookedTravelers,
        totalPackages: packagesCount,
        scheduledDepartures: activeDeparturesCount,
        pendingBookingsCount,
        pendingEnquiriesCount
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve agency profile', details: error.message })
  }
}

/**
 * GET /api/agency/packages
 * Lists all excursion packages created by the authenticated agency.
 */
const getAgencyPackages = async (req, res) => {
  try {
    const isAgency = req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies'
    const isAdmin = req.user.role === 'administrator'

    if (!isAgency && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Tourism agency account required' })
    }

    const query = {
      creator: isAdmin && req.query.agency ? req.query.agency : req.user._id
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    const packages = await Trip.find(query)
      .populate('destination', 'name _id code')
      .sort({ createdAt: -1 })
      .lean()

    // Attach active departure count to each package
    const packageIds = packages.map(p => p._id)
    const departureCounts = await TripDeparture.aggregate([
      {
        $match: {
          trip: { $in: packageIds },
          status: { $in: ['scheduled', 'guaranteed'] },
          startDate: { $gte: new Date(Date.now() - 3600000) }
        }
      },
      {
        $group: {
          _id: '$trip',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          totalBooked: { $sum: '$bookedSeats' }
        }
      }
    ])

    const departureMap = {}
    departureCounts.forEach(d => {
      departureMap[d._id.toString()] = d
    })

    const enriched = packages.map(pkg => ({
      ...pkg,
      activeDeparturesCount: departureMap[pkg._id.toString()]?.count || 0,
      totalCapacity: departureMap[pkg._id.toString()]?.totalCapacity || 0,
      totalBooked: departureMap[pkg._id.toString()]?.totalBooked || 0
    }))

    res.status(200).json(enriched)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agency packages', details: error.message })
  }
}

/**
 * POST /api/agency/packages
 * Creates a new excursion package owned by the authenticated agency.
 */
const createAgencyPackage = async (req, res) => {
  try {
    const { name, destination, price, description, inclusions, exclusions, cancellationPolicy, meetingPoint, durationDays, theme, items, image, photos } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Package name is required' })
    }

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Valid non-negative price in DZD is required' })
    }

    const safeDuration = Number(durationDays) || (items && items.length) || 1

    if (req.body.requiresDeposit) {
      const depositValidation = validateDepositConfig({
        requiresDeposit: true,
        depositType: req.body.depositType,
        depositAmountDZD: req.body.depositAmountDZD,
        depositPercentage: req.body.depositPercentage,
        paymentDueDaysBeforeDeparture: req.body.paymentDueDaysBeforeDeparture,
        price: numPrice
      })
      if (!depositValidation.isValid) {
        return res.status(400).json({ error: depositValidation.error })
      }
    }

    const status = req.body.status === 'published' ? 'published' : 'created'
    const published = status === 'published'

    const newTrip = await Trip.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      creator: req.user._id,
      destination: destination || null,
      image: image || '',
      photos: Array.isArray(photos) ? photos : [],
      price: String(numPrice),
      durationDays: safeDuration,
      theme: theme || 'Circuit & Découverte',
      inclusions: Array.isArray(inclusions) ? inclusions.map(i => String(i).trim()).filter(Boolean) : [],
      exclusions: Array.isArray(exclusions) ? exclusions.map(e => String(e).trim()).filter(Boolean) : [],
      cancellationPolicy: cancellationPolicy ? cancellationPolicy.trim() : '',
      meetingPoint: meetingPoint ? meetingPoint.trim() : '',
      days: Array.from({ length: safeDuration }, (_, i) => i + 1),
      items: Array.isArray(items) ? items : [],
      requiresDeposit: Boolean(req.body.requiresDeposit),
      depositType: ['fixed', 'percentage'].includes(req.body.depositType) ? req.body.depositType : 'percentage',
      depositAmountDZD: Number(req.body.depositAmountDZD) || 0,
      depositPercentage: Number(req.body.depositPercentage) || 0,
      paymentDueDaysBeforeDeparture: req.body.paymentDueDaysBeforeDeparture !== undefined ? Number(req.body.paymentDueDaysBeforeDeparture) : 2,
      status,
      published
    })

    const populated = await Trip.findById(newTrip._id).populate('destination', 'name _id')
    res.status(201).json(populated)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create package', details: error.message })
  }
}

/**
 * GET /api/agency/packages/:id
 * Retrieves an agency package along with its full departures roster.
 */
const getAgencyPackageById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const trip = await Trip.findById(id).populate('destination', 'name _id code')
    if (!trip) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const isOwner = trip.creator && trip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot access another agency\'s package' })
    }

    const departures = await TripDeparture.find({ trip: id }).sort({ startDate: 1 })

    res.status(200).json({
      package: trip,
      departures
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package', details: error.message })
  }
}

/**
 * PATCH /api/agency/packages/:id
 * Updates package details and status (published, paused, archived).
 */
const updateAgencyPackage = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const trip = await Trip.findById(id)
    if (!trip) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const isOwner = trip.creator && trip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s package' })
    }

    const updates = { ...req.body }
    // Prevent tampering with ownership
    delete updates.creator
    delete updates._id

    // Verification check if attempting to publish
    if (updates.status === 'published' || updates.published === true) {
      if (req.user.role === 'partner' && req.user.fileStatus !== 'confirmed') {
        return res.status(403).json({
          error: 'Access forbidden: Agency accreditation documents must be confirmed before publishing packages',
          fileStatus: req.user.fileStatus
        })
      }
      updates.published = true
      updates.status = 'published'
    } else if (updates.status === 'paused' || updates.status === 'archived' || updates.status === 'created') {
      updates.published = false
    }

    if (updates.price !== undefined) {
      const numPrice = Number(updates.price)
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ error: 'Price must be a valid non-negative number' })
      }
      updates.price = String(numPrice)
    }

    if (updates.requiresDeposit !== undefined || updates.depositAmountDZD !== undefined || updates.depositPercentage !== undefined) {
      const depositValidation = validateDepositConfig({
        requiresDeposit: updates.requiresDeposit !== undefined ? updates.requiresDeposit : trip.requiresDeposit,
        depositType: updates.depositType || trip.depositType,
        depositAmountDZD: updates.depositAmountDZD !== undefined ? updates.depositAmountDZD : trip.depositAmountDZD,
        depositPercentage: updates.depositPercentage !== undefined ? updates.depositPercentage : trip.depositPercentage,
        paymentDueDaysBeforeDeparture: updates.paymentDueDaysBeforeDeparture !== undefined ? updates.paymentDueDaysBeforeDeparture : trip.paymentDueDaysBeforeDeparture,
        price: updates.price !== undefined ? Number(updates.price) : Number(trip.price)
      })
      if (!depositValidation.isValid) {
        return res.status(400).json({ error: depositValidation.error })
      }
    }

    const updated = await Trip.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('destination', 'name _id')

    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update package', details: error.message })
  }
}

/**
 * DELETE /api/agency/packages/:id
 * Safely deletes a package if no booked departures exist, otherwise requires archiving.
 */
const deleteAgencyPackage = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const trip = await Trip.findById(id)
    if (!trip) {
      return res.status(404).json({ error: 'Package not found' })
    }

    const isOwner = trip.creator && trip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot delete another agency\'s package' })
    }

    const bookedCount = await TripDeparture.countDocuments({
      trip: id,
      bookedSeats: { $gt: 0 }
    })

    if (bookedCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete package with active traveler bookings. Please pause or archive the package instead.'
      })
    }

    // Clean up unbooked departures for this trip
    await TripDeparture.deleteMany({ trip: id })
    await Trip.findByIdAndDelete(id)

    res.status(200).json({ message: 'Package and scheduled departures deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package', details: error.message })
  }
}

/**
 * GET /api/agency/departures
 * Lists scheduled departures for the authenticated agency.
 */
const getAgencyDepartures = async (req, res) => {
  try {
    const isAgency = req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies'
    const isAdmin = req.user.role === 'administrator'

    if (!isAgency && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Tourism agency account required' })
    }

    const query = {
      agency: isAdmin && req.query.agency ? req.query.agency : req.user._id
    }

    if (req.query.trip && mongoose.Types.ObjectId.isValid(req.query.trip)) {
      query.trip = req.query.trip
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    if (req.query.upcoming === 'true') {
      query.startDate = { $gte: new Date(Date.now() - 3600000) }
    }

    const departures = await TripDeparture.find(query)
      .populate({
        path: 'trip',
        select: 'name destination price image status durationDays',
        populate: { path: 'destination', select: 'name' }
      })
      .sort({ startDate: 1 })

    res.status(200).json(departures)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departures', details: error.message })
  }
}

/**
 * POST /api/agency/departures
 * Creates a scheduled departure for an agency-owned trip package.
 */
const createAgencyDeparture = async (req, res) => {
  try {
    const tripId = req.body.trip || req.body.tripId
    const { startDate, endDate, priceDZD, capacity, minGroupSize, meetingPoint, departureInstructions } = req.body

    if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ error: 'Valid trip package ID is required' })
    }

    const trip = await Trip.findById(tripId)
    if (!trip) {
      return res.status(404).json({ error: 'Associated trip package not found' })
    }

    // Enforce trip ownership: only the agency that owns the trip can schedule departures
    const isOwner = trip.creator && trip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot schedule departures for another agency\'s trip' })
    }

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both departure start date and return end date are required' })
    }

    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format provided' })
    }

    if (end < start) {
      return res.status(400).json({ error: 'Return date cannot be earlier than departure date' })
    }

    // Validate numeric values
    const numPrice = Number(priceDZD)
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Price in DZD must be a non-negative number' })
    }

    const numCapacity = Number(capacity)
    if (isNaN(numCapacity) || numCapacity < 1) {
      return res.status(400).json({ error: 'Capacity must be at least 1 passenger seat' })
    }

    const numMinGroup = Number(minGroupSize) || 1

    const departure = await TripDeparture.create({
      trip: tripId,
      agency: req.user._id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priceDZD: numPrice,
      capacity: numCapacity,
      bookedSeats: 0,
      minGroupSize: numMinGroup,
      meetingPoint: meetingPoint ? meetingPoint.trim() : (trip.meetingPoint || ''),
      departureInstructions: departureInstructions ? departureInstructions.trim() : '',
      status: 'scheduled'
    })

    const populated = await TripDeparture.findById(departure._id).populate('trip', 'name destination image')
    res.status(201).json(populated)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create departure', details: error.message })
  }
}

/**
 * PATCH /api/agency/departures/:id
 * Updates scheduled departure details with capacity invariance protection.
 */
const updateAgencyDeparture = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const departure = await TripDeparture.findById(id)
    if (!departure) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const isOwner = departure.agency && departure.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s departure' })
    }

    const updates = { ...req.body }
    // Prevent tampering with ownership, trip association, or booking counters
    delete updates.agency
    delete updates.trip
    delete updates.bookedSeats
    delete updates._id

    // Check capacity reduction constraint
    if (updates.capacity !== undefined) {
      const newCap = Number(updates.capacity)
      if (isNaN(newCap) || newCap < 1) {
        return res.status(400).json({ error: 'Capacity must be at least 1' })
      }
      if (newCap < departure.bookedSeats) {
        return res.status(400).json({
          error: `Capacity cannot be reduced to ${newCap} seats because ${departure.bookedSeats} seats are already booked`
        })
      }
      updates.capacity = newCap
    }

    // Validate dates if modified
    const start = updates.startDate ? new Date(updates.startDate).getTime() : new Date(departure.startDate).getTime()
    const end = updates.endDate ? new Date(updates.endDate).getTime() : new Date(departure.endDate).getTime()

    if (end < start) {
      return res.status(400).json({ error: 'Return date cannot be earlier than departure date' })
    }

    if (updates.priceDZD !== undefined) {
      const p = Number(updates.priceDZD)
      if (isNaN(p) || p < 0) {
        return res.status(400).json({ error: 'Price in DZD must be non-negative' })
      }
      updates.priceDZD = p
    }

    const updated = await TripDeparture.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('trip', 'name destination image')

    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update departure', details: error.message })
  }
}

/**
 * PATCH /api/agency/departures/:id/cancel
 * Cancels a departure with mandatory reason.
 */
const cancelAgencyDeparture = async (req, res) => {
  try {
    const { id } = req.params
    const { cancellationReason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const departure = await TripDeparture.findById(id)
    if (!departure) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const isOwner = departure.agency && departure.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot cancel another agency\'s departure' })
    }

    if (!cancellationReason || cancellationReason.trim().length < 5) {
      return res.status(400).json({ error: 'A clear cancellation reason is required (minimum 5 characters)' })
    }

    departure.status = 'cancelled'
    departure.cancellationReason = cancellationReason.trim()
    await departure.save()

    res.status(200).json({
      message: 'Departure cancelled successfully',
      departure
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel departure', details: error.message })
  }
}

/**
 * DELETE /api/agency/departures/:id
 * Deletes a scheduled departure only if no travelers have booked seats.
 */
const deleteAgencyDeparture = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const departure = await TripDeparture.findById(id)
    if (!departure) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const isOwner = departure.agency && departure.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot delete another agency\'s departure' })
    }

    if (departure.bookedSeats > 0) {
      return res.status(400).json({
        error: 'Cannot delete departure with reserved passenger seats. Please use the cancellation workflow with an explanation.'
      })
    }

    await TripDeparture.findByIdAndDelete(id)
    res.status(200).json({ message: 'Departure deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete departure', details: error.message })
  }
}

/**
 * GET /api/trips/:id/departures (PUBLIC)
 * Retrieves upcoming scheduled departures for a published trip package.
 */
const getPublicTripDepartures = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    const trip = await Trip.findById(id)
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' })
    }

    // Only published trips are visible publicly, unless requester is creator or admin
    const isOwner = req.user && trip.creator && trip.creator.toString() === req.user._id.toString()
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!trip.published && !isOwner && !isAdmin) {
      return res.status(404).json({ error: 'Excursion package is not published' })
    }

    const departures = await TripDeparture.find({
      trip: id,
      status: { $in: ['scheduled', 'guaranteed'] },
      startDate: { $gte: new Date(Date.now() - 3600000) } // Allow departures starting within the past hour
    })
      .sort({ startDate: 1 })
      .select('startDate endDate priceDZD capacity bookedSeats minGroupSize meetingPoint departureInstructions status')

    res.status(200).json(departures)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departures', details: error.message })
  }
}

/**
 * =========================================================================
 * PHASE 3: AGENCY BOOKINGS & PASSENGER MANIFEST CONTROLLERS
 * =========================================================================
 */

/**
 * GET /api/agency/bookings
 * Lists bookings belonging to the authenticated agency with filters and pagination.
 */
const getAgencyBookings = async (req, res) => {
  try {
    const isAgency = req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies'
    const isAdmin = req.user.role === 'administrator'

    if (!isAgency && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Tourism agency account required' })
    }

    const query = {
      agency: isAdmin && req.query.agency ? req.query.agency : req.user._id
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    if (req.query.departure && mongoose.Types.ObjectId.isValid(req.query.departure)) {
      query.departure = req.query.departure
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i')
      query.$or = [
        { bookingReference: searchRegex },
        { 'customerInfo.fullName': searchRegex },
        { 'customerInfo.phone': searchRegex }
      ]
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20))
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      TripBooking.find(query)
        .populate('trip', 'name destination durationDays image')
        .populate('departure', 'startDate endDate meetingPoint status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TripBooking.countDocuments(query)
    ])

    res.status(200).json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve agency bookings', details: error.message })
  }
}

/**
 * GET /api/agency/bookings/:id
 * Retrieves a detailed booking record with full passenger manifest and status audit log.
 */
const getAgencyBookingById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = await TripBooking.findById(id)
      .populate('trip', 'name destination durationDays inclusions exclusions cancellationPolicy')
      .populate('departure', 'startDate endDate meetingPoint departureInstructions status capacity bookedSeats')
      .populate('agency', 'companyName phone email')

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const isOwner = booking.agency && booking.agency._id.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot access another agency\'s booking' })
    }

    res.status(200).json(booking)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve booking', details: error.message })
  }
}

/**
 * PATCH /api/agency/bookings/:id/confirm
 * Agency approves a pending booking.
 */
const confirmAgencyBooking = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const isOwner = booking.agency && booking.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s booking' })
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: `Cannot confirm booking with status "${booking.status}". Must be "pending"` })
    }

    booking.status = 'confirmed'
    booking.statusHistory.push({
      status: 'confirmed',
      changedBy: req.user._id,
      note: (req.body && req.body.note) ? String(req.body.note).trim() : 'Booking confirmed by agency',
      timestamp: new Date()
    })
    await booking.save()

    const populated = await TripBooking.findById(booking._id)
      .populate('trip', 'name destination durationDays')
      .populate('departure', 'startDate endDate meetingPoint status')

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: populated
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm booking', details: error.message })
  }
}

/**
 * PATCH /api/agency/bookings/:id/reject
 * Agency rejects a pending booking with a mandatory reason.
 * Atomically releases the held seats.
 */
const rejectAgencyBooking = async (req, res) => {
  try {
    const { id } = req.params
    const { rejectionReason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (!rejectionReason || String(rejectionReason).trim().length < 5) {
      return res.status(400).json({ error: 'A clear rejection reason is required (minimum 5 characters)' })
    }

    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const isOwner = booking.agency && booking.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify another agency\'s booking' })
    }

    // Atomic transition from 'pending' to 'rejected'
    const updated = await TripBooking.findOneAndUpdate(
      {
        _id: id,
        status: 'pending'
      },
      {
        $set: {
          status: 'rejected',
          rejectionReason: String(rejectionReason).trim(),
          rejectedAt: new Date()
        },
        $push: {
          statusHistory: {
            status: 'rejected',
            changedBy: req.user._id,
            note: String(rejectionReason).trim(),
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )

    if (!updated) {
      return res.status(400).json({ error: 'Booking cannot be rejected (already confirmed, cancelled, or rejected)' })
    }

    // Atomically release the reserved seats on the departure
    await TripDeparture.findOneAndUpdate(
      {
        _id: updated.departure,
        bookedSeats: { $gte: updated.seats }
      },
      {
        $inc: { bookedSeats: -updated.seats }
      }
    )

    // Synchronize financial status on rejection (e.g. cancelled_unpaid or refund_pending)
    const reconciled = await recalculateBookingFinancials(updated._id)

    res.status(200).json({
      success: true,
      message: 'Booking rejected and seats released',
      booking: reconciled
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject booking', details: error.message })
  }
}

/**
 * PATCH /api/agency/bookings/:id/cancel
 * Agency cancels an active booking with a mandatory reason.
 * Atomically releases the reserved seats.
 */
const cancelAgencyBooking = async (req, res) => {
  try {
    const { id } = req.params
    const { cancellationReason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (!cancellationReason || String(cancellationReason).trim().length < 5) {
      return res.status(400).json({ error: 'A clear cancellation reason is required (minimum 5 characters)' })
    }

    const booking = await TripBooking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const isOwner = booking.agency && booking.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot cancel another agency\'s booking' })
    }

    // Atomic transition from active status ('pending' or 'confirmed') to 'cancelled'
    const updated = await TripBooking.findOneAndUpdate(
      {
        _id: id,
        status: { $in: ['pending', 'confirmed'] }
      },
      {
        $set: {
          status: 'cancelled',
          cancellationReason: String(cancellationReason).trim(),
          cancelledAt: new Date(),
          cancelledBy: req.user._id
        },
        $push: {
          statusHistory: {
            status: 'cancelled',
            changedBy: req.user._id,
            note: String(cancellationReason).trim(),
            timestamp: new Date()
          }
        }
      },
      { new: true }
    )

    if (!updated) {
      return res.status(400).json({ error: 'Booking cannot be cancelled (already cancelled, completed, or rejected)' })
    }

    // Atomically release the allocated seats exactly once
    await TripDeparture.findOneAndUpdate(
      {
        _id: updated.departure,
        bookedSeats: { $gte: updated.seats }
      },
      {
        $inc: { bookedSeats: -updated.seats }
      }
    )

    // Synchronize financial status on cancellation (e.g. cancelled_unpaid or refund_pending)
    const reconciled = await recalculateBookingFinancials(updated._id)

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and seats released',
      booking: reconciled
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking', details: error.message })
  }
}

/**
 * Safely escapes HTML entities to prevent Stored or Reflected Cross-Site Scripting (XSS).
 */
const escapeHtml = (val) => {
  if (val === null || val === undefined) return ''
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Generates official HTML layout for passenger manifest and convoy logistics
 */
const generatePrintableManifestHtml = (data) => {
  const { manifestReference, generatedAt, agency, excursion, session, passengers } = data
  const dateStr = new Date(generatedAt).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  const startStr = new Date(session.startDate).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const endStr = new Date(session.endDate).toLocaleDateString('fr-DZ', {
    day: '2-digit', month: 'long', year: 'numeric'
  })

  const rows = passengers.map(p => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${escapeHtml(p.order)}</td>
      <td><strong>${escapeHtml(p.fullName)}</strong></td>
      <td style="text-align: center; text-transform: capitalize;">${p.ageCategory === 'child' ? 'Enfant' : 'Adulte'}</td>
      <td>${p.contactPhone ? escapeHtml(p.contactPhone) : '—'}</td>
      <td style="font-family: monospace; font-size: 0.85em; text-align: center;">${escapeHtml(p.bookingReference)}</td>
      <td style="text-align: center;">
        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; font-weight: 600; background: ${p.bookingStatus === 'confirmed' ? '#e6f4ea' : '#fef7e0'}; color: ${p.bookingStatus === 'confirmed' ? '#137333' : '#b06000'};">
          ${p.bookingStatus === 'confirmed' ? 'Confirmé' : 'En attente'}
        </span>
      </td>
      <td>${p.specialNotes ? escapeHtml(p.specialNotes) : '—'}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
  <meta charset="utf-8">
  <title>Manifeste des Passagers — ${escapeHtml(manifestReference)}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1c2b27; margin: 0; padding: 20px; font-size: 11pt; }
    .header { text-align: center; border-bottom: 2px solid #102D27; padding-bottom: 12px; margin-bottom: 16px; }
    .header h2 { margin: 0 0 4px 0; font-size: 13pt; text-transform: uppercase; color: #102D27; letter-spacing: 0.5px; }
    .header h3 { margin: 0 0 4px 0; font-size: 11pt; color: #555; }
    .header h1 { margin: 8px 0 2px 0; font-size: 16pt; color: #173F35; letter-spacing: 1px; }
    .header p { margin: 4px 0; font-size: 9pt; color: #6b7280; }
    .ref-badge { display: inline-block; background: #D9B98C; color: #102D27; padding: 3px 12px; border-radius: 12px; font-weight: bold; font-size: 10pt; margin-top: 6px; }
    
    .meta-grid { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; }
    .meta-box { flex: 1; border: 1px solid #d9b98c; border-radius: 6px; padding: 10px 14px; background: #faf8f2; }
    .meta-box h4 { margin: 0 0 6px 0; font-size: 10pt; color: #173F35; text-transform: uppercase; border-bottom: 1px solid rgba(217,185,140,0.5); padding-bottom: 4px; }
    .meta-box p { margin: 3px 0; font-size: 9.5pt; }

    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9.5pt; }
    th { background: #173F35; color: #faf8f2; padding: 8px 6px; text-align: left; font-size: 9pt; border: 1px solid #173F35; }
    td { padding: 6px; border: 1px solid #d1d5db; vertical-align: middle; }
    tr:nth-child(even) { background-color: #f9fafb; }

    .signatures { display: flex; justify-content: space-between; margin-top: 40px; page-break-inside: avoid; }
    .sig-box { width: 45%; border: 1px dashed #9ca3af; border-radius: 6px; padding: 12px; min-height: 85px; text-align: center; }
    .sig-title { font-weight: bold; font-size: 9.5pt; margin-bottom: 40px; color: #374151; }

    .footer { text-align: center; font-size: 8pt; color: #6b7280; margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 8px; }
    .print-btn-bar { margin-bottom: 15px; text-align: right; }
    .btn { background: #173F35; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
    @media print { .no-print { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn" onclick="window.print()">🖨️ Imprimer le Manifeste</button>
  </div>

  <div class="header">
    <h2>RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE</h2>
    <h3>الجمهورية الجزائرية الديمقراطية الشعبية</h3>
    <h1>MANIFESTE OFFICIEL DES PASSAGERS & DU CONVOI</h1>
    <p>Document d'information interne pour l'organisation et le transport du convoi touristique • Touriva Algérie</p>
    <div class="ref-badge">RÉFÉRENCE : ${escapeHtml(manifestReference)}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <h4>Agence de Tourisme Émettrice</h4>
      <p><strong>Raison Sociale :</strong> ${escapeHtml(agency.name)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(agency.phone || '—')}</p>
      <p><strong>Email :</strong> ${escapeHtml(agency.email || '—')}</p>
      <p><strong>Statut :</strong> Agence Partenaire Touriva</p>
    </div>
    <div class="meta-box">
      <h4>Excursion & Itinéraire</h4>
      <p><strong>Circuit :</strong> ${escapeHtml(excursion.title)}</p>
      <p><strong>Destination :</strong> ${escapeHtml(excursion.destination)} (${escapeHtml(excursion.durationDays)} Jours)</p>
      <p><strong>Point de Rassemblement :</strong> ${escapeHtml(excursion.meetingPoint || '—')}</p>
    </div>
    <div class="meta-box">
      <h4>Session de Départ</h4>
      <p><strong>Date de Départ :</strong> ${escapeHtml(startStr)}</p>
      <p><strong>Date de Retour :</strong> ${escapeHtml(endStr)}</p>
      <p><strong>Total Passagers :</strong> ${escapeHtml(session.totalPassengers)} / ${escapeHtml(session.capacity)} Places</p>
      <p><strong>Édité le :</strong> ${escapeHtml(dateStr)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 30px; text-align: center;">N°</th>
        <th>Nom & Prénom du Voyageur</th>
        <th style="width: 75px; text-align: center;">Catégorie</th>
        <th style="width: 110px;">Contact Téléphonique</th>
        <th style="width: 105px; text-align: center;">Réf. Billet</th>
        <th style="width: 80px; text-align: center;">Statut</th>
        <th>Notes / Spécificités</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">
      <div class="sig-title">Cachet et Signature de l'Agence de Tourisme</div>
      <div style="font-size: 8pt; color: #9ca3af;">(Mention manuscrite "Certifié conforme")</div>
    </div>
    <div class="sig-box">
      <div class="sig-title">Visa des Autorités de Contrôle & Sécurité</div>
      <div style="font-size: 8pt; color: #9ca3af;">(DGSN / Gendarmerie Nationale / Protection Civile)</div>
    </div>
  </div>

  <div class="footer">
    Document édité via la plateforme Touriva Algérie • Fiche d'information interne d'agence pour le suivi et le transport des voyageurs.
  </div>
</body>
</html>
  `
}

/**
 * GET /api/agency/departures/:id/manifest
 * Retrieves the passenger manifest for a specific departure session.
 */
const getDepartureManifest = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const departure = await TripDeparture.findById(id)
      .populate('trip', 'name destination durationDays meetingPoint theme')
      .populate('agency', 'companyName phone email')

    if (!departure) {
      return res.status(404).json({ error: 'Departure not found' })
    }

    const isOwner = departure.agency && departure.agency._id.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot access the passenger manifest for another agency\'s departure' })
    }

    // Retrieve all active bookings for this departure
    const bookings = await TripBooking.find({
      departure: id,
      status: { $in: ['confirmed', 'pending'] }
    }).sort({ createdAt: 1 })

    // Build passenger manifest roster
    const passengers = []
    let passengerIndex = 1

    bookings.forEach(b => {
      if (b.passengers && b.passengers.length > 0) {
        b.passengers.forEach(p => {
          passengers.push({
            order: passengerIndex++,
            fullName: p.fullName || b.customerInfo.fullName,
            ageCategory: p.ageCategory || 'adult',
            contactPhone: p.emergencyPhone || b.customerInfo.phone,
            bookingReference: b.bookingReference,
            bookingStatus: b.status,
            specialNotes: p.specialNotes || b.specialRequests || ''
          })
        })
      } else {
        for (let s = 0; s < b.seats; s++) {
          passengers.push({
            order: passengerIndex++,
            fullName: b.customerInfo.fullName + (s > 0 ? ` (Voyageur ${s + 1})` : ''),
            ageCategory: 'adult',
            contactPhone: b.customerInfo.phone,
            bookingReference: b.bookingReference,
            bookingStatus: b.status,
            specialNotes: b.specialRequests || ''
          })
        }
      }
    })

    const manifestData = {
      manifestReference: `MNF-${departure._id.toString().slice(-6).toUpperCase()}`,
      generatedAt: new Date(),
      agency: {
        name: departure.agency.companyName || 'Agence de Tourisme Agréée',
        phone: departure.agency.phone || '',
        email: departure.agency.email || ''
      },
      excursion: {
        title: departure.trip?.name || 'Excursion Touristique',
        destination: departure.trip?.destination || 'Algérie',
        durationDays: departure.trip?.durationDays || 1,
        meetingPoint: departure.meetingPoint || departure.trip?.meetingPoint || 'Lieu de rendez-vous convenu'
      },
      session: {
        startDate: departure.startDate,
        endDate: departure.endDate,
        capacity: departure.capacity,
        totalPassengers: passengers.length,
        status: departure.status
      },
      passengers
    }

    if (req.query.format === 'html') {
      const html = generatePrintableManifestHtml(manifestData)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      return res.send(html)
    }

    res.status(200).json(manifestData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate passenger manifest', details: error.message })
  }
}

/**
 * =========================================================================
 * PHASE 3: AGENCY CUSTOM ENQUIRIES & QUOTATIONS
 * =========================================================================
 */

/**
 * GET /api/agency/enquiries
 * Lists custom-trip inquiries assigned to this agency or open enquiries.
 */
const getAgencyEnquiries = async (req, res) => {
  try {
    const isAgency = req.user.role === 'partner' && req.user.typeAccount === 'touristAgencies'
    const isAdmin = req.user.role === 'administrator'

    if (!isAgency && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: Tourism agency account required' })
    }

    const query = {
      $or: [
        { agency: req.user._id },
        { agency: null } // Open enquiries matching general destinations
      ]
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    const enquiries = await TripEnquiry.find(query)
      .populate('agency', 'companyName phone')
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json(enquiries)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve enquiries', details: error.message })
  }
}

/**
 * GET /api/agency/enquiries/:id
 * Retrieves custom enquiry details for quotation preparation.
 */
const getAgencyEnquiryById = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    const enquiry = await TripEnquiry.findById(id).populate('agency', 'companyName phone email')
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    // Ownership check: must be targeted to this agency or open
    const isTargeted = !enquiry.agency || enquiry.agency._id.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isTargeted && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot access another agency\'s targeted enquiry' })
    }

    res.status(200).json(enquiry)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve enquiry', details: error.message })
  }
}

/**
 * POST /api/agency/enquiries/:id/quote
 * Agency submits a formal price and itinerary quotation for a custom enquiry.
 */
const quoteAgencyEnquiry = async (req, res) => {
  try {
    const { id } = req.params
    const {
      quotedPriceDZD,
      itinerarySummary,
      inclusions,
      exclusions,
      cancellationPolicy,
      validUntil,
      agencyNotes
    } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    const numPrice = Number(quotedPriceDZD)
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Quoted price in DZD must be a positive number' })
    }

    if (!itinerarySummary || String(itinerarySummary).trim().length < 10) {
      return res.status(400).json({ error: 'Itinerary summary is required (minimum 10 characters)' })
    }

    if (!validUntil) {
      return res.status(400).json({ error: 'Quotation validity expiry date is required' })
    }

    const expiryDate = new Date(validUntil)
    if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
      return res.status(400).json({ error: 'Validity expiry date must be a valid future date' })
    }

    const enquiry = await TripEnquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    const isTargeted = !enquiry.agency || enquiry.agency.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isTargeted && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot quote another agency\'s enquiry' })
    }

    enquiry.agency = req.user._id
    enquiry.status = 'quoted'
    enquiry.quotation = {
      quotedPriceDZD: numPrice,
      itinerarySummary: String(itinerarySummary).trim(),
      inclusions: Array.isArray(inclusions) ? inclusions.map(i => String(i).trim()).filter(Boolean) : [],
      exclusions: Array.isArray(exclusions) ? exclusions.map(e => String(e).trim()).filter(Boolean) : [],
      cancellationPolicy: cancellationPolicy ? String(cancellationPolicy).trim() : 'Conditions standards d annulation.',
      validUntil: expiryDate,
      agencyNotes: agencyNotes ? String(agencyNotes).trim() : '',
      quotedAt: new Date(),
      quotedBy: req.user._id
    }

    await enquiry.save()

    const populated = await TripEnquiry.findById(enquiry._id).populate('agency', 'companyName phone email')

    res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully',
      enquiry: populated
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit quotation', details: error.message })
  }
}

/**
 * PATCH /api/agency/enquiries/:id/decline
 * Agency declines to quote a custom enquiry.
 */
const declineAgencyEnquiry = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    const enquiry = await TripEnquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    enquiry.status = 'declined'
    enquiry.declineReason = reason ? String(reason).trim() : 'Declined by agency'
    enquiry.declinedAt = new Date()
    enquiry.declinedBy = req.user._id
    await enquiry.save()

    res.status(200).json({
      success: true,
      message: 'Enquiry declined',
      enquiry
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline enquiry', details: error.message })
  }
}

module.exports = {
  getAgencyProfile,
  getAgencyPackages,
  createAgencyPackage,
  getAgencyPackageById,
  updateAgencyPackage,
  deleteAgencyPackage,
  getAgencyDepartures,
  createAgencyDeparture,
  updateAgencyDeparture,
  cancelAgencyDeparture,
  deleteAgencyDeparture,
  getPublicTripDepartures,
  getAgencyBookings,
  getAgencyBookingById,
  confirmAgencyBooking,
  rejectAgencyBooking,
  cancelAgencyBooking,
  getDepartureManifest,
  getAgencyEnquiries,
  getAgencyEnquiryById,
  quoteAgencyEnquiry,
  declineAgencyEnquiry,
  escapeHtml,
  generatePrintableManifestHtml
}
