const Task = require('../models/Task');
const Report = require('../models/Report');
const User = require('../models/User');
const Activity = require('../models/Activity');

// ─── @desc   Get dashboard stats
// ─── @route  GET /api/dashboard/stats
// ─── @access All roles
const getStats = async (req, res, next) => {
    try {
        let taskQuery = {};
        let reportQuery = {};

        // Employees get stats only for their own data
        if (req.user.role === 'employee') {
            taskQuery.assignedTo = req.user._id;
            reportQuery.userId = req.user._id;
        }

        const [
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            totalReports,
            totalUsers,
        ] = await Promise.all([
            Task.countDocuments(taskQuery),
            Task.countDocuments({ ...taskQuery, status: 'completed' }),
            Task.countDocuments({ ...taskQuery, status: 'pending' }),
            Task.countDocuments({ ...taskQuery, status: 'in-progress' }),
            Report.countDocuments(reportQuery),
            req.user.role === 'admin' ? User.countDocuments() : undefined,
        ]);

        const stats = {
            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            totalReports,
        };

        if (req.user.role === 'admin') {
            stats.totalUsers = totalUsers;
        }

        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get recent activity feed
// ─── @route  GET /api/dashboard/activities?limit=10
// ─── @access All roles
const getActivities = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        let query = {};
        // Employees see only their own activity
        if (req.user.role === 'employee') {
            query.userId = req.user._id;
        }

        const activities = await Activity.find(query)
            .populate('userId', 'name email role avatar isActive createdAt')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: activities.map((a) => a.toPublicJSON()),
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getStats, getActivities };
