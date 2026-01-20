const Redis = require('ioredis');

const redisConnection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => {
        // Stop retrying after 3 attempts if Redis is down
        if (times > 3) {
            console.warn('Redis connection failed too many times. Disabling Redis features.');
            return null;
        }
        return Math.min(times * 50, 2000);
    }
};

// Create a client instance (Uncomment if needed for general caching, but BullMQ creates its own)
// const connection = new Redis(redisConnection);

// connection.on('connect', () => {
//     console.log('Redis client connecting...');
// });

// connection.on('ready', () => {
//     console.log('Redis client ready');
// });

// connection.on('error', (err) => {
//     // console.error('Redis connection error:', err);
// });

// connection.on('close', () => {
//     // console.log('Redis connection closed');
// });

module.exports = { /* connection, */ redisConnection };
