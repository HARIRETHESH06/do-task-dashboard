const express = require('express');
const router = express.Router();
const { createReport, getReports, getReportById } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

// All report routes require authentication
router.use(protect);

// POST /api/reports — Employee only, with PDF file upload (up to 5 files)
router.post(
    '/',
    authorize('employee'),
    upload.array('attachments', 5),
    createReport
);

// GET  /api/reports — All roles (scoped in controller)
router.get('/', getReports);

// GET  /api/reports/:id — All roles (scoped in controller)
router.get('/:id', getReportById);

module.exports = router;
