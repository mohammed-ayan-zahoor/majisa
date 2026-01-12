const { Worker } = require('bullmq');
const { redisConnection } = require('../config/redis');
const sendEmail = require('../utils/sendEmail');

const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`Processing email job ${job.id}`);
    // Validate required fields
    if (!job.data.email || !job.data.subject || !job.data.message) {
        throw new Error('Missing required fields: email, subject, or message');
    }

    try {
        await sendEmail({
            email: job.data.email,
            subject: job.data.subject,
            message: job.data.message,
        });
        console.log(`Email sent successfully for job ${job.id}`);
    } catch (error) {
        console.error(`Failed to send email for job ${job.id}:`, error);
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 emails in parallel per instance
    lockDuration: 30000, // 30 seconds - job fails if not completed in time
});
emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
});

module.exports = emailWorker;
