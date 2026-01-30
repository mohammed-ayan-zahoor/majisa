const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Define absolute log directory path (used by both transports and directory creation)
// This ensures logs are always written to backend/logs regardless of where the node process is started
const LOG_DIR = path.resolve(path.join(__dirname, '../logs'));

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }

        // Add stack trace if present
        if (stack) {
            log += `\n${stack}`;
        }

        return log;
    })
);

// Daily rotate file transport for all logs
const dailyRotateFileTransport = new DailyRotateFile({
    filename: path.join(LOG_DIR, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m', // Rotate if file exceeds 20MB
    maxFiles: '14d', // Keep logs for 14 days
    format: logFormat,
});

// Daily rotate file transport for errors only
const errorRotateFileTransport = new DailyRotateFile({
    filename: path.join(LOG_DIR, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs longer
    format: logFormat,
});

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        dailyRotateFileTransport,
        errorRotateFileTransport,
    ],
    // Don't exit on exceptions
    exitOnError: false,
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, stack }) => {
                let log = `${timestamp} ${level}: ${message}`;
                if (stack) {
                    log += `\n${stack}`;
                }
                return log;
            })
        )
    }));
}

// Stream object for Morgan (HTTP request logging)
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;
