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

        // Check if migration is needed
        const needsMigration = categories.every(cat => cat.displayOrder === 0);

        if (!needsMigration) {
            console.log('⏭️  Categories already have displayOrder values. Skipping migration.');
            process.exit(0);
        }

        console.log('🔄 Setting sequential displayOrder for all categories...');

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
