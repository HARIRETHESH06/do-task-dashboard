/**
 * 404 Not Found handler
 * Called when no route matches the request.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Route not found — ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

/**
 * Global error handler
 * Returns a consistent JSON error response: { success: false, message }
 */
const errorHandler = (err, req, res, next) => {
    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum allowed size is 10 MB.',
        });
    }

    if (err.message === 'Only PDF files are allowed') {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type. Only PDF files are accepted.',
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', '),
        });
    }

    // Mongoose duplicate key error (e.g. unique email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
        });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ID format: ${err.value}`,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Default
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = { notFound, errorHandler };
