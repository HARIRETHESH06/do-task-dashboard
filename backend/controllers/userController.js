const User = require('../models/User');
const logActivity = require('../utils/activityLogger');

// ─── @desc   Get all users
// ─── @route  GET /api/users
// ─── @access Admin only
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: users.map((u) => u.toPublicJSON()),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get a single user by ID
// ─── @route  GET /api/users/:id
// ─── @access Admin only
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Update a user (name, email, role, isActive, avatar)
// ─── @route  PUT /api/users/:id
// ─── @access Admin only
const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, isActive, avatar } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (role !== undefined) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;
        if (avatar !== undefined) user.avatar = avatar;

        await user.save();

        await logActivity(
            'user_updated',
            `Admin updated user ${user.name}`,
            req.user._id
        );

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Toggle user isActive status
// ─── @route  PATCH /api/users/:id/status
// ─── @access Admin only
const toggleActive = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent admin from deactivating themselves
        if (user._id.equals(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account',
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        await logActivity(
            'user_status_changed',
            `User ${user.name} was ${user.isActive ? 'activated' : 'deactivated'}`,
            req.user._id
        );

        res.json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Update user role
// ─── @route  PATCH /api/users/:id/role
// ─── @access Admin only
const updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['admin', 'manager', 'employee'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await logActivity(
            'user_role_changed',
            `User ${user.name} role changed to ${role}`,
            req.user._id
        );

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: user.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Delete a user
// ─── @route  DELETE /api/users/:id
// ─── @access Admin only
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-deletion
        if (user._id.equals(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account',
            });
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully',
            data: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getUsers, getUserById, updateUser, toggleActive, updateRole, deleteUser };
