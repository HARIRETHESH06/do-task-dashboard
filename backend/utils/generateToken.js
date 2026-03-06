const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token.
 * Payload: { id, role }
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = generateToken;
