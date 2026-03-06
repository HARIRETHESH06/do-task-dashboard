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

// All user routes require auth + admin role
router.use(protect, authorize('admin'));

// GET  /api/users
// POST would be via /api/auth/register
router.get('/', getUsers);

// GET  /api/users/:id
router.get('/:id', getUserById);

// PUT  /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

// PATCH /api/users/:id/status  — toggle isActive
router.patch('/:id/status', toggleActive);

// PATCH /api/users/:id/role
router.patch('/:id/role', updateRole);

module.exports = router;
