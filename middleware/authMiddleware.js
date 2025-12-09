const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid', error: err.message });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    next();
};

module.exports = { authMiddleware, adminOnly };
