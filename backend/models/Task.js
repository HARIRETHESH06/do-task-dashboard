const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending',
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned user is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ─── INDEXES for fast filtering ───────────────────────────────────────────────
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });

// ─── TRANSFORM to match frontend Task type ────────────────────────────────────
taskSchema.methods.toPublicJSON = function () {
    const task = this.toObject();
    return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline instanceof Date
            ? task.deadline.toISOString()
            : task.deadline,
        assignedTo: task.assignedTo?._id
            ? task.assignedTo._id.toString()
            : task.assignedTo?.toString(),
        assignedToUser: task.assignedTo?.name
            ? {
                id: task.assignedTo._id.toString(),
                name: task.assignedTo.name,
                email: task.assignedTo.email,
                role: task.assignedTo.role,
                avatar: task.assignedTo.avatar,
                isActive: task.assignedTo.isActive,
                createdAt: task.assignedTo.createdAt?.toISOString?.() || '',
            }
            : undefined,
        createdBy: task.createdBy?._id
            ? task.createdBy._id.toString()
            : task.createdBy?.toString(),
        createdAt: task.createdAt instanceof Date
            ? task.createdAt.toISOString()
            : task.createdAt,
        updatedAt: task.updatedAt instanceof Date
            ? task.updatedAt.toISOString()
            : task.updatedAt,
    };
};

module.exports = mongoose.model('Task', taskSchema);
