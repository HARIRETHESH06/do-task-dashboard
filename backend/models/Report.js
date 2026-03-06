const mongoose = require('mongoose');

// Sub-schema for file attachments
const attachmentSchema = new mongoose.Schema(
    {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true }, // bytes
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const reportSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['daily', 'weekly'],
            required: [true, 'Report type is required'],
        },
        description: {
            type: String,
            required: [true, 'Report description is required'],
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        taskIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Task',
            },
        ],
        attachments: [attachmentSchema],
    },
    {
        timestamps: true,
    }
);

// ─── INDEX ────────────────────────────────────────────────────────────────────
reportSchema.index({ userId: 1 });
reportSchema.index({ type: 1 });
reportSchema.index({ createdAt: -1 });

// ─── TRANSFORM to match frontend Report type ──────────────────────────────────
reportSchema.methods.toPublicJSON = function () {
    const report = this.toObject();
    return {
        id: report._id.toString(),
        type: report.type,
        description: report.description,
        userId: report.userId?._id
            ? report.userId._id.toString()
            : report.userId?.toString(),
        user: report.userId?.name
            ? {
                id: report.userId._id.toString(),
                name: report.userId.name,
                email: report.userId.email,
                role: report.userId.role,
                avatar: report.userId.avatar,
                isActive: report.userId.isActive,
                createdAt: report.userId.createdAt?.toISOString?.() || '',
            }
            : undefined,
        taskIds: (report.taskIds || []).map((t) =>
            t?._id ? t._id.toString() : t?.toString()
        ),
        attachments: (report.attachments || []).map((a) => ({
            id: a._id.toString(),
            fileName: a.fileName,
            fileUrl: a.fileUrl,
            fileSize: a.fileSize,
            uploadedAt: a.uploadedAt instanceof Date
                ? a.uploadedAt.toISOString()
                : a.uploadedAt,
        })),
        createdAt: report.createdAt instanceof Date
            ? report.createdAt.toISOString()
            : report.createdAt,
    };
};

module.exports = mongoose.model('Report', reportSchema);
