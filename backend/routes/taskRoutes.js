const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All task routes require authentication
router.use(protect);

// POST /api/tasks — Admin, Manager only
router.post('/', authorize('admin', 'manager'), createTask);

// GET  /api/tasks — All roles (scoped in controller)
router.get('/', getTasks);

// GET  /api/tasks/:id — All roles (scoped in controller)
router.get('/:id', getTaskById);

// PUT  /api/tasks/:id — All roles (employee: status only, admin/manager: all)
router.put('/:id', updateTask);

// PATCH /api/tasks/:id/status — convenience route (all roles, controller handles scoping)
router.patch('/:id/status', updateTask);

// DELETE /api/tasks/:id — Admin, Manager only
router.delete('/:id', authorize('admin', 'manager'), deleteTask);

module.exports = router;
