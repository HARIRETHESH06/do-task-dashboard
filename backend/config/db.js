const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn("⚠️ MONGO_URI is missing from environment variables!");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // process.exit(1) causes Vercel serverless functions to crash with FUNCTION_INVOCATION_FAILED.
    }
};

module.exports = connectDB;
