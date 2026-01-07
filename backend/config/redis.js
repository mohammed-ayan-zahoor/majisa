const Redis = require('ioredis');

const redisConnection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
};

const connection = new Redis(redisConnection);

module.exports = { connection, redisConnection };
