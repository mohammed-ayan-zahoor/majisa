const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const backupLocal = async () => {
    try {
        console.log('Starting local database backup...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        const backupDir = path.join(__dirname, '../backups', `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`);

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`Backing up collection: ${collectionName}`);

            const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
            const filePath = path.join(backupDir, `${collectionName}.json`);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            console.log(`Saved ${data.length} documents to ${collectionName}.json`);
        }

        console.log(`\n✅ Backup complete! Stored in: ${backupDir}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
};

backupLocal();
