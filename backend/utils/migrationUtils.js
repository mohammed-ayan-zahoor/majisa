const User = require('../models/User');

const migrateUsernames = async () => {
    try {
        const users = await User.find({ username: { $exists: false } });

        if (users.length === 0) return;

        console.log(`[Migration] Found ${users.length} users without usernames. Starting atomic auto-migration...`);

        for (const user of users) {
            if (!user.email || typeof user.email !== 'string') {
                console.warn(`[Migration] Skipping user ${user._id}: missing or invalid email`);
                continue;
            }

            let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!baseUsername) baseUsername = 'user';

            let candidate = baseUsername;
            let counter = 1;
            let success = false;
            let attempts = 0;
            const MAX_ATTEMPTS = 15;

            while (!success && attempts < MAX_ATTEMPTS) {
                try {
                    // Atomic update strategy: Attempt to set the username directly
                    // This relies on the unique index in MongoDB to throw an E11000 error on conflict
                    user.username = candidate;
                    await user.save();
                    console.log(`[Migration] Success: ${user.email} -> ${candidate}`);
                    success = true;
                } catch (error) {
                    // Check for duplicate key error (E11000)
                    if (error.code === 11000 || (error.name === 'MongoServerError' && error.message.includes('E11000'))) {
                        // Conflict detected! Generate a new candidate and retry
                        candidate = `${baseUsername}${counter}`;
                        counter++;
                        attempts++;
                    } else {
                        // Some other error occurred, stop processing this user
                        console.error(`[Migration] Error migrating user ${user._id}:`, error.message);
                        break;
                    }
                }
            }

            if (!success && attempts >= MAX_ATTEMPTS) {
                console.error(`[Migration] Failed: Max attempts (${MAX_ATTEMPTS}) reached for user ${user._id}`);
            }
        }

        console.log('[Migration] Username auto-migration complete.');
    } catch (error) {
        console.error('[Migration] Username migration failed:', error);
    }
};

module.exports = { migrateUsernames };
