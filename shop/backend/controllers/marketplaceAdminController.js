const mongoose = require('mongoose')
const Product = require('../models/Product')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const SellerApplication = require('../models/SellerApplication')
const SellerProfile = require('../models/SellerProfile')
const Commission = require('../models/Commission')
const MarketplaceSettings = require('../models/MarketplaceSettings')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const bcrypt = require('bcrypt')

// GET /api/admin/marketplace/dashboard - Platform KPIs
const getAdminDashboard = async (req, res) => {
  try {
    // Sellers KPI
    const totalSellers = await SellerProfile.countDocuments()
    const activeSellers = await SellerProfile.countDocuments({ isApproved: true, isSuspended: false })
    const suspendedSellers = await SellerProfile.countDocuments({ isSuspended: true })
    const pendingApplications = await SellerApplication.countDocuments({ status: 'pending' })

    // Products KPI
    const totalProducts = await Product.countDocuments()
    const approvedProducts = await Product.countDocuments({ status: 'approved' })
    const pendingReviewProducts = await Product.countDocuments({ status: 'pending_review' })
    const rejectedProducts = await Product.countDocuments({ status: 'rejected' })

    // Orders & Financials KPI
    const totalOrders = await Order.countDocuments()
    const completedOrders = await Order.countDocuments({ overallStatus: 'completed' })
    const pendingPaymentOrders = await Order.countDocuments({ paymentStatus: 'pending_verification' })

    const orders = await Order.find({ paymentStatus: 'verified' })
    const grossGMVDZD = orders.reduce((acc, o) => acc + (o.totalAmountDZD || 0), 0)

    const commissions = await Commission.find()
    const totalCommissionsEarnedDZD = commissions.reduce((acc, c) => acc + (c.commissionAmountDZD || 0), 0)
    const totalSellerPayoutsDZD = commissions.reduce((acc, c) => acc + (c.sellerPayoutDZD || 0), 0)

    // Recent audit logs
    const recentLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(10)

    res.status(200).json({
      sellers: {
        total: totalSellers,
        active: activeSellers,
        suspended: suspendedSellers,
        pendingApplications
      },
      products: {
        total: totalProducts,
        approved: approvedProducts,
        pendingReview: pendingReviewProducts,
        rejected: rejectedProducts
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pendingPayment: pendingPaymentOrders
      },
      financials: {
        currency: 'DZD',
        grossGMVDZD,
        totalCommissionsEarnedDZD,
        totalSellerPayoutsDZD
      },
      recentLogs
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/seller-applications - List seller applications
const getSellerApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = {}
    if (status && status !== 'all') {
      query.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await SellerApplication.countDocuments(query)
    const applications = await SellerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      applications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/seller-applications/:id/review - Approve or reject application
const reviewSellerApplication = async (req, res) => {
  try {
    const { id } = req.params
    const { decision, rejectionReason, temporaryPassword = 'SellerWelcome#2026!' } = req.body

    const application = await SellerApplication.findById(id)
    if (!application) {
      return res.status(404).json({ error: 'Seller application not found.' })
    }

    if (!['approved', 'rejected', 'under_review'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be approved, rejected, or under_review.' })
    }

    application.status = decision
    application.reviewedBy = req.user._id
    application.reviewedAt = new Date()

    if (decision === 'rejected') {
      application.rejectionReason = rejectionReason || 'Application criteria not met.'
      await application.save()

      await AuditLog.create({
        performedBy: req.user._id,
        actorRole: 'owner_admin',
        action: 'SELLER_APPLICATION_REJECTED',
        entityType: 'SellerApplication',
        entityId: application._id.toString(),
        details: { storeName: application.storeName, reason: application.rejectionReason }
      })

      return res.status(200).json({ message: 'Seller application rejected.', application })
    }

    if (decision === 'approved') {
      application.rejectionReason = ''

      // Find or create user account for seller
      let user = await User.findOne({ email: application.email })
      if (!user) {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(temporaryPassword, salt)
        user = await User.create({
          email: application.email,
          phone: application.phone,
          firstName: application.legalRepresentativeName.split(' ')[0] || application.legalRepresentativeName,
          lastName: application.legalRepresentativeName.split(' ').slice(1).join(' ') || 'Vendeur',
          password: hash,
          role: 'seller',
          companyName: application.storeName,
          rc: application.rcNumber,
          nif: application.nifNumber,
          activated: true,
          complete: true,
          status: true,
          fileStatus: 'confirmed'
        })
      } else {
        user.role = 'seller'
        user.activated = true
        user.status = true
        user.companyName = application.storeName
        await user.save()
      }

      application.userId = user._id
      await application.save()

      // Create or update SellerProfile
      let profile = await SellerProfile.findOne({ userId: user._id })
      if (!profile) {
        const storeSlug = application.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${user._id.toString().slice(-4)}`
        profile = await SellerProfile.create({
          userId: user._id,
          storeName: application.storeName,
          storeSlug,
          phone: application.phone,
          email: application.email,
          wilaya: application.wilaya,
          city: application.city,
          address: application.address,
          bio: application.businessDescription,
          isApproved: true,
          isSuspended: false
        })
      } else {
        profile.isApproved = true
        profile.isSuspended = false
        await profile.save()
      }

      await AuditLog.create({
        performedBy: req.user._id,
        actorRole: 'owner_admin',
        action: 'SELLER_APPLICATION_APPROVED',
        entityType: 'SellerApplication',
        entityId: application._id.toString(),
        details: { storeName: application.storeName, userId: user._id.toString() }
      })

      return res.status(200).json({
        message: 'Seller application approved. Seller profile and account activated.',
        application,
        sellerProfile: profile
      })
    }

    await application.save()
    res.status(200).json({ message: 'Application status updated.', application })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/sellers - List all sellers
const getAllSellers = async (req, res) => {
  try {
    const { search, isSuspended, page = 1, limit = 20 } = req.query
    const query = {}

    if (isSuspended !== undefined && isSuspended !== 'all') {
      query.isSuspended = isSuspended === 'true'
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { storeName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await SellerProfile.countDocuments(query)
    const sellers = await SellerProfile.find(query)
      .populate('userId', 'firstName lastName email phone role activated')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      sellers,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/sellers/:id/status - Suspend or reactivate seller
const updateSellerStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { isSuspended, suspensionReason } = req.body

    const profile = await SellerProfile.findById(id)
    if (!profile) {
      return res.status(404).json({ error: 'Seller profile not found.' })
    }

    profile.isSuspended = Boolean(isSuspended)
    profile.suspensionReason = isSuspended ? (suspensionReason || 'Suspended by marketplace administrator.') : ''
    await profile.save()

    // If suspended, delist all products immediately
    if (isSuspended) {
      await Product.updateMany(
        { sellerId: profile.userId },
        { $set: { published: false, status: 'suspended' } }
      )
    } else {
      // If reactivated, restore previously approved products
      await Product.updateMany(
        { sellerId: profile.userId, status: 'suspended' },
        { $set: { published: true, status: 'approved' } }
      )
    }

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'owner_admin',
      action: isSuspended ? 'SELLER_SUSPENDED' : 'SELLER_REACTIVATED',
      entityType: 'SellerProfile',
      entityId: profile._id.toString(),
      details: { storeName: profile.storeName, isSuspended }
    })

    res.status(200).json({
      message: isSuspended ? 'Seller suspended and products delisted.' : 'Seller reactivated.',
      profile
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/products/moderation - Product moderation queue
const getProductsForModeration = async (req, res) => {
  try {
    const { status = 'pending_review', page = 1, limit = 20 } = req.query
    const query = {}
    if (status && status !== 'all') {
      query.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .populate('sellerId', 'firstName lastName email companyName phone')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/products/:id/moderate - Approve, reject or suspend product
const moderateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const { status, rejectionReason, moderationNotes, isFeatured } = req.body

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    if (!['approved', 'rejected', 'suspended', 'pending_review'].includes(status)) {
      return res.status(400).json({ error: 'Invalid moderation status.' })
    }

    product.status = status
    product.published = status === 'approved'

    if (status === 'rejected') {
      product.rejectionReason = rejectionReason || 'Product does not comply with marketplace quality criteria.'
    } else {
      product.rejectionReason = ''
    }

    if (moderationNotes !== undefined) product.moderationNotes = moderationNotes.trim()
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured)

    await product.save()

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'owner_admin',
      action: `PRODUCT_MODERATED_${status.toUpperCase()}`,
      entityType: 'Product',
      entityId: product._id.toString(),
      details: { name: product.name, status, rejectionReason: product.rejectionReason }
    })

    res.status(200).json({
      message: `Product successfully ${status}.`,
      product
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/orders - List all orders across all sellers
const getAllOrders = async (req, res) => {
  try {
    const { paymentStatus, overallStatus, page = 1, limit = 20 } = req.query
    const query = {}

    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus
    if (overallStatus && overallStatus !== 'all') query.overallStatus = overallStatus

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Order.countDocuments(query)

    const orders = await Order.find(query)
      .populate({
        path: 'items',
        populate: [
          { path: 'productId', select: 'name code img' },
          { path: 'sellerId', select: 'firstName lastName companyName phone' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/orders/:id/payment-status - Verify payment proof
const verifyOrderPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus } = req.body

    const order = await Order.findById(id).populate('items')
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' })
    }

    if (!['verified', 'failed', 'pending_verification'].includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status.' })
    }

    order.paymentStatus = paymentStatus
    if (order.paymentProof) {
      order.paymentProof.verifiedAt = new Date()
      order.paymentProof.verifiedBy = req.user._id
    }

    if (paymentStatus === 'verified') {
      order.overallStatus = 'processing'
      order.status = 'confirmed' // legacy sync

      // Calculate and accrue commissions for each order item
      const settings = await MarketplaceSettings.findOne({ key: 'global_settings' })
      const defaultRate = settings?.defaultCommissionPercent || 10

      for (const item of order.items) {
        if (item.sellerId) {
          // Check for existing commission record
          const existingComm = await Commission.findOne({ orderItemId: item._id })
          if (!existingComm) {
            const sellerProf = await SellerProfile.findOne({ userId: item.sellerId })
            const rate = (sellerProf && sellerProf.commissionRateOverride !== null)
              ? sellerProf.commissionRateOverride
              : defaultRate

            const gross = item.totalItemPriceDZD
            const commissionAmount = Math.round(gross * (rate / 100))
            const sellerPayout = gross - commissionAmount

            await Commission.create({
              orderId: order._id,
              orderItemId: item._id,
              sellerId: item.sellerId,
              grossAmountDZD: gross,
              commissionRatePercent: rate,
              commissionAmountDZD: commissionAmount,
              sellerPayoutDZD: sellerPayout,
              status: 'accrued'
            })

            // Increment seller sales statistics
            if (sellerProf) {
              sellerProf.totalSalesCount += item.quantity
              sellerProf.totalRevenueDZD += gross
              await sellerProf.save()
            }
          }
        }
      }
    }

    await order.save()

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'owner_admin',
      action: `ORDER_PAYMENT_${paymentStatus.toUpperCase()}`,
      entityType: 'Order',
      entityId: order._id.toString(),
      details: { orderNumber: order.orderNumber, paymentStatus }
    })

    res.status(200).json({
      message: `Order payment status updated to ${paymentStatus}.`,
      order
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/commissions - Commission ledger
const getCommissionLedger = async (req, res) => {
  try {
    const { status, sellerId, page = 1, limit = 30 } = req.query
    const query = {}
    if (status && status !== 'all') query.status = status
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) query.sellerId = sellerId

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Commission.countDocuments(query)

    const commissions = await Commission.find(query)
      .populate('orderId', 'orderNumber paymentStatus createdAt')
      .populate('orderItemId', 'productName unitPriceDZD quantity totalItemPriceDZD fulfillmentStatus')
      .populate('sellerId', 'firstName lastName companyName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const allCommissions = await Commission.find()
    const totalPlatformEarnedDZD = allCommissions.reduce((acc, c) => acc + c.commissionAmountDZD, 0)
    const totalPendingPayoutsDZD = allCommissions.filter(c => c.status === 'accrued').reduce((acc, c) => acc + c.sellerPayoutDZD, 0)
    const totalSettledPayoutsDZD = allCommissions.filter(c => c.status === 'paid_to_seller').reduce((acc, c) => acc + c.sellerPayoutDZD, 0)

    res.status(200).json({
      summary: {
        currency: 'DZD',
        totalPlatformEarnedDZD,
        totalPendingPayoutsDZD,
        totalSettledPayoutsDZD
      },
      commissions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/commissions/:id/settle - Settle payout to seller
const settleCommissionPayout = async (req, res) => {
  try {
    const { id } = req.params
    const { payoutReference } = req.body

    const comm = await Commission.findById(id)
    if (!comm) {
      return res.status(404).json({ error: 'Commission record not found.' })
    }

    comm.status = 'paid_to_seller'
    comm.paidAt = new Date()
    comm.payoutReference = payoutReference ? payoutReference.trim() : `PAYOUT-${Date.now().toString().slice(-6)}`
    await comm.save()

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'owner_admin',
      action: 'COMMISSION_SETTLED_TO_SELLER',
      entityType: 'Commission',
      entityId: comm._id.toString(),
      details: { sellerPayoutDZD: comm.sellerPayoutDZD, payoutReference: comm.payoutReference }
    })

    res.status(200).json({
      message: 'Commission payout marked as settled to seller.',
      commission: comm
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/settings - Admin get settings
const getAdminSettings = async (req, res) => {
  try {
    let settings = await MarketplaceSettings.findOne({ key: 'global_settings' })
    if (!settings) {
      settings = await MarketplaceSettings.create({ key: 'global_settings' })
    }
    res.status(200).json(settings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/admin/marketplace/settings - Admin update settings
const updateAdminSettings = async (req, res) => {
  try {
    const {
      marketplaceName,
      tagline,
      defaultCommissionPercent,
      commissionModel,
      requireSellerApproval,
      requireProductModeration,
      supportedPaymentMethods,
      contactEmail,
      contactPhone,
      maintenanceMode
    } = req.body

    let settings = await MarketplaceSettings.findOne({ key: 'global_settings' })
    if (!settings) {
      settings = new MarketplaceSettings({ key: 'global_settings' })
    }

    if (marketplaceName !== undefined) settings.marketplaceName = marketplaceName.trim()
    if (tagline !== undefined) settings.tagline = tagline.trim()
    if (defaultCommissionPercent !== undefined) settings.defaultCommissionPercent = Number(defaultCommissionPercent)
    if (commissionModel !== undefined) settings.commissionModel = commissionModel
    if (requireSellerApproval !== undefined) settings.requireSellerApproval = Boolean(requireSellerApproval)
    if (requireProductModeration !== undefined) settings.requireProductModeration = Boolean(requireProductModeration)
    if (Array.isArray(supportedPaymentMethods)) settings.supportedPaymentMethods = supportedPaymentMethods
    if (contactEmail !== undefined) settings.contactEmail = contactEmail.trim()
    if (contactPhone !== undefined) settings.contactPhone = contactPhone.trim()
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode)

    await settings.save()

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'owner_admin',
      action: 'MARKETPLACE_SETTINGS_UPDATED',
      entityType: 'MarketplaceSettings',
      entityId: settings._id.toString(),
      details: { marketplaceName: settings.marketplaceName, defaultCommissionPercent: settings.defaultCommissionPercent }
    })

    res.status(200).json({
      message: 'Marketplace settings updated successfully.',
      settings
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/admin/marketplace/audit-logs - Admin audit trail
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (Number(page) - 1) * Number(limit)
    const total = await AuditLog.countDocuments()

    const logs = await AuditLog.find()
      .populate('performedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getAdminDashboard,
  getSellerApplications,
  reviewSellerApplication,
  getAllSellers,
  updateSellerStatus,
  getProductsForModeration,
  moderateProduct,
  getAllOrders,
  verifyOrderPayment,
  getCommissionLedger,
  settleCommissionPayout,
  getAdminSettings,
  updateAdminSettings,
  getAuditLogs
}
