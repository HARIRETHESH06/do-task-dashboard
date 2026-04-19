const mongoose = require('mongoose');

// Cache the connection in serverless environments
let isConnected;

const connectDB = async () => {
    if (isConnected) {
        console.log("✅ Using existing MongoDB connection");
        return;
    }

    try {
        if (!process.env.MONGO_URI) {
            console.warn("⚠️ MONGO_URI is missing from environment variables!");
            return;
        }
        
        // Add recommended serverless mongoose options
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });

        isConnected = conn.connections[0].readyState;
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
    }
};

module.exports = connectDB;
