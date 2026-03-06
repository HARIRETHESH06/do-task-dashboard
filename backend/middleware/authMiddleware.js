const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authMiddleware
 * Verifies the Bearer JWT token from the Authorization header.
 * On success, attaches the full user document to req.user.
 */
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — no token provided',
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request (exclude password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — user not found',
            });
        }

        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact admin.',
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized — invalid or expired token',
        });
    }
};

module.exports = { protect };
