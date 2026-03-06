const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
    {
        action: {
            type: String,
            required: true,
            // e.g. 'task_created', 'task_updated', 'task_completed',
            //       'report_submitted', 'user_login', 'user_registered', 'task_assigned'
        },
        description: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // createdAt = timestamp of activity
    }
);

activitySchema.index({ userId: 1 });
activitySchema.index({ createdAt: -1 });

// Transform to match frontend Activity type
activitySchema.methods.toPublicJSON = function () {
    const activity = this.toObject();
    return {
        id: activity._id.toString(),
        action: activity.action,
        description: activity.description,
        userId: activity.userId?._id
            ? activity.userId._id.toString()
            : activity.userId?.toString(),
        user: activity.userId?.name
            ? {
                id: activity.userId._id.toString(),
                name: activity.userId.name,
                email: activity.userId.email,
                role: activity.userId.role,
                avatar: activity.userId.avatar,
                isActive: activity.userId.isActive,
                createdAt: activity.userId.createdAt?.toISOString?.() || '',
            }
            : undefined,
        timestamp: activity.createdAt instanceof Date
            ? activity.createdAt.toISOString()
            : activity.createdAt,
    };
};

module.exports = mongoose.model('Activity', activitySchema);
