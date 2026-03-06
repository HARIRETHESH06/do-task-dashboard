/**
 * roleMiddleware
 * Factory that returns middleware checking if req.user.role is in allowedRoles.
 *
 * Usage:
 *   router.get('/admin-only', protect, authorize('admin'), handler);
 *   router.post('/tasks', protect, authorize('admin', 'manager'), handler);
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized — please login first',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied — role '${req.user.role}' is not permitted to perform this action`,
            });
        }

        next();
    };
};

module.exports = { authorize };
