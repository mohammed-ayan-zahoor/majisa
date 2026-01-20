const net = require('net');

const isRedisAvailable = () => {
    return new Promise((resolve) => {
        const socket = new net.Socket();

        const onError = () => {
            socket.destroy();
            resolve(false);
        };

        socket.setTimeout(500); // Fast timeout
        socket.once('error', onError);
        socket.once('timeout', onError);

        socket.connect(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || '127.0.0.1', () => {
            socket.end();
            resolve(true);
        });
    });
};

module.exports = isRedisAvailable;
