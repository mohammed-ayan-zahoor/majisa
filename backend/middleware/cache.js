const apicache = require('apicache');

/**
 * PRODUCTION CACHING STRATEGY
 * We cache for 5 minutes, but only for successful (200) requests.
 */
const cache = apicache.middleware;

// Middleware to cache successful responses
// CRITICAL: We DO NOT cache requests with an Authorization header.
// This ensures Admins and Vendors always see fresh data after updates.
const cacheSuccess = cache('5 minutes', (req, res) => {
    const isAuth = !!req.headers.authorization;
    return res.statusCode === 200 && !isAuth;
});

// Middleware to clear the entire cache when data is modified
const clearCache = (req, res, next) => {
    // We clear it immediately to be safe
    apicache.clear();

    // And we also clear it after the response finishes to catch any race conditions
    res.on('finish', () => {
        apicache.clear();
        console.log(`Backend Cache Cleared for ${req.method} ${req.originalUrl}`);
    });

    next();
};

module.exports = {
    cacheSuccess,
    clearCache
};
