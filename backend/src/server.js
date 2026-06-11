/**
 * server.js
 * ----------
 * Main entry point. Sets up Express, middleware, routes, and starts the server.
 *
 * HOW TO RUN:
 *   1. Copy .env.example to .env and fill in your values
 *   2. npm install
 *   3. npm run dev     ← for development (auto-restarts on changes)
 *   4. npm start       ← for production
 */

require('dotenv').config()           // Load .env file FIRST

const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')
const connectDB   = require('../config/db')

const { errorHandler } = require('./middleware/errorHandler')

// Import all route files
const authRoutes         = require('./routes/auth')
const postRoutes         = require('./routes/posts')
const userRoutes         = require('./routes/users')
const societyRoutes      = require('./routes/society')
const businessRoutes     = require('./routes/business')
const notificationRoutes = require('./routes/notifications')

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express()

// Security headers
app.use(helmet())

// CORS — allow requests from the React frontend
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Parse JSON request bodies (req.body)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// HTTP request logger (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'))
}

// Rate limiting — max 100 requests per 15 minutes per IP (prevents abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      100,
  message:  { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})
app.use('/api', limiter)

// Stricter rate limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { message: 'Too many login attempts. Please wait 15 minutes.' },
})
app.use('/api/auth/login',    authLimiter)
app.use('/api/auth/register', authLimiter)

// ── Routes ────────────────────────────────────────────────────────────────────
// Health check — useful to verify the server is running
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
})

app.use('/api/auth',          authRoutes)
app.use('/api/posts',         postRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/society',       societyRoutes)
app.use('/api/business',      businessRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 handler — catches any undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
})

// Global error handler — MUST be last
app.use(errorHandler)

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

async function start() {
  await connectDB()             // Connect to MongoDB first
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📋 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  })
}

start()

module.exports = app   // exported for testing
