/**
 * middleware/errorHandler.js
 * ---------------------------
 * Global error handler — catches all errors thrown by controllers.
 * Must be registered LAST in server.js (after all routes).
 *
 * Any controller can just: throw new AppError('message', 400)
 * or:                       next(err)
 */

// Custom error class with HTTP status code
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true   // vs unexpected programming errors
  }
}

// Express error-handling middleware (must have 4 params)
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500
  let message    = err.message    || 'Internal server error'

  // Mongoose: document not found
  if (err.name === 'CastError') {
    statusCode = 400
    message    = `Invalid ${err.path}: ${err.value}`
  }

  // Mongoose: duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    statusCode  = 409
    message     = `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`
  }

  // Mongoose: validation failed
  if (err.name === 'ValidationError') {
    statusCode = 422
    message    = Object.values(err.errors).map((e) => e.message).join(', ')
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token' }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Session expired' }

  // Log unexpected errors (not operational/expected ones)
  if (!err.isOperational) {
    console.error('💥 Unexpected error:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

// Wrap async controller functions to auto-catch errors
// Usage: router.get('/route', asyncHandler(async (req, res) => { ... }))
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = { AppError, errorHandler, asyncHandler }
