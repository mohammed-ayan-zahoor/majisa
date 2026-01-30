const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token
            token = req.headers.authorization.split(' ')[1];

            // Verify token with strict options
            const decoded = jwt.verify(token, process.env.JWT_SECRET, {
                algorithms: ['HS256'], // Only allow HS256
                maxAge: process.env.JWT_EXPIRE || '7d', // Enforce max lifetime
            });

            // Additional validation: Check if user still exists
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                // User was deleted after token was issued
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Check if user is active (if you have status field)
            if (user.status === 'Inactive' || user.status === 'Rejected') {
                return res.status(401).json({ message: 'Account is inactive' });
            }

            req.user = user;
            next();

        } catch (error) {
            // Log detailed error server-side for debugging
            console.error('Authentication error:', {
                name: error.name,
                message: error.message,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });

            // Return generic error to client (don't leak info)
            return res.status(401).json({
                message: 'Unauthorized',
                // Only include error type in development
                ...(process.env.NODE_ENV === 'development' && { error: error.name })
            });
        }
    } else {
        // No token provided
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            message: 'Forbidden - Admin access required'
        });
    }
};

module.exports = { protect, admin };
