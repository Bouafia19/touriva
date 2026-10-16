const express = require('express')

const router = express.Router()

const requireAuth = require('../middleware/requireAuth')

// controller functions
const { 
    getOrders,
    getOrder,
    createOrder,
    deleteOrder,
    updateOrder,
    getOrdersByUserId } = require('../controllers/ordersController')


// GET all orders
router.get('/', getOrders)

// require auth for all routes
router.use(requireAuth)

// GET a single order
router.get('/:id', getOrder)
  
// POST a new order
router.post('/', createOrder)

// DELETE a order
router.delete('/:id', deleteOrder)

// UPDATE a order
router.patch('/:id', updateOrder)

// GET orders by transporterId
router.get('/getOrdersByUserId/:id', getOrdersByUserId)

module.exports = router