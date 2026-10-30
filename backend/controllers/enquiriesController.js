const mongoose = require('mongoose')
const TripEnquiry = require('../models/TripEnquiry')
const User = require('../models/User')

/**
 * POST /api/enquiries
 * Creates a tailored excursion enquiry.
 */
const createEnquiry = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      groupSize = 2,
      budgetDZD,
      theme,
      preferences = [],
      specialRequests = '',
      agencyId,
      customerInfo = {}
    } = req.body

    if (!destination || !destination.trim()) {
      return res.status(400).json({ error: 'Destination or region is required' })
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both desired start date and end date are required' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Valid departure and return dates are required' })
    }

    if (end < start) {
      return res.status(400).json({ error: 'Return date cannot be earlier than departure date' })
    }

    const numGroup = Number(groupSize)
    if (!Number.isInteger(numGroup) || numGroup < 1) {
      return res.status(400).json({ error: 'Group size must be a positive integer of at least 1' })
    }

    const fullName = customerInfo.fullName || (req.user ? `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() : '')
    const phone = customerInfo.phone || (req.user ? req.user.phone : '')
    const email = customerInfo.email || (req.user ? req.user.email : '')

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Traveler full name is required (minimum 2 characters)' })
    }

    if (!phone || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Valid contact phone number is required' })
    }

    // Optional agency targeting
    let targetAgencyId = null
    if (agencyId && mongoose.Types.ObjectId.isValid(agencyId)) {
      const agencyUser = await User.findOne({ _id: agencyId, typeAccount: 'touristAgencies' })
      if (agencyUser) {
        targetAgencyId = agencyUser._id
      }
    }

    const enquiry = await TripEnquiry.create({
      customer: req.user ? req.user._id : null,
      customerInfo: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : ''
      },
      agency: targetAgencyId,
      destination: destination.trim(),
      startDate: start,
      endDate: end,
      groupSize: numGroup,
      budgetDZD: budgetDZD ? Number(budgetDZD) : null,
      theme: theme || 'Circuit Sur Mesure',
      preferences: Array.isArray(preferences) ? preferences : [],
      specialRequests: specialRequests ? specialRequests.trim() : '',
      status: 'requested'
    })

    const populated = await TripEnquiry.findById(enquiry._id).populate('agency', 'companyName phone email')

    res.status(201).json({
      success: true,
      message: 'Custom trip enquiry submitted successfully',
      enquiry: populated
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create enquiry', details: error.message })
  }
}

/**
 * GET /api/enquiries/my
 * Lists enquiries created by the authenticated tourist.
 */
const getMyEnquiries = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const enquiries = await TripEnquiry.find({
      $or: [
        { customer: req.user._id },
        { 'customerInfo.phone': req.user.phone }
      ]
    })
      .populate('agency', 'companyName phone')
      .sort({ createdAt: -1 })

    res.status(200).json(enquiries)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve enquiries', details: error.message })
  }
}

/**
 * PATCH /api/enquiries/:id/accept
 * Traveler accepts an agency's quotation before expiry.
 */
const acceptQuotation = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to accept a quotation' })
    }

    const enquiry = await TripEnquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    // Ownership & authorization check:
    // 1. Authenticated customer owner
    // 2. Administrator
    // 3. Authenticated customer claiming a guest enquiry whose account phone matches enquiry phone
    const isOwnerCustomer = enquiry.customer && enquiry.customer.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'

    const callerPhone = req.user.phone ? req.user.phone.replace(/[^\d]/g, '') : ''
    const enquiryPhone = enquiry.customerInfo?.phone ? enquiry.customerInfo.phone.replace(/[^\d]/g, '') : ''
    const isVerifiedGuestOwner = !enquiry.customer && callerPhone && enquiryPhone && callerPhone === enquiryPhone

    if (!isOwnerCustomer && !isAdmin && !isVerifiedGuestOwner) {
      return res.status(403).json({ error: 'Access forbidden: You are not authorized to accept this quotation' })
    }

    // Bind guest enquiry to canonical user account once claimed
    if (isVerifiedGuestOwner && !enquiry.customer) {
      enquiry.customer = req.user._id
    }

    if (enquiry.status !== 'quoted') {
      return res.status(400).json({ error: `Cannot accept enquiry with status "${enquiry.status}". Must be "quoted"` })
    }

    if (enquiry.quotation?.validUntil && new Date() > new Date(enquiry.quotation.validUntil)) {
      enquiry.status = 'expired'
      await enquiry.save()
      return res.status(400).json({ error: 'This quotation has expired and can no longer be accepted' })
    }

    enquiry.status = 'accepted'
    await enquiry.save()

    res.status(200).json({
      success: true,
      message: 'Quotation accepted successfully',
      enquiry
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept quotation', details: error.message })
  }
}

/**
 * PATCH /api/enquiries/:id/decline
 * Traveler declines an agency's quotation.
 */
const declineQuotation = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to decline a quotation' })
    }

    const enquiry = await TripEnquiry.findById(id)
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' })
    }

    // Ownership & authorization check:
    // 1. Authenticated customer owner
    // 2. Administrator
    // 3. Authenticated customer claiming a guest enquiry whose account phone matches enquiry phone
    const isOwnerCustomer = enquiry.customer && enquiry.customer.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'

    const callerPhone = req.user.phone ? req.user.phone.replace(/[^\d]/g, '') : ''
    const enquiryPhone = enquiry.customerInfo?.phone ? enquiry.customerInfo.phone.replace(/[^\d]/g, '') : ''
    const isVerifiedGuestOwner = !enquiry.customer && callerPhone && enquiryPhone && callerPhone === enquiryPhone

    if (!isOwnerCustomer && !isAdmin && !isVerifiedGuestOwner) {
      return res.status(403).json({ error: 'Access forbidden: You are not authorized to decline this quotation' })
    }

    // Bind guest enquiry to canonical user account once claimed
    if (isVerifiedGuestOwner && !enquiry.customer) {
      enquiry.customer = req.user._id
    }

    if (!['quoted', 'requested'].includes(enquiry.status)) {
      return res.status(400).json({ error: `Cannot decline enquiry with status "${enquiry.status}"` })
    }

    enquiry.status = 'declined'
    enquiry.declineReason = reason ? String(reason).trim() : 'Declined by customer'
    enquiry.declinedAt = new Date()
    enquiry.declinedBy = req.user._id
    await enquiry.save()

    res.status(200).json({
      success: true,
      message: 'Quotation declined',
      enquiry
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to decline quotation', details: error.message })
  }
}

module.exports = {
  createEnquiry,
  getMyEnquiries,
  acceptQuotation,
  declineQuotation
}
