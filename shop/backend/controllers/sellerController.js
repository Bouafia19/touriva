const mongoose = require('mongoose')
const Product = require('../models/Product')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const SellerProfile = require('../models/SellerProfile')
const Commission = require('../models/Commission')
const AuditLog = require('../models/AuditLog')

// GET /api/seller/profile - Get current seller profile
const getSellerProfile = async (req, res) => {
  try {
    let profile = await SellerProfile.findOne({ userId: req.user._id })
    if (!profile) {
      // Auto-initialize if user is seller role
      profile = await SellerProfile.create({
        userId: req.user._id,
        storeName: req.user.companyName || `${req.user.firstName || 'Boutique'} ${req.user.lastName || 'Vendeur'}`,
        storeSlug: `store-${req.user._id.toString().slice(-6)}`,
        phone: req.user.phone || '+213550000000',
        email: req.user.email,
        wilaya: 'Alger'
      })
    }
    res.status(200).json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/seller/profile - Update store details
const updateSellerProfile = async (req, res) => {
  try {
    const { storeName, bio, logo, banner, phone, address, wilaya, city } = req.body
    let profile = await SellerProfile.findOne({ userId: req.user._id })
    if (!profile) {
      return res.status(404).json({ error: 'Seller profile not found' })
    }

    if (storeName && storeName.trim() !== profile.storeName) {
      profile.storeName = storeName.trim()
      profile.storeSlug = storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + `-${req.user._id.toString().slice(-4)}`
    }
    if (bio !== undefined) profile.bio = bio
    if (logo !== undefined) profile.logo = logo
    if (banner !== undefined) profile.banner = banner
    if (phone) profile.phone = phone.trim()
    if (address !== undefined) profile.address = address.trim()
    if (wilaya) profile.wilaya = wilaya.trim()
    if (city !== undefined) profile.city = city.trim()

    await profile.save()
    res.status(200).json({ message: 'Profile updated successfully', profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/seller/dashboard - Real metrics from DB
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id

    // Product counts
    const totalProducts = await Product.countDocuments({ sellerId })
    const publishedProducts = await Product.countDocuments({ sellerId, status: 'approved', published: true })
    const pendingProducts = await Product.countDocuments({ sellerId, status: 'pending_review' })
    const rejectedProducts = await Product.countDocuments({ sellerId, status: 'rejected' })
    const draftProducts = await Product.countDocuments({ sellerId, status: 'draft' })

    // Order item counts
    const totalOrderItems = await OrderItem.countDocuments({ sellerId })
    const pendingOrderItems = await OrderItem.countDocuments({ sellerId, fulfillmentStatus: 'pending' })
    const preparingOrderItems = await OrderItem.countDocuments({ sellerId, fulfillmentStatus: 'preparing' })
    const shippedOrderItems = await OrderItem.countDocuments({ sellerId, fulfillmentStatus: 'shipped' })
    const deliveredOrderItems = await OrderItem.countDocuments({ sellerId, fulfillmentStatus: 'delivered' })

    // Revenue calculations from delivered or confirmed order items
    const deliveredItems = await OrderItem.find({ sellerId, fulfillmentStatus: { $in: ['shipped', 'delivered'] } })
    const grossRevenueDZD = deliveredItems.reduce((acc, item) => acc + (item.totalItemPriceDZD || 0), 0)

    // Commissions accrued
    const commissions = await Commission.find({ sellerId })
    const totalCommissionsDZD = commissions.reduce((acc, c) => acc + (c.commissionAmountDZD || 0), 0)
    const netEarningsDZD = grossRevenueDZD - totalCommissionsDZD

    // Recent orders (last 5)
    const recentItems = await OrderItem.find({ sellerId })
      .populate('orderId', 'orderNumber customerInfo paymentMethod paymentStatus createdAt')
      .populate('productId', 'name code img')
      .sort({ createdAt: -1 })
      .limit(5)

    // Low stock alerts (stock < 5)
    const lowStockAlerts = await Product.find({ sellerId, stockQuantity: { $lte: 5 } })
      .select('name code stockQuantity price')
      .limit(5)

    res.status(200).json({
      metrics: {
        products: {
          total: totalProducts,
          published: publishedProducts,
          pending: pendingProducts,
          rejected: rejectedProducts,
          draft: draftProducts
        },
        orders: {
          total: totalOrderItems,
          pending: pendingOrderItems,
          preparing: preparingOrderItems,
          shipped: shippedOrderItems,
          delivered: deliveredOrderItems
        },
        finances: {
          currency: 'DZD',
          grossRevenueDZD,
          totalCommissionsDZD,
          netEarningsDZD
        }
      },
      recentOrders: recentItems,
      lowStockAlerts
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/seller/products - Get seller's own products
const getSellerProducts = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query
    const query = { sellerId: req.user._id }

    if (status && status !== 'all') {
      query.status = status
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
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

// POST /api/seller/products - Create product for seller
const createSellerProduct = async (req, res) => {
  try {
    // Enforce seller suspension check
    if (req.user.role !== 'administrator') {
      const profile = await SellerProfile.findOne({ userId: req.user._id })
      if (profile && profile.isSuspended) {
        return res.status(403).json({
          error: 'Your seller account is currently suspended. You cannot create new products.',
          suspensionReason: profile.suspensionReason
        })
      }
    }

    const {
      name,
      price,
      discountPrice,
      description,
      categoryId,
      brandId,
      img,
      thumbnails,
      features,
      stockQuantity = 10,
      saveAsDraft = false
    } = req.body

    if (!name || !price) {
      return res.status(400).json({ error: 'Product name and price are mandatory.' })
    }

    // Generate unique code if not provided
    const code = req.body.code || `PROD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`

    const status = saveAsDraft ? 'draft' : 'pending_review'
    const published = false // Must be moderated by owner before becoming publicly visible

    const product = await Product.create({
      code,
      name: name.trim(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      description: description ? description.trim() : '',
      categoryId: categoryId || null,
      brandId: brandId || null,
      sellerId: req.user._id,
      img: img || '',
      thumbnails: Array.isArray(thumbnails) ? thumbnails : (img ? [img] : []),
      features: Array.isArray(features) ? features : [],
      stockQuantity: Math.max(0, parseInt(stockQuantity) || 0),
      status,
      published,
      rejectionReason: '',
      moderationNotes: ''
    })

    await AuditLog.create({
      performedBy: req.user._id,
      actorRole: 'seller',
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product._id.toString(),
      details: { name: product.name, status: product.status }
    })

    res.status(201).json({
      message: saveAsDraft ? 'Product saved as draft.' : 'Product submitted for administrative review.',
      product
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// PUT /api/seller/products/:id - Update own product
const updateSellerProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    // Strict ownership verification (prevent IDOR)
    const isOwner = product.sellerId && product.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot modify products belonging to another seller.' })
    }

    // Enforce seller suspension check
    if (!isAdmin) {
      const profile = await SellerProfile.findOne({ userId: req.user._id })
      if (profile && profile.isSuspended) {
        return res.status(403).json({
          error: 'Your seller account is currently suspended. Product modifications are disabled.',
          suspensionReason: profile.suspensionReason
        })
      }
    }

    const {
      name,
      price,
      discountPrice,
      description,
      categoryId,
      brandId,
      img,
      thumbnails,
      features,
      stockQuantity,
      submitForReview
    } = req.body

    if (name) product.name = name.trim()
    if (price !== undefined) product.price = Number(price)
    if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null
    if (description !== undefined) product.description = description.trim()
    if (categoryId !== undefined) product.categoryId = categoryId
    if (brandId !== undefined) product.brandId = brandId
    if (img !== undefined) product.img = img
    if (thumbnails !== undefined) product.thumbnails = thumbnails
    if (features !== undefined) product.features = features
    if (stockQuantity !== undefined) product.stockQuantity = Math.max(0, parseInt(stockQuantity) || 0)

    // If seller updates a rejected or draft product and requests submission
    if (submitForReview || product.status === 'rejected') {
      product.status = 'pending_review'
      product.published = false
      product.rejectionReason = ''
    }

    await product.save()

    res.status(200).json({
      message: 'Product updated successfully.',
      product
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/seller/products/:id - Delete or archive own product
const deleteSellerProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' })
    }

    const isOwner = product.sellerId && product.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot delete products belonging to another seller.' })
    }

    // Set to archived to preserve referential integrity for existing orders
    product.status = 'archived'
    product.published = false
    await product.save()

    res.status(200).json({ message: 'Product archived successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/seller/orders - Get order items for this seller
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id
    const { fulfillmentStatus, page = 1, limit = 20 } = req.query

    const query = { sellerId }
    if (fulfillmentStatus && fulfillmentStatus !== 'all') {
      query.fulfillmentStatus = fulfillmentStatus
    }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await OrderItem.countDocuments(query)

    const items = await OrderItem.find(query)
      .populate({
        path: 'orderId',
        select: 'orderNumber customerInfo paymentMethod paymentStatus overallStatus createdAt'
      })
      .populate('productId', 'name code img')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      orderItems: items,
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

// PUT /api/seller/orders/:orderItemId/fulfillment - Update item fulfillment status
const updateFulfillmentStatus = async (req, res) => {
  try {
    const { orderItemId } = req.params
    const { fulfillmentStatus, shippingCarrier, trackingNumber } = req.body

    const item = await OrderItem.findById(orderItemId)
    if (!item) {
      return res.status(404).json({ error: 'Order item not found.' })
    }

    // Ownership check
    const isOwner = item.sellerId && item.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access forbidden: You cannot update order items for another seller.' })
    }

    if (!['pending', 'preparing', 'shipped', 'delivered', 'cancelled'].includes(fulfillmentStatus)) {
      return res.status(400).json({ error: 'Invalid fulfillment status.' })
    }

    const previousStatus = item.fulfillmentStatus
    item.fulfillmentStatus = fulfillmentStatus
    if (shippingCarrier !== undefined) item.shippingCarrier = shippingCarrier.trim()
    if (trackingNumber !== undefined) item.trackingNumber = trackingNumber.trim()
    if (fulfillmentStatus === 'shipped' && !item.shippedAt) item.shippedAt = new Date()
    if (fulfillmentStatus === 'delivered' && !item.deliveredAt) item.deliveredAt = new Date()

    // Restore stock to catalog if merchant or admin cancels this order item
    if (fulfillmentStatus === 'cancelled' && previousStatus !== 'cancelled') {
      await Product.updateOne({ _id: item.productId }, { $inc: { stockQuantity: item.quantity } })
    }

    await item.save()

    // Update parent order overall status if all items are delivered or shipped
    const siblingItems = await OrderItem.find({ orderId: item.orderId })
    const allDelivered = siblingItems.every(i => i.fulfillmentStatus === 'delivered')
    const allShippedOrDelivered = siblingItems.every(i => ['shipped', 'delivered'].includes(i.fulfillmentStatus))

    const parentOrder = await Order.findById(item.orderId)
    if (parentOrder) {
      if (allDelivered) {
        parentOrder.overallStatus = 'completed'
        parentOrder.status = 'completed'
      } else if (allShippedOrDelivered) {
        parentOrder.overallStatus = 'processing'
      }
      await parentOrder.save()
    }

    res.status(200).json({
      message: 'Fulfillment status updated successfully.',
      orderItem: item
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/seller/finances - Commissions & net payouts
const getSellerFinances = async (req, res) => {
  try {
    const sellerId = req.user._id
    const commissions = await Commission.find({ sellerId })
      .populate('orderId', 'orderNumber paymentStatus createdAt')
      .populate('orderItemId', 'productName unitPriceDZD quantity totalItemPriceDZD fulfillmentStatus')
      .sort({ createdAt: -1 })

    const totalGross = commissions.reduce((acc, c) => acc + c.grossAmountDZD, 0)
    const totalCommission = commissions.reduce((acc, c) => acc + c.commissionAmountDZD, 0)
    const totalNetPayout = commissions.reduce((acc, c) => acc + c.sellerPayoutDZD, 0)
    const pendingPayout = commissions.filter(c => c.status === 'accrued').reduce((acc, c) => acc + c.sellerPayoutDZD, 0)
    const settledPayout = commissions.filter(c => c.status === 'paid_to_seller').reduce((acc, c) => acc + c.sellerPayoutDZD, 0)

    res.status(200).json({
      summary: {
        currency: 'DZD',
        totalGrossDZD: totalGross,
        totalCommissionDZD: totalCommission,
        totalNetPayoutDZD: totalNetPayout,
        pendingPayoutDZD: pendingPayout,
        settledPayoutDZD: settledPayout
      },
      commissions
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getSellerProfile,
  updateSellerProfile,
  getSellerDashboard,
  getSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerOrders,
  updateFulfillmentStatus,
  getSellerFinances
}
