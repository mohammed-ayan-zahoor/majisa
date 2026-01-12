const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const emailQueue = new Queue('email-queue', {
    connection: redisConnection
});

const addEmailToQueue = async (emailData) => {
    // Validate input
    if (!emailData || typeof emailData !== 'object') {
        throw new Error('Invalid emailData: Must be a non-null object');
    }

    // Ensure required fields match what the worker expects
    const { email, subject, message } = emailData;
    if (!email || !subject || !message) {
        throw new Error('Missing required fields: email, subject, or message');
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }

    try {
        const job = await emailQueue.add('send-email', emailData, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true, // Keep Redis clean
            removeOnFail: false,    // Keep failed jobs for inspection
        });
        return job;
    } catch (error) {
        console.error('Failed to add email to queue:', error);
        throw error; // Rethrow so caller knows it failed
    }
};

module.exports = { emailQueue, addEmailToQueue };
