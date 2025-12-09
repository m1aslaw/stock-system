require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const socketio = require('socket.io');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());

// make io available in req.app.locals
app.set('io', io);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// simple admin static page to receive socket notifications
// server.js updates not needed for this logic change, we update index.html
app.use('/admin', express.static(__dirname + '/admin-public'));
app.use('/store', express.static(__dirname + '/admin-public/customer.html')); // Serve customer page
app.get('/', (req, res) => {
    res.redirect('/store');
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI, {})
    .then(() => {
        console.log('MongoDB connected');
        server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('Mongo connection error', err);
    });

// Socket.IO connection log
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});
