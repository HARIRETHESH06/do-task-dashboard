const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    toggleActive,
    updateRole,
    deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All user routes require authentication
router.use(protect);

// GET  /api/users — Admin & Manager (needed for task assignment dropdown)
router.get('/', authorize('admin', 'manager'), getUsers);

// GET  /api/users/:id — Admin & Manager
router.get('/:id', authorize('admin', 'manager'), getUserById);

// PUT  /api/users/:id — Admin only
router.put('/:id', authorize('admin'), updateUser);

// DELETE /api/users/:id — Admin only
router.delete('/:id', authorize('admin'), deleteUser);

// PATCH /api/users/:id/status  — toggle isActive — Admin only
router.patch('/:id/status', authorize('admin'), toggleActive);

// PATCH /api/users/:id/role — Admin only
router.patch('/:id/role', authorize('admin'), updateRole);

module.exports = router;
