const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// register (creates unapproved customer by default)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashed });
        await user.save();
        return res.json({ message: 'Registration received. Wait for admin approval.' });
    } catch (err) {
        return res.status(400).json({ message: 'Error', error: err.message });
    }
});

// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isApproved && user.role !== 'admin') return res.status(403).json({ message: 'Account not approved yet' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

// helper route to create an initial admin (only if none exists) -- for quick local setup
router.post('/create-initial-admin', async (req, res) => {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing' });
    const hashed = await bcrypt.hash(password, 10);
    const admin = new User({ name, email, password: hashed, role: 'admin', isApproved: true });
    await admin.save();
    return res.json({ message: 'Admin created', admin: { id: admin._id, email: admin.email } });
});

module.exports = router;
