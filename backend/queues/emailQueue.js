const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');
const isRedisAvailable = require('../utils/isRedisAvailable');

let emailQueue = null;
let emailQueueInitPromise = null;

const getEmailQueue = async () => {
    // 1. Fast path: if initialized, return immediately
    if (emailQueue) return emailQueue;

    // 2. If initialization already in progress, wait for it
    if (emailQueueInitPromise) {
        await emailQueueInitPromise;
        if (emailQueue) return emailQueue;
    }

    // 3. Start initialization
    emailQueueInitPromise = (async () => {
        const available = await isRedisAvailable();
        if (available) {
            try {
                const queue = new Queue('email-queue', { connection: redisConnection });
                queue.on('error', (err) => console.error('Email Queue Error:', err.message));
                emailQueue = queue;
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
    })();

    try {
        await emailQueueInitPromise;
    } catch (err) {
        console.error("Email Queue Initialization Failed", err);
        // Fallback or rethrow? Logic says we always ensure emailQueue is at least Mock, 
        // but if async block throws unexpectedly, we should clear promise.
    } finally {
        // Clear promise so future retries (if we eventually support re-init) logic is clean,
        // though here emailQueue is largely static.
        emailQueueInitPromise = null;
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
