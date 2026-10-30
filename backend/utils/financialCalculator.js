const TripBooking = require('../models/TripBooking')
const TripPayment = require('../models/TripPayment')
const TripRefund = require('../models/TripRefund')

/**
 * Deterministically recalculates and reconciles authoritative financial balances
 * for a specific booking from the immutable TripPayment and TripRefund ledgers.
 * 
 * Invariants enforced:
 * 1. totalPaidDZD = sum of all payments with status == 'verified'
 * 2. totalRefundedDZD = sum of all refunds with status == 'completed'
 * 3. netPaidDZD = max(0, totalPaidDZD - totalRefundedDZD)
 * 4. balanceDueDZD = max(0, totalPriceDZD - netPaidDZD)
 * 5. financialStatus reflects accurate state without trusting client inputs
 * 
 * @param {string|mongoose.Types.ObjectId} bookingId
 * @returns {Promise<TripBooking>} The saved, synchronized booking document
 */
const recalculateBookingFinancials = async (bookingId) => {
  const booking = await TripBooking.findById(bookingId)
  if (!booking) {
    throw new Error(`Booking ${bookingId} not found during financial recalculation`)
  }

  // 1. Authoritative aggregation of all verified credit payments
  const paymentAgg = await TripPayment.aggregate([
    {
      $match: {
        booking: booking._id,
        status: 'verified'
      }
    },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: '$amountDZD' }
      }
    }
  ])
  const totalPaidDZD = paymentAgg.length > 0 ? paymentAgg[0].totalPaid : 0

  // 2. Authoritative aggregation of all completed debit refunds
  const refundAgg = await TripRefund.aggregate([
    {
      $match: {
        booking: booking._id,
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalRefunded: { $sum: '$amountDZD' }
      }
    }
  ])
  const totalRefundedDZD = refundAgg.length > 0 ? refundAgg[0].totalRefunded : 0

  // 3. Mathematical Invariants Calculation (Integer dinars)
  const netPaidDZD = Math.max(0, Math.round(totalPaidDZD - totalRefundedDZD))
  const balanceDueDZD = Math.max(0, Math.round(booking.totalPriceDZD - netPaidDZD))

  // 4. Determine Financial Status
  let financialStatus = 'unpaid'

  if (['cancelled', 'rejected'].includes(booking.status) && totalPaidDZD === 0) {
    financialStatus = 'cancelled_unpaid'
  } else if (['cancelled', 'rejected'].includes(booking.status) && totalPaidDZD > 0 && totalRefundedDZD === 0) {
    financialStatus = 'refund_pending'
  } else if (totalRefundedDZD > 0 && netPaidDZD === 0) {
    // 100% of collected funds have been disbursed back to customer
    financialStatus = 'refunded'
  } else if (totalRefundedDZD > 0 && netPaidDZD > 0) {
    // A partial refund was issued, but some net funds remain with agency
    financialStatus = 'partially_refunded'
  } else if (netPaidDZD >= booking.totalPriceDZD) {
    // 100% of booking price satisfied
    financialStatus = 'paid'
  } else if (netPaidDZD > 0) {
    // Some funds collected, but outstanding balance remains
    financialStatus = 'partially_paid'
  } else {
    financialStatus = 'unpaid'
  }

  // Check if active refund request is pending
  const pendingRefundCount = await TripRefund.countDocuments({
    booking: booking._id,
    status: { $in: ['requested', 'approved'] }
  })
  if (pendingRefundCount > 0 && financialStatus !== 'refunded') {
    financialStatus = 'refund_pending'
  }

  // Update cached fields on TripBooking
  booking.totalPaidDZD = totalPaidDZD
  booking.totalRefundedDZD = totalRefundedDZD
  booking.netPaidDZD = netPaidDZD
  booking.balanceDueDZD = balanceDueDZD
  booking.financialStatus = financialStatus

  await booking.save()
  return booking
}

/**
 * Validates package/trip deposit configuration.
 * Prevents impossible or contradictory financial parameters.
 * 
 * @param {Object} data 
 * @returns {{ isValid: boolean, error?: string }}
 */
const validateDepositConfig = (data) => {
  if (!data.requiresDeposit) {
    return { isValid: true }
  }

  if (data.depositType === 'percentage') {
    const pct = Number(data.depositPercentage)
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      return { isValid: false, error: 'Deposit percentage must be between 1% and 100%' }
    }
  } else if (data.depositType === 'fixed') {
    const amount = Number(data.depositAmountDZD)
    if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return { isValid: false, error: 'Fixed deposit amount must be a positive integer in DZD' }
    }
    if (data.price && Number(data.price) > 0 && amount > Number(data.price)) {
      return { isValid: false, error: 'Deposit amount cannot exceed the total excursion package price' }
    }
  }

  if (data.paymentDueDaysBeforeDeparture !== undefined) {
    const days = Number(data.paymentDueDaysBeforeDeparture)
    if (isNaN(days) || days < 0 || !Number.isInteger(days)) {
      return { isValid: false, error: 'Payment due days before departure must be a non-negative integer' }
    }
  }

  return { isValid: true }
}

module.exports = {
  recalculateBookingFinancials,
  validateDepositConfig
}
