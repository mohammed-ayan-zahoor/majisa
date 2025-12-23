const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const connectDB = require('../config/db');

dotenv.config();

const restoreAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@majisa';

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user already exists. Updating password...');
            admin.password = 'majisa2254';
            await admin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Admin user not found. Creating new admin user...');
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'majisa2254',
                role: 'admin',
                status: 'Active'
            });
            console.log('Admin user created successfully.');
        }

        console.log('Final check:');
        const count = await User.countDocuments({});
        console.log(`Total users in database: ${count}`);

        const allUsers = await User.find({}, 'email role');
        console.log('CurrentUser list:', allUsers);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

restoreAdmin();
