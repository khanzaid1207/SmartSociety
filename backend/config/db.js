/**
 * config/db.js
 * -------------
 * Connects to MongoDB Atlas using Mongoose.
 * Called once when the server starts.
 */

const mongoose = require('mongoose')

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options silence deprecation warnings
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)   // Stop the server if DB fails — no point running without DB
  }
}

module.exports = connectDB
