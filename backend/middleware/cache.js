const apicache = require('apicache');

/**
 * PRODUCTION CACHING STRATEGY
 * We cache for 5 minutes, but only for successful (200) requests.
 */
const cache = apicache.middleware;

// Middleware to cache successful responses
const cacheSuccess = cache('5 minutes', (req, res) => res.statusCode === 200);

// Middleware to clear the entire cache when data is modified
const clearCache = (req, res, next) => {
    apicache.clear(); // Clears all cached routes
    console.log('Backend Cache Cleared');
    next();
};

module.exports = {
    cacheSuccess,
    clearCache
};
