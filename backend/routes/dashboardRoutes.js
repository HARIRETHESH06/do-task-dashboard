const express = require('express');
const router = express.Router();
const { getStats, getActivities } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', getStats);

// GET /api/dashboard/activities?limit=10
router.get('/activities', getActivities);

module.exports = router;
