const mongoose = require('mongoose')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Brand = require('../models/Brand')
const Order = require('../models/Order')
const OrderItem = require('../models/OrderItem')
const SellerApplication = require('../models/SellerApplication')
const SellerProfile = require('../models/SellerProfile')
const MarketplaceSettings = require('../models/MarketplaceSettings')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')

// GET /api/marketplace/settings - Public settings
const getMarketplaceSettings = async (req, res) => {
  try {
    let settings = await MarketplaceSettings.findOne({ key: 'global_settings' })
    if (!settings) {
      settings = await MarketplaceSettings.create({
        key: 'global_settings',
        marketplaceName: 'Touriva Marketplace',
        tagline: "Le Marché Central de l'Artisanat & du Terroir Algérien",
        defaultCommissionPercent: 10,
        supportedPaymentMethods: ['baridimob', 'cash_on_delivery', 'ccp'],
        contactEmail: 'contact@market.touriva.nextchallenge.tech',
        contactPhone: '+213552569654'
      })
    }
    res.status(200).json({
      marketplaceName: settings.marketplaceName,
      tagline: settings.tagline,
      supportedPaymentMethods: settings.supportedPaymentMethods,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      maintenanceMode: settings.maintenanceMode
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/products - Public product browsing with search & filters
const getPublicProducts = async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, sort, page = 1, limit = 20, seller } = req.query

    // Only approved and published products
    const query = {
      status: 'approved',
      published: true
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.categoryId = category
      } else {
        const catDoc = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') })
        if (catDoc) query.categoryId = catDoc._id
      }
    }

    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
      query.brandId = brand
    }

    if (seller && mongoose.Types.ObjectId.isValid(seller)) {
      query.sellerId = seller
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { code: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { price: 1 }
    if (sort === 'price_desc') sortOption = { price: -1 }
    if (sort === 'newest') sortOption = { createdAt: -1 }
    if (sort === 'popular') sortOption = { isFeatured: -1, createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .populate('categoryId', 'name img')
      .populate('brandId', 'name')
      .populate('sellerId', 'firstName lastName companyName')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    // Attach seller profile info if available
    const sellerIds = products.map(p => p.sellerId?._id).filter(Boolean)
    const profiles = await SellerProfile.find({ userId: { $in: sellerIds }, isSuspended: false })
    const profileMap = new Map(profiles.map(pr => [pr.userId.toString(), pr]))

    const enrichedProducts = products.map(p => {
      const obj = p.toObject()
      if (p.sellerId && profileMap.has(p.sellerId._id.toString())) {
        const sp = profileMap.get(p.sellerId._id.toString())
        obj.sellerProfile = {
          storeName: sp.storeName,
          storeSlug: sp.storeSlug,
          wilaya: sp.wilaya,
          logo: sp.logo,
          rating: sp.rating
        }
      }
      return obj
    })

    res.status(200).json({
      products: enrichedProducts,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)) || 1,
        limit: Number(limit)
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/products/:id - Single product details
const getPublicProduct = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const product = await Product.findOne({ _id: id, status: 'approved', published: true })
      .populate('categoryId', 'name img')
      .populate('brandId', 'name')
      .populate('sellerId', 'firstName lastName companyName')

    if (!product) {
      return res.status(404).json({ error: 'Product not found or not currently available' })
    }

    const obj = product.toObject()
    if (product.sellerId) {
      const sp = await SellerProfile.findOne({ userId: product.sellerId._id, isSuspended: false })
      if (sp) {
        obj.sellerProfile = {
          storeName: sp.storeName,
          storeSlug: sp.storeSlug,
          bio: sp.bio,
          wilaya: sp.wilaya,
          logo: sp.logo,
          rating: sp.rating,
          totalSalesCount: sp.totalSalesCount
        }
      }
    }

    res.status(200).json(obj)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/featured - Homepage showcase
const getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ status: 'approved', published: true })
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(8)

    const newArrivals = await Product.find({ status: 'approved', published: true })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(8)

    const topCategories = await Category.find().limit(8)
    const featuredSellers = await SellerProfile.find({ isApproved: true, isSuspended: false }).limit(6)

    res.status(200).json({
      featured,
      newArrivals,
      categories: topCategories,
      featuredSellers
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/categories - Categories catalog
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json(categories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/sellers - Public verified sellers list
const getPublicSellers = async (req, res) => {
  try {
    const sellers = await SellerProfile.find({ isApproved: true, isSuspended: false })
      .select('storeName storeSlug logo banner bio wilaya rating totalSalesCount')
      .sort({ rating: -1, totalSalesCount: -1 })
    res.status(200).json(sellers)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/sellers/:slug - Public seller store view
const getPublicSellerStore = async (req, res) => {
  try {
    const { slug } = req.params
    const profile = await SellerProfile.findOne({ storeSlug: slug.toLowerCase().trim(), isApproved: true, isSuspended: false })
    if (!profile) {
      return res.status(404).json({ error: 'Store not found or currently unavailable' })
    }

    const products = await Product.find({ sellerId: profile.userId, status: 'approved', published: true })
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      seller: {
        storeName: profile.storeName,
        storeSlug: profile.storeSlug,
        logo: profile.logo,
        banner: profile.banner,
        bio: profile.bio,
        wilaya: profile.wilaya,
        city: profile.city,
        rating: profile.rating,
        totalSalesCount: profile.totalSalesCount
      },
      products
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/marketplace/sellers/apply - Public seller application
const applyForSeller = async (req, res) => {
  try {
    const {
      storeName,
      legalRepresentativeName,
      email,
      phone,
      wilaya,
      city,
      address,
      businessCategory,
      businessDescription,
      rcNumber,
      nifNumber
    } = req.body

    if (!storeName || !legalRepresentativeName || !email || !phone || !wilaya || !address || !businessDescription) {
      return res.status(400).json({ error: 'All mandatory business fields must be provided' })
    }

    // Check for existing pending application
    const existing = await SellerApplication.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { phone: phone.trim() }],
      status: 'pending'
    })
    if (existing) {
      return res.status(400).json({ error: 'A pending application with this email or phone number is already being reviewed.' })
    }

    const app = await SellerApplication.create({
      storeName: storeName.trim(),
      legalRepresentativeName: legalRepresentativeName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      wilaya: wilaya.trim(),
      city: city ? city.trim() : '',
      address: address.trim(),
      businessCategory: businessCategory || 'Artisanat & Terroir',
      businessDescription: businessDescription.trim(),
      rcNumber: rcNumber ? rcNumber.trim() : '',
      nifNumber: nifNumber ? nifNumber.trim() : '',
      status: 'pending'
    })

    // Log action
    await AuditLog.create({
      action: 'SELLER_APPLICATION_SUBMITTED',
      entityType: 'SellerApplication',
      entityId: app._id.toString(),
      details: { storeName: app.storeName, email: app.email, phone: app.phone }
    })

    res.status(201).json({
      message: 'Your seller application has been submitted successfully and is awaiting review by Touriva Marketplace administration.',
      applicationId: app._id,
      status: app.status
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/marketplace/orders - Customer checkout (multi-vendor cart)
const createMarketplaceOrder = async (req, res) => {
  try {
    const { items, customerInfo, paymentMethod, deliveryFeeDZD = 600 } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one product item.' })
    }

    if (!customerInfo || !customerInfo.fullName || !customerInfo.phone || !customerInfo.shippingAddress || !customerInfo.wilaya) {
      return res.status(400).json({ error: 'Customer name, phone, wilaya, and shipping address are mandatory.' })
    }

    // Generate unique order number: TRV-MKT-YYYY-XXXXX
    const year = new Date().getFullYear()
    const randomHex = Math.floor(10000 + Math.random() * 90000)
    const orderNumber = `TRV-MKT-${year}-${randomHex}`

    // Fetch products from DB to ensure prices cannot be tampered with by the client
    const productIds = items.map(i => i.productId)
    const dbProducts = await Product.find({ _id: { $in: productIds }, status: 'approved', published: true })
    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]))

    let subtotalDZD = 0
    const orderItemsToCreate = []

    for (const item of items) {
      const p = productMap.get(item.productId)
      if (!p) {
        return res.status(400).json({ error: `Product ID ${item.productId} is unavailable or no longer in stock.` })
      }
      const qty = Math.max(1, parseInt(item.quantity) || 1)
      const unitPrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price
      const totalItemPrice = unitPrice * qty
      subtotalDZD += totalItemPrice

      orderItemsToCreate.push({
        productId: p._id,
        sellerId: p.sellerId || null,
        productName: p.name,
        productCode: p.code,
        productImage: p.img || (p.thumbnails && p.thumbnails[0]) || '',
        unitPriceDZD: unitPrice,
        quantity: qty,
        totalItemPriceDZD: totalItemPrice,
        fulfillmentStatus: 'pending'
      })
    }

    const totalAmountDZD = subtotalDZD + Number(deliveryFeeDZD)
    const userId = req.user ? req.user._id : null

    // Create primary Order
    const order = await Order.create({
      orderNumber,
      userId,
      customerInfo: {
        fullName: customerInfo.fullName.trim(),
        email: customerInfo.email ? customerInfo.email.trim() : '',
        phone: customerInfo.phone.trim(),
        wilaya: customerInfo.wilaya.trim(),
        city: customerInfo.city ? customerInfo.city.trim() : '',
        shippingAddress: customerInfo.shippingAddress.trim(),
        notes: customerInfo.notes ? customerInfo.notes.trim() : ''
      },
      subtotalDZD,
      deliveryFeeDZD,
      totalAmountDZD,
      amount: totalAmountDZD, // for legacy compatibility
      paymentMethod: ['baridimob', 'cash_on_delivery', 'ccp'].includes(paymentMethod) ? paymentMethod : 'cash_on_delivery',
      paymentStatus: 'pending_verification',
      overallStatus: 'pending',
      status: 'pending' // for legacy compatibility
    })

    // Create OrderItem records linked to order
    const createdItemIds = []
    for (const itemData of orderItemsToCreate) {
      itemData.orderId = order._id
      const oi = await OrderItem.create(itemData)
      createdItemIds.push(oi._id)
    }

    order.items = createdItemIds
    await order.save()

    // Audit log
    await AuditLog.create({
      performedBy: userId,
      action: 'ORDER_CREATED',
      entityType: 'Order',
      entityId: order._id.toString(),
      details: { orderNumber, totalAmountDZD, itemCount: items.length }
    })

    res.status(201).json({
      message: 'Order created successfully.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmountDZD: order.totalAmountDZD,
        subtotalDZD: order.subtotalDZD,
        deliveryFeeDZD: order.deliveryFeeDZD,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        overallStatus: order.overallStatus,
        customerInfo: order.customerInfo,
        createdAt: order.createdAt
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/orders/my - Customer order history
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate({
        path: 'items',
        populate: { path: 'productId', select: 'name code img price' }
      })
      .sort({ createdAt: -1 })
    res.status(200).json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/marketplace/orders/:id - Customer order details
const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params
    let order = null
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate('items')
    } else {
      order = await Order.findOne({ orderNumber: id }).populate('items')
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // If authenticated user is requesting, ensure ownership unless admin
    if (req.user) {
      const isOwner = order.userId && order.userId.toString() === req.user._id.toString()
      const isAdmin = req.user.role === 'administrator'
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Unauthorized to view this order.' })
      }
    }

    res.status(200).json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /api/marketplace/orders/:id/payment-proof - Upload BaridiMob/CCP receipt
const submitPaymentProof = async (req, res) => {
  try {
    const { id } = req.params
    const { transactionReference, receiptImageUrl } = req.body

    const order = await Order.findById(id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (req.user && order.userId && order.userId.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
      return res.status(403).json({ error: 'Unauthorized to submit proof for this order.' })
    }

    order.paymentProof = {
      transactionReference: transactionReference ? transactionReference.trim() : '',
      receiptImageUrl: receiptImageUrl || '',
      submittedAt: new Date()
    }
    order.paymentStatus = 'pending_verification'
    await order.save()

    res.status(200).json({
      message: 'Payment proof submitted successfully. Waiting for administrator verification.',
      orderNumber: order.orderNumber,
      paymentProof: order.paymentProof
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getMarketplaceSettings,
  getPublicProducts,
  getPublicProduct,
  getFeaturedProducts,
  getCategories,
  getPublicSellers,
  getPublicSellerStore,
  applyForSeller,
  createMarketplaceOrder,
  getMyOrders,
  getOrderDetails,
  submitPaymentProof
}
