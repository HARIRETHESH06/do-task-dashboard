const Activity = require('../models/Activity');

/**
 * Fire-and-forget activity logger.
 * Does NOT throw — errors are silently logged to keep request flow unaffected.
 *
 * @param {string} action - e.g. 'task_created', 'report_submitted'
 * @param {string} description - Human-readable description
 * @param {ObjectId|string} userId - The user who performed the action
 */
const logActivity = async (action, description, userId) => {
    try {
        await Activity.create({ action, description, userId });
    } catch (err) {
        console.error(`[ActivityLogger] Failed to log activity: ${err.message}`);
    }
};

module.exports = logActivity;
