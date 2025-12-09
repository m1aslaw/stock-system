const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// all routes here require admin
router.use(authMiddleware, adminOnly);

// create product
router.post('/products', async (req, res) => {
    const { name, price, stock, description } = req.body;
    const p = new Product({ name, price, stock, description });
    await p.save();
    res.json(p);
});

// update product stock
router.put('/products/:id', async (req, res) => {
    const { stock, name, price, description } = req.body;
    const p = await Product.findByIdAndUpdate(req.params.id, { stock, name, price, description }, { new: true });
    res.json(p);
});

// view orders
router.get('/orders', async (req, res) => {
    const orders = await Order.find().populate('customer').populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
});

// change order status
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    const o = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('customer').populate('items.product');

    // Notify Customer via Socket
    const io = req.app.get('io');
    io.emit('orderStatusChanged', {
        orderId: o._id,
        status: o.status,
        customer: o.customer ? o.customer._id : null
    });

    res.json(o);
});

// Verify Payment
router.put('/orders/:id/verify', async (req, res) => {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: 'verified' }, { new: true });

    const io = req.app.get('io');
    io.emit('orderStatusChanged', {
        orderId: o._id,
        status: 'verified',
        message: "Come for your order within 5 minutes"
    });

    res.json(o);
});

// Reject Payment
router.put('/orders/:id/reject', async (req, res) => {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: 'payment_failed' }, { new: true });

    const io = req.app.get('io');
    io.emit('orderStatusChanged', {
        orderId: o._id,
        status: 'payment_failed',
        message: "Payment details are wrong"
    });

    res.json(o);
});

// list users
router.get('/users', async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
});

// approve user
router.put('/users/:id/approve', async (req, res) => {
    const u = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json(u);
});

// RESET SYSTEM (Delete all orders, Set stock to 0)
router.post('/reset', async (req, res) => {
    try {
        await Order.deleteMany({});
        await Product.updateMany({}, { stock: 0 });
        res.json({ message: 'System Reset: Orders cleared, Stocks set to 0.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
