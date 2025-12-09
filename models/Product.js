const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: { type: Number, default: 0 },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
