const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

async function migrateCategoryOrder() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/majisa_jewellers');
        console.log('✅ Connected to MongoDB');

        // Get all categories sorted by creation date
        const categories = await Category.find({}).sort({ createdAt: 1 });
        console.log(`📊 Found ${categories.length} categories`);

        if (categories.length === 0) {
            console.log('No categories to migrate');
            process.exit(0);
        }

        // Check if migration is needed by detecting duplicate displayOrder values
        // If multiple categories have the same displayOrder, they need proper sequential order
        const displayOrders = categories.map(cat => cat.displayOrder);
        const uniqueOrders = new Set(displayOrders);
        const hasDuplicates = displayOrders.length !== uniqueOrders.size;

        if (!hasDuplicates) {
            console.log('⏭️  Categories already have unique displayOrder values. Skipping migration.');
            const sorted = await Category.find({}).sort({ displayOrder: 1 });
            sorted.forEach(cat => {
                console.log(`  ${cat.displayOrder + 1}. ${cat.name} (displayOrder: ${cat.displayOrder})`);
            });
            process.exit(0);
        }

        console.log(`⚠️  Found duplicate displayOrder values. Running migration...`);

        // Use bulkWrite for atomic operation
        const bulkOps = categories.map((cat, index) => ({
            updateOne: {
                filter: { _id: cat._id },
                update: { $set: { displayOrder: index } }
            }
        }));

        await Category.bulkWrite(bulkOps);

        console.log('✅ Migration complete!');
        console.log('\nCategory order:');

        // Display the new order
        const updatedCategories = await Category.find({}).sort({ displayOrder: 1 });
        updatedCategories.forEach(cat => {
            console.log(`  ${cat.displayOrder + 1}. ${cat.name} (displayOrder: ${cat.displayOrder})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateCategoryOrder();
