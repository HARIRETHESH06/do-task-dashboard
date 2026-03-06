const path = require('path');
const Report = require('../models/Report');
const logActivity = require('../utils/activityLogger');

// ─── @desc   Create a report (with optional PDF attachments)
// ─── @route  POST /api/reports
// ─── @access Employee only
const createReport = async (req, res, next) => {
    try {
        const { type, description, taskIds } = req.body;

        if (!type || !description) {
            return res.status(400).json({
                success: false,
                message: 'Report type and description are required',
            });
        }

        // Build attachments from uploaded files (multer)
        const attachments = (req.files || []).map((file) => ({
            fileName: file.originalname,
            fileUrl: `/uploads/${file.filename}`,
            fileSize: file.size,
            uploadedAt: new Date(),
        }));

        // Parse taskIds from JSON string (form-data sets it as string)
        let parsedTaskIds = [];
        if (taskIds) {
            try {
                parsedTaskIds = typeof taskIds === 'string' ? JSON.parse(taskIds) : taskIds;
            } catch {
                parsedTaskIds = Array.isArray(taskIds) ? taskIds : [taskIds];
            }
        }

        const report = await Report.create({
            type,
            description,
            userId: req.user._id,
            taskIds: parsedTaskIds,
            attachments,
        });

        await report.populate('userId', 'name email role avatar isActive createdAt');

        await logActivity(
            'report_submitted',
            `Submitted ${type} report`,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully',
            data: report.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get all reports
// ─── @route  GET /api/reports?type=&userId=
// ─── @access Admin/Manager: all | Employee: own only
const getReports = async (req, res, next) => {
    try {
        const { type, userId } = req.query;

        let query = {};

        // Employees see only their own reports
        if (req.user.role === 'employee') {
            query.userId = req.user._id;
        } else if (userId && userId !== 'all') {
            query.userId = userId;
        }

        if (type && type !== 'all') query.type = type;

        const reports = await Report.find(query)
            .populate('userId', 'name email role avatar isActive createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reports.map((r) => r.toPublicJSON()),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get a single report by ID
// ─── @route  GET /api/reports/:id
// ─── @access All roles (scoped)
const getReportById = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id).populate(
            'userId',
            'name email role avatar isActive createdAt'
        );

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        // Employees can only view their own reports
        if (
            req.user.role === 'employee' &&
            !report.userId._id.equals(req.user._id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — this report does not belong to you',
            });
        }

        res.json({ success: true, data: report.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

module.exports = { createReport, getReports, getReportById };
