const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');
const isRedisAvailable = require('../utils/isRedisAvailable');

let orderCleanupQueue = null;
let orderCleanupQueueInitPromise = null;

const getOrderCleanupQueue = async () => {
    // 1. Fast path: if initialized, return immediately
    if (orderCleanupQueue) return orderCleanupQueue;

    // 2. If initialization already in progress, wait for it
    if (orderCleanupQueueInitPromise) {
        try {
            await orderCleanupQueueInitPromise;
        } catch {
            // Initialization failed; fall through to retry or use fallback below
        }
        if (orderCleanupQueue) return orderCleanupQueue;
    }
    // 3. Start initialization
    orderCleanupQueueInitPromise = (async () => {
        const available = await isRedisAvailable();
        if (available) {
            try {
                const queue = new Queue('order-cleanup-queue', { connection: redisConnection });
                queue.on('error', (err) => console.error('Order Cleanup Queue Error:', err.message));
                orderCleanupQueue = queue;
            } catch (e) {
                console.warn('Failed to create BullMQ queue for Order Cleanup, using mock.');
            }
        }

        if (!orderCleanupQueue) {
            // Mock Queue
            orderCleanupQueue = {
                add: async (name, data) => {
                    console.log('[Mock Queue] Order cleanup task received:', data.orderId);
                    return { id: 'mock-job-' + Date.now() };
                },
                on: () => { },
                close: async () => { }
            };
        }
    })();

    try {
        await orderCleanupQueueInitPromise;
    } catch (err) {
        console.error("Order Cleanup Queue Initialization Failed", err);
        // Ensure queue is not null even if init throws
        if (!orderCleanupQueue) {
            orderCleanupQueue = {
                add: async (name, data) => {
                    console.log('[Mock Queue] Order cleanup task received:', data.orderId);
                    return { id: 'mock-job-' + Date.now() };
                },
                on: () => { },
                close: async () => { }
            };
        }
    } finally {
        orderCleanupQueueInitPromise = null;
    }

    return orderCleanupQueue;
};

const addOrderToCleanupQueue = async (orderData, delay) => {
    const queue = await getOrderCleanupQueue();
    // Validate input
    if (!orderData || !orderData.orderId) {
        throw new Error('Invalid orderData: Must contain orderId');
    }

    try {
        const job = await queue.add('delete-order', orderData, {
            delay: delay || 0, // Delay in milliseconds
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        });
        return job;
    } catch (error) {
        console.error('Failed to add order to cleanup queue:', error);
        throw error;
    }
};

module.exports = { getOrderCleanupQueue, addOrderToCleanupQueue };
