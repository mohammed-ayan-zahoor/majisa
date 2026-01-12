const { Worker, UnrecoverableError } = require('bullmq');
const { redisConnection } = require('../config/redis');
const sendEmail = require('../utils/sendEmail');

const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`Processing email job ${job.id}`);
    // Validate required fields
    if (!job.data.email || !job.data.subject || !job.data.message) {
        await job.discard();
        throw new UnrecoverableError('Missing required fields: email, subject, or message');
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
    lockDuration: 30000, // 30s lock duration; if processing exceeds this, the job may be picked up by another worker (duplicates) attempt duplicate prevention via timeouts/idempotency if needed
});
emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

emailWorker.on('failed', (job, err) => {
    const jobId = job ? job.id : 'unknown';
    const errorDetails = err.stack || err.message || err;
    console.error(`Job ${jobId} failed. Error: ${errorDetails}`);
});

module.exports = emailWorker;
