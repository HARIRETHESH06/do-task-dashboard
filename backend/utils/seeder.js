/**
 * Database Seeder
 * Seeds the database with initial sample data matching the frontend mockData.
 *
 * Usage:
 *   node utils/seeder.js          — seed database
 *   node utils/seeder.js --clean  — clear all data
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const Task = require('../models/Task');
const Report = require('../models/Report');
const Activity = require('../models/Activity');

const seed = async () => {
    await connectDB();

    if (process.argv[2] === '--clean') {
        console.log('🧹 Clearing all data...');
        await Promise.all([
            User.deleteMany(),
            Task.deleteMany(),
            Report.deleteMany(),
            Activity.deleteMany(),
        ]);
        console.log('✅ Database cleared.');
        process.exit(0);
    }

    console.log('🌱 Seeding database...');

    // ── Clear existing data ──────────────────────────────────────────
    await Promise.all([
        User.deleteMany(),
        Task.deleteMany(),
        Report.deleteMany(),
        Activity.deleteMany(),
    ]);

    // ── Users ────────────────────────────────────────────────────────
    const users = await User.insertMany([
        {
            name: 'Alex Johnson',
            email: 'admin@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'admin',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
            isActive: true,
        },
        {
            name: 'Sarah Williams',
            email: 'manager@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'manager',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            isActive: true,
        },
        {
            name: 'Mike Chen',
            email: 'employee@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'employee',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            isActive: true,
        },
        {
            name: 'Emily Davis',
            email: 'emily@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'employee',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
            isActive: true,
        },
        {
            name: 'James Brown',
            email: 'james@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'employee',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
            isActive: false,
        },
    ]);

    const [admin, manager, mike, emily, james] = users;

    // ── Tasks ────────────────────────────────────────────────────────
    const tasks = await Task.insertMany([
        {
            title: 'Design new dashboard layout',
            description: 'Create wireframes and mockups for the new admin dashboard with improved UX.',
            priority: 'high',
            status: 'in-progress',
            deadline: new Date('2026-02-15'),
            assignedTo: mike._id,
            createdBy: manager._id,
        },
        {
            title: 'Implement user authentication',
            description: 'Set up JWT-based authentication with login, register, and password reset.',
            priority: 'urgent',
            status: 'completed',
            deadline: new Date('2026-02-10'),
            assignedTo: emily._id,
            createdBy: admin._id,
        },
        {
            title: 'Write API documentation',
            description: 'Document all REST API endpoints using Swagger/OpenAPI specification.',
            priority: 'medium',
            status: 'pending',
            deadline: new Date('2026-02-20'),
            assignedTo: mike._id,
            createdBy: manager._id,
        },
        {
            title: 'Fix mobile responsiveness issues',
            description: 'Address layout problems on mobile devices, especially navigation and tables.',
            priority: 'high',
            status: 'in-progress',
            deadline: new Date('2026-02-12'),
            assignedTo: emily._id,
            createdBy: manager._id,
        },
        {
            title: 'Set up CI/CD pipeline',
            description: 'Configure GitHub Actions for automated testing and deployment to staging.',
            priority: 'medium',
            status: 'pending',
            deadline: new Date('2026-02-25'),
            assignedTo: james._id,
            createdBy: admin._id,
        },
        {
            title: 'Database optimization',
            description: 'Review and optimize MongoDB queries, add proper indexes.',
            priority: 'low',
            status: 'pending',
            deadline: new Date('2026-03-01'),
            assignedTo: mike._id,
            createdBy: admin._id,
        },
        {
            title: 'User feedback survey',
            description: 'Create and distribute a user satisfaction survey.',
            priority: 'low',
            status: 'completed',
            deadline: new Date('2026-02-05'),
            assignedTo: emily._id,
            createdBy: manager._id,
        },
        {
            title: 'Security audit preparation',
            description: 'Prepare documentation and access logs for the upcoming security audit.',
            priority: 'urgent',
            status: 'in-progress',
            deadline: new Date('2026-02-11'),
            assignedTo: mike._id,
            createdBy: admin._id,
        },
        {
            title: 'Onboarding documentation',
            description: 'Create comprehensive onboarding guide for new team members.',
            priority: 'medium',
            status: 'pending',
            deadline: new Date('2026-02-28'),
            assignedTo: emily._id,
            createdBy: manager._id,
        },
        {
            title: 'Performance monitoring setup',
            description: 'Integrate APM tools for production environment.',
            priority: 'high',
            status: 'pending',
            deadline: new Date('2026-02-18'),
            assignedTo: mike._id,
            createdBy: admin._id,
        },
    ]);

    // ── Reports ──────────────────────────────────────────────────────
    await Report.insertMany([
        {
            type: 'daily',
            description: 'Completed the user authentication implementation. All test cases passing.',
            userId: emily._id,
            taskIds: [tasks[1]._id],
            attachments: [],
        },
        {
            type: 'weekly',
            description: 'This week focused on dashboard redesign. Created 5 wireframes and 3 mockups.',
            userId: mike._id,
            taskIds: [tasks[0]._id],
            attachments: [],
        },
        {
            type: 'daily',
            description: 'Fixed 3 critical mobile layout issues. Navigation menu now collapses properly.',
            userId: emily._id,
            taskIds: [tasks[3]._id],
            attachments: [],
        },
        {
            type: 'daily',
            description: 'Started security audit preparation. Gathered access logs for past 30 days.',
            userId: mike._id,
            taskIds: [tasks[7]._id],
            attachments: [],
        },
        {
            type: 'weekly',
            description: 'Survey completed with 87% response rate. Key findings attached.',
            userId: emily._id,
            taskIds: [tasks[6]._id],
            attachments: [],
        },
    ]);

    // ── Activities ───────────────────────────────────────────────────
    await Activity.insertMany([
        { action: 'task_completed', description: 'Completed task "Implement user authentication"', userId: emily._id },
        { action: 'report_submitted', description: 'Submitted daily report', userId: mike._id },
        { action: 'task_updated', description: 'Updated status of "Security audit preparation" to In Progress', userId: mike._id },
        { action: 'task_created', description: 'Created new task "Performance monitoring setup"', userId: admin._id },
        { action: 'user_login', description: 'Logged into the system', userId: manager._id },
        { action: 'report_submitted', description: 'Submitted weekly report', userId: emily._id },
        { action: 'task_assigned', description: 'Assigned "Onboarding documentation" to Emily Davis', userId: manager._id },
        { action: 'task_completed', description: 'Completed task "User feedback survey"', userId: emily._id },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('  Admin:    admin@example.com    / password123');
    console.log('  Manager:  manager@example.com  / password123');
    console.log('  Employee: employee@example.com / password123');
    process.exit(0);
};

seed().catch((err) => {
    console.error('❌ Seeder error:', err);
    process.exit(1);
});
