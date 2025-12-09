const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/authMiddleware');
const { sendTelegramMessage } = require('../utils/telegram');

// place order (customer must be logged in and approved)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'admin' && !user.isApproved) return res.status(403).json({ message: 'Not approved' });

        const { items, deliveryLocation, paymentDetails } = req.body; // [{ productId, qty }], "Location", "MpesaCode"
        if (!paymentDetails) return res.status(400).json({ message: 'Payment details required' });
        if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });

        // load products & build order items
        let total = 0;
        const orderItems = [];

        for (const it of items) {
            const prod = await Product.findById(it.productId);
            if (!prod) return res.status(400).json({ message: `Product not found: ${it.productId}` });
            if (prod.stock < it.qty) return res.status(400).json({ message: `Insufficient stock for ${prod.name}` });

            // reduce stock
            prod.stock -= it.qty;
            await prod.save();

            orderItems.push({ product: prod._id, qty: it.qty, price: prod.price });
            total += prod.price * it.qty;
        }

        const order = new Order({ customer: user._id, items: orderItems, total, deliveryLocation, paymentDetails });
        await order.save();

        // Send Telegram message
        const itemsText = orderItems.map(i => `${i.qty} x ${i.product}`).join('\n'); // we will expand product names
        // fetch product names for better message
        // Note: execPopulate() is removed in Mongoose 6+, populate().execPopulate() pattern replaced.
        // However, order is already an instance. We can use populate on it.
        await order.populate('items.product');
        const populated = order; // order is now populated

        // Safety check if product was found and populated
        const prettyItems = populated.items.map(i => {
            const pName = i.product ? i.product.name : 'Unknown Product';
            return `${i.qty} x ${pName} (KES ${i.price})`;
        }).join('\n');

        const text = `<b>New Order</b>\nCustomer: ${user.name}\nTotal: KES ${total}\nLocation: ${deliveryLocation}\nPaid: ${paymentDetails}\nItems:\n${prettyItems}\nOrder ID: ${order._id}`;
        await sendTelegramMessage(text);

        // Emit socket event to admin UI
        const io = req.app.get('io');
        io.emit('newOrder', { id: order._id, customer: user.name, total, items: populated.items, deliveryLocation, paymentDetails });

        return res.json({ message: 'Order placed', order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
