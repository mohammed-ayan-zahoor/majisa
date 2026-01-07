const User = require('../models/User');

const migrateUsernames = async () => {
    try {
        const users = await User.find({ username: { $exists: false } });

        if (users.length === 0) return;

        console.log(`[Migration] Found ${users.length} users without usernames. Starting auto-migration...`);

        for (const user of users) {
            let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let username = baseUsername;
            let counter = 1;

            // Ensure uniqueness
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user.username = username;
            await user.save();
            console.log(`[Migration] Migrated: ${user.email} -> ${username}`);
        }

        console.log('[Migration] Username auto-migration complete.');
    } catch (error) {
        console.error('[Migration] Username migration failed:', error);
    }
};

module.exports = { migrateUsernames };
