const Redis = require('ioredis');

const redisConnection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
};

const connection = new Redis(redisConnection);

connection.on('connect', () => {
    console.log('Redis client connecting...');
});

connection.on('ready', () => {
    console.log('Redis client ready');
});

connection.on('error', (err) => {
    console.error('Redis connection error:', err);
});

connection.on('close', () => {
    console.log('Redis connection closed');
});
module.exports = { connection, redisConnection };
