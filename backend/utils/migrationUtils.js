const User = require('../models/User');

const migrateUsernames = async () => {
    try {
        // 1. Auto-generate missing usernames
        const missingUsernames = await User.find({ username: { $exists: false } });
        if (missingUsernames.length > 0) {
            console.log(`[Migration] Found ${missingUsernames.length} users without usernames. Starting auto-generation...`);
            for (const user of missingUsernames) {
                if (!user.email) continue;
                let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
                if (!baseUsername) baseUsername = 'user';

                await saveWithRetry(user, baseUsername);
            }
        }

        // 2. Normalize existing uppercase usernames to lowercase
        // MongoDB treats 'UserA' and 'usera' as different if the index isn't case-insensitive (which it isn't by default)
        // Since we added lowercase: true to the model, we should normalize everything in DB.
        const usersToNormalize = await User.find({
            username: { $exists: true, $ne: null },
            $expr: { $ne: [{ $toLower: "$username" }, "$username"] }
        });

        if (usersToNormalize.length > 0) {
            console.log(`[Migration] Found ${usersToNormalize.length} users with non-lowercase usernames. Normalizing...`);
            for (const user of usersToNormalize) {
                const targetUsername = user.username.toLowerCase();
                await saveWithRetry(user, targetUsername);
            }
        }

        console.log('[Migration] Username migration and normalization complete.');
    } catch (error) {
        console.error('[Migration] Username migration failed:', error);
    }
};

/**
 * Attempts to save a user with a desired username, appending a numeric suffix if a collision occurs.
 */
async function saveWithRetry(user, desiredUsername) {
    let candidate = desiredUsername;
    let counter = 1;
    let success = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 20;

    while (!success && attempts < MAX_ATTEMPTS) {
        try {
            user.username = candidate;
            // Use validateBeforeSave: false if we only want to update username without triggering other validations if they might fail
            await user.save();
            console.log(`[Migration] Updated ${user.email}: username -> ${candidate}`);
            success = true;
        } catch (error) {
            if (error.code === 11000 || (error.name === 'MongoServerError' && error.message.includes('E11000'))) {
                candidate = `${desiredUsername}${counter}`;
                counter++;
                attempts++;
            } else {
                console.error(`[Migration] Error saving user ${user._id}:`, error.message);
                break;
            }
        }
    }

    if (!success && attempts >= MAX_ATTEMPTS) {
        console.error(`[Migration] Failed to save username for user ${user._id} after ${MAX_ATTEMPTS} attempts`);
    }
}

module.exports = { migrateUsernames };
