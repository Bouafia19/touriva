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

// POST a new product
const createProduct = async (req, res) => {
    try {
        // add doc to db
        const product = await Product.create(req.body)
        res.status(200).json(product)
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// DELETE a product
const deleteProduct = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such product'})
    }
    const product = await Product.findOneAndDelete({_id: id})

    if(!product){
        return res.status(404).json({error: 'no such product'})
    }

    res.status(200).json(product)
}

// UPDATE a product
const updateProduct = async (req, res) => {
    const {id} = req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'no such product'})
    }
    const product = await Product.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!product){
        return res.status(404).json({error: 'no such product'})
    }

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