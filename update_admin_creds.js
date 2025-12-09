require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {})
    .then(async () => {
        console.log('Connected to DB');

        const newEmail = 'admin@maslaw';
        const newPass = '1850';
        const hashed = await bcrypt.hash(newPass, 10);

        // Find existing admin (role: admin)
        const admin = await User.findOne({ role: 'admin' });

        if (admin) {
            admin.email = newEmail;
            admin.password = hashed;
            await admin.save();
            console.log(`Admin updated! Email: ${newEmail}, Password: ${newPass}`);
        } else {
            console.log('No admin found to update. creating one...');
            const newAdmin = new User({
                name: 'Super Admin',
                email: newEmail,
                password: hashed,
                role: 'admin',
                isApproved: true
            });
            await newAdmin.save();
            console.log(`Admin created! Email: ${newEmail}, Password: ${newPass}`);
        }

        mongoose.connection.close();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
