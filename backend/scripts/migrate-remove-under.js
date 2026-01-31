const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AccountGroup = require('../models/AccountGroup');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateRemoveUnder = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        console.log('Starting migration: Unsetting "under" field in AccountGroups...');

        // Update all documents to unset the 'under' field
        const result = await AccountGroup.updateMany(
            { under: { $exists: true } },
            { $unset: { under: "" } }
        );

        console.log(`Migration completed.`);
        console.log(`Modified count: ${result.modifiedCount}`);
        console.log(`Matched count: ${result.matchedCount}`);

        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateRemoveUnder();
