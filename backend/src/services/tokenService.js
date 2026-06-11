/**
 * services/tokenService.js
 * -------------------------
 * Generates and verifies JWT tokens.
 */

const jwt = require('jsonwebtoken')

// Generate a JWT that encodes the userId and expires in JWT_EXPIRES_IN
function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

module.exports = { generateToken }
