const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware } = require('../middleware/authMiddleware');

// list products
router.get('/', async (req, res) => {
    const products = await Product.find().lean();
    res.json(products);
});

// create product (admin will call /api/admin/products in admin routes, but allow here for quick testing)
router.post('/', authMiddleware, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { name, price, stock, description } = req.body;
    const p = new Product({ name, price, stock, description });
    await p.save();
    res.json(p);
});

module.exports = router;
