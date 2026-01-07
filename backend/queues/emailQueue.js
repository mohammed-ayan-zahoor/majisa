const { Queue } = require('bullmq');
const { redisConnection } = require('../config/redis');

const emailQueue = new Queue('email-queue', {
    connection: redisConnection
});

const addEmailToQueue = async (emailData) => {
    await emailQueue.add('send-email', emailData, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    });
};

module.exports = { emailQueue, addEmailToQueue };
