const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────

// CORS — allow Vite dev server and deployed frontend
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow all requests for now to prevent CORS issues
            callback(null, true);
        },
        credentials: true,
    })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── ROUTES ───────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Hello world route for testing deployment
app.get('/api/hello', (req, res) => {
    res.json({
        success: true,
        message: 'Hello World from Vercel Serverless!'
    });
});

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

// Only listen locally or on non-Vercel environments (like Render).
// Vercel serverless functions handle the routing internally via module.exports.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(
            `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
        );
    });
}

// Export the app for Vercel
module.exports = app;
