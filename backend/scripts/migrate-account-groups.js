const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const AccountGroup = require('../models/AccountGroup');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateGroups = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Find invalid groups
        const invalidGroups = await AccountGroup.find({
            type: { $in: ['Asset', 'Liability'] }
        });

        console.log(`Found ${invalidGroups.length} groups with invalid types (Asset/Liability).`);

        if (invalidGroups.length === 0) {
            console.log('No migration needed.');
            process.exit(0);
        }

        for (const group of invalidGroups) {
            const oldType = group.type;
            // Strategy: Convert to 'Expense' (safe default) and mark as Legacy
            // We append (Legacy) to name to allow user to identify and fix/delete
            const newName = `${group.name} (Legacy ${oldType})`;

            console.log(`Migrating: ${group.name} (${oldType}) -> ${newName} (Expense)`);

            group.type = 'Expense';
            group.name = newName;
            // Also update code if unique constraint would fail? 
            // The name unique constraint might fail if "Name (Legacy Asset)" already exists, unlikely.

            try {
                await group.save();
                console.log(`  Processed ${group._id}`);
            } catch (err) {
                console.error(`  Failed to save ${group._id}: ${err.message}`);
            }
        }

        console.log('Migration completed.');
        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateGroups();
