const Product = require('../models/Product')
const mongoose = require('mongoose')

// GET all products
const getProducts = async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1})
    res.status(200).json(products)
}

// GET a single product
const getProduct = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such product'})
    }
    const product = await Product.findById(id)

    if(!product){
        return res.status(404).json({error: 'no such product'})
    }

    res.status(200).json(product)
}

// POST a new product (Secured: ownership enforced, mass-assignment prevented)
const createProduct = async (req, res) => {
    try {
        const isAdmin = req.user && req.user.role === 'administrator'
        const safePayload = {
            code: req.body.code || `PROD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
            name: req.body.name ? String(req.body.name).trim() : '',
            price: Number(req.body.price),
            discountPrice: req.body.discountPrice ? Number(req.body.discountPrice) : null,
            description: req.body.description ? String(req.body.description).trim() : '',
            categoryId: req.body.categoryId || null,
            brandId: req.body.brandId || null,
            img: req.body.img || '',
            thumbnails: Array.isArray(req.body.thumbnails) ? req.body.thumbnails : [],
            features: Array.isArray(req.body.features) ? req.body.features : [],
            stockQuantity: Math.max(0, parseInt(req.body.stockQuantity, 10) || 0),
            // Non-admin sellers cannot publish directly or assign other sellers
            sellerId: isAdmin ? (req.body.sellerId || req.user._id) : req.user._id,
            status: isAdmin ? (req.body.status || 'approved') : 'pending_review',
            published: isAdmin ? (req.body.published !== undefined ? !!req.body.published : true) : false,
            isFeatured: isAdmin ? !!req.body.isFeatured : false
        }

        if (!safePayload.name || isNaN(safePayload.price)) {
            return res.status(400).json({ error: 'Product name and valid price are mandatory.' })
        }

        const product = await Product.create(safePayload)
        res.status(201).json(product)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a product (Secured: requires product ownership or administrator role)
const deleteProduct = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such product'})
    }
    const product = await Product.findById(id)

    if(!product){
        return res.status(404).json({error: 'no such product'})
    }

    const isOwner = product.sellerId && product.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot delete products belonging to another seller.' })
    }

    product.status = 'archived'
    product.published = false
    await product.save()

    res.status(200).json({ message: 'Product archived successfully.', _id: id })
}

// UPDATE a product (Secured: ownership enforced, strict field allowlisting)
const updateProduct = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such product'})
    }

    const product = await Product.findById(id)
    if(!product){
        return res.status(404).json({error: 'no such product'})
    }

    const isOwner = product.sellerId && product.sellerId.toString() === req.user._id.toString()
    const isAdmin = req.user && req.user.role === 'administrator'
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Access forbidden: You cannot modify products belonging to another seller.' })
    }

    // Strict field allowlisting to prevent mass assignment
    if (req.body.name !== undefined) product.name = String(req.body.name).trim()
    if (req.body.price !== undefined) product.price = Number(req.body.price)
    if (req.body.discountPrice !== undefined) product.discountPrice = req.body.discountPrice ? Number(req.body.discountPrice) : null
    if (req.body.description !== undefined) product.description = String(req.body.description).trim()
    if (req.body.categoryId !== undefined) product.categoryId = req.body.categoryId
    if (req.body.brandId !== undefined) product.brandId = req.body.brandId
    if (req.body.img !== undefined) product.img = req.body.img
    if (req.body.thumbnails !== undefined) product.thumbnails = req.body.thumbnails
    if (req.body.features !== undefined) product.features = req.body.features
    if (req.body.stockQuantity !== undefined) product.stockQuantity = Math.max(0, parseInt(req.body.stockQuantity, 10) || 0)

    // Privileged administrative fields
    if (isAdmin) {
        if (req.body.sellerId !== undefined) product.sellerId = req.body.sellerId
        if (req.body.status !== undefined) product.status = req.body.status
        if (req.body.published !== undefined) product.published = !!req.body.published
        if (req.body.isFeatured !== undefined) product.isFeatured = !!req.body.isFeatured
        if (req.body.rejectionReason !== undefined) product.rejectionReason = req.body.rejectionReason
        if (req.body.moderationNotes !== undefined) product.moderationNotes = req.body.moderationNotes
    } else {
        // If seller updates product, move to review queue unless draft
        if (product.status === 'rejected' || req.body.submitForReview) {
            product.status = 'pending_review'
            product.published = false
            product.rejectionReason = ''
        }
    }

    await product.save()
    res.status(200).json(product)
}

const getProductsByCategoryNoImages = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId, published: true })
        .select('_id name price description categoryId brandId features thumbnails published')
        res.status(200).json(products)
    } catch (err) {
        res.status(400).send(err.message)
    }
}

// Get all products by category
const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId, published: true })
        res.status(200).json(products)
    } catch (err) {
        res.status(400).send(err.message)
    }
}

const getProductsNoImages = async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1})
    .select('_id name price description categoryId brandId features thumbnails published')
    res.status(200).json(products)
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct,
    getProductsByCategory,
    getProductsByCategoryNoImages,
    getProductsNoImages
}