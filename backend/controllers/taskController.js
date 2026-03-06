const Task = require('../models/Task');
const logActivity = require('../utils/activityLogger');

// ─── @desc   Create a new task
// ─── @route  POST /api/tasks
// ─── @access Admin, Manager
const createTask = async (req, res, next) => {
    try {
        const { title, description, priority, status, deadline, assignedTo } = req.body;

        if (!title || !description || !deadline || !assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, deadline, and assignedTo are required',
            });
        }

        const task = await Task.create({
            title,
            description,
            priority: priority || 'medium',
            status: status || 'pending',
            deadline,
            assignedTo,
            createdBy: req.user._id,
        });

        // Populate for response
        await task.populate([
            { path: 'assignedTo', select: 'name email role avatar isActive createdAt' },
            { path: 'createdBy', select: 'name email role avatar isActive createdAt' },
        ]);

        await logActivity(
            'task_created',
            `Created new task "${task.title}"`,
            req.user._id
        );

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get all tasks (with optional filters)
// ─── @route  GET /api/tasks?status=&priority=&assignedTo=&search=
// ─── @access All roles (employees see only their assigned tasks)
const getTasks = async (req, res, next) => {
    try {
        const { status, priority, assignedTo, search } = req.query;

        let query = {};

        // Employees can only see tasks assigned to them
        if (req.user.role === 'employee') {
            query.assignedTo = req.user._id;
        } else if (assignedTo && assignedTo !== 'all') {
            query.assignedTo = assignedTo;
        }

        if (status && status !== 'all') query.status = status;
        if (priority && priority !== 'all') query.priority = priority;

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email role avatar isActive createdAt')
            .populate('createdBy', 'name email role avatar isActive createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: tasks.map((t) => t.toPublicJSON()),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Get a single task by ID
// ─── @route  GET /api/tasks/:id
// ─── @access All roles (employees: only own tasks)
const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email role avatar isActive createdAt')
            .populate('createdBy', 'name email role avatar isActive createdAt');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Employees can only view their own tasks
        if (
            req.user.role === 'employee' &&
            !task.assignedTo._id.equals(req.user._id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied — this task is not assigned to you',
            });
        }

        res.json({ success: true, data: task.toPublicJSON() });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Update a task
// ─── @route  PUT /api/tasks/:id
// ─── @access Admin/Manager: all fields | Employee: status only
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Employees: can only update status of tasks assigned to them
        if (req.user.role === 'employee') {
            if (!task.assignedTo.equals(req.user._id)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied — this task is not assigned to you',
                });
            }
            if (req.body.status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Employees can only update task status',
                });
            }
            task.status = req.body.status;
        } else {
            // Admin / Manager: update any field
            const { title, description, priority, status, deadline, assignedTo } = req.body;
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (priority !== undefined) task.priority = priority;
            if (status !== undefined) task.status = status;
            if (deadline !== undefined) task.deadline = deadline;
            if (assignedTo !== undefined) task.assignedTo = assignedTo;
        }

        await task.save();

        await task.populate([
            { path: 'assignedTo', select: 'name email role avatar isActive createdAt' },
            { path: 'createdBy', select: 'name email role avatar isActive createdAt' },
        ]);

        const action = req.body.status ? 'task_updated' : 'task_updated';
        const isCompleted = req.body.status === 'completed';
        await logActivity(
            isCompleted ? 'task_completed' : 'task_updated',
            isCompleted
                ? `Completed task "${task.title}"`
                : `Updated task "${task.title}"`,
            req.user._id
        );

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task.toPublicJSON(),
        });
    } catch (error) {
        next(error);
    }
};

// ─── @desc   Delete a task
// ─── @route  DELETE /api/tasks/:id
// ─── @access Admin, Manager
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.deleteOne();

        res.json({
            success: true,
            message: 'Task deleted successfully',
            data: true,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
