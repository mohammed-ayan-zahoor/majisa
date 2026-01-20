const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');
const isRedisAvailable = require('../utils/isRedisAvailable');

let emailQueue = null;

const getEmailQueue = async () => {
    if (emailQueue) return emailQueue;

    const available = await isRedisAvailable();
    if (available) {
        try {
            emailQueue = new Queue('email-queue', { connection: redisConnection });
            emailQueue.on('error', (err) => console.error('Email Queue Error:', err.message));
        } catch (e) {
            console.warn('Failed to create BullMQ queue, using mock.');
        }
    }

    if (!emailQueue) {
        // Mock Queue
        emailQueue = {
            add: async (name, data) => {
                console.log('[Mock Queue] Email task received:', data.email);
                return { id: 'mock-job-' + Date.now() };
            },
            on: () => { },
            close: async () => { }
        };
    }
    return emailQueue;
};

// Export null initially, consumers should use addEmailToQueue wrapper
// But if they access emailQueue directly, they might get null. 
// We'll proxy it if needed, but for now let's ensure addEmailToQueue handles it.

const addEmailToQueue = async (emailData) => {
    const queue = await getEmailQueue();
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
        const job = await queue.add('send-email', emailData, {
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
