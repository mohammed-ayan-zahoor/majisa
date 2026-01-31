const { Worker, UnrecoverableError } = require('bullmq');
const { redisConnection } = require('../config/redis');
const Order = require('../models/Order');

let orderCleanupWorker;

try {
    orderCleanupWorker = new Worker('order-cleanup-queue', async (job) => {
        console.log(`Processing order cleanup job ${job.id}`);

        const { orderId } = job.data;

        if (!orderId) {
            await job.discard();
            throw new UnrecoverableError('Missing required field: orderId');
        }

        try {
            const order = await Order.findById(orderId);

            if (!order) {
                console.log(`Order ${orderId} not found, maybe already deleted.`);
                return;
            }

            // Double Check: Only delete if status is still 'Completed'
            // This prevents deleting an order if the admin changed it back to 'In Process' or something else
            if (order.status === 'Completed') {
                await order.deleteOne();
                console.log(`Order ${orderId} successfully deleted (Auto-Cleanup).`);
            } else {
                console.log(`Order ${orderId} status is '${order.status}', skipping deletion.`);
            }

        } catch (error) {
            console.error(`Failed to process cleanup for order ${orderId}:`, error);
            throw error; // Let BullMQ handle retries
        }
    }, {
        connection: redisConnection,
        concurrency: 5,
        lockDuration: 30000,
    });

    orderCleanupWorker.on('completed', (job) => {
        console.log(`Cleanup Job ${job.id} completed!`);
    });

    orderCleanupWorker.on('failed', (job, err) => {
        const jobId = job ? job.id : 'unknown';
        const errorDetails = err.stack || err.message || err;
        console.error(`Cleanup Job ${jobId} failed. Error: ${errorDetails}`);
    });

} catch (err) {
    console.error('Failed to initialize Order Cleanup Worker:', err);
    throw err;
}

module.exports = orderCleanupWorker;
