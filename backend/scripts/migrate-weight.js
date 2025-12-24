const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const migrateWeight = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for migration...');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const product of products) {
            // Check if weight is a single string (legacy data)
            if (typeof product.weight === 'string' || (Array.isArray(product.weight) === false && product.weight !== undefined)) {
                const oldWeight = product.weight;
                product.weight = [String(oldWeight)];
                await product.save();
                updatedCount++;
                console.log(`Migrated product: ${product.name} (${oldWeight} -> [${product.weight}])`);
            } else if (product.weight === undefined || product.weight === null) {
                product.weight = [];
                await product.save();
                updatedCount++;
                console.log(`Initialized empty weight for: ${product.name}`);
            }
        }

        console.log(`Migration complete! Updated ${updatedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateWeight();
