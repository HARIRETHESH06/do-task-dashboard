const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const logActivity = require('../utils/activityLogger');

// ─── @desc   Register a new user
// ─── @route  POST /api/auth/register
// ─── @access Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password',
            });
        }

        // Check duplicate email
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered',
            });
        }

        const user = await User.create({ name, email, password, role: role || 'employee' });

        const token = generateToken(user);
        await logActivity('user_registered', `${user.name} registered as ${user.role}`, user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                ...user.toPublicJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Login user
// ─── @route  POST /api/auth/login
// ─── @access Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Include password for comparison
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is deactivated. Please contact admin.',
            });
        }

        const token = generateToken(user);
        await logActivity('user_login', `${user.name} logged in`, user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                ...user.toPublicJSON(),
                token,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get current logged-in user
// ─── @route  GET /api/auth/me
// ─── @access Private
const getMe = async (req, res) => {
    res.json({
        success: true,
        data: req.user.toPublicJSON(),
    });
};

module.exports = { register, login, getMe };
