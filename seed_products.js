require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect(process.env.MONGO_URI, {})
    .then(async () => {
        console.log('Connected to DB');

        // Clear existing to avoid confusion or duplicates with different prices
        // await Product.deleteMany({}); 

        const products = [
            { name: 'Pen', price: 100, stock: 50, description: 'Blue Ink Pen' },
            { name: 'Cookie', price: 150, stock: 50, description: 'Choco Chip Cookie' }
        ];

        for (const p of products) {
            await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
            console.log(`Seeded Product: ${p.name} @ KES ${p.price}`);
        }

        console.log('Done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Seeding Error:', err);
        process.exit(1);
    });
