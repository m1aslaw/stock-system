const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    qty: Number,
    price: Number
});

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    total: Number,
    deliveryLocation: String,
    paymentDetails: String, // Mpesa code or Name
    status: { type: String, enum: ['pending', 'verified', 'payment_failed', 'delivered', 'cancelled'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
