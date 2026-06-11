/**
 * middleware/auth.js
 * -------------------
 * Protects routes by verifying the JWT token sent in the Authorization header.
 *
 * How it works:
 *  1. Client sends: Authorization: Bearer <token>
 *  2. We decode the token → get the userId
 *  3. We fetch the user from DB and attach to req.user
 *  4. Next middleware or controller can use req.user
 *
 * Usage on any route:
 *   router.get('/protected', protect, controller)
 *   router.get('/admin-only', protect, requireRole('rwa'), controller)
 */

const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// protect — verifies JWT and attaches req.user
async function protect(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' })
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      const msg = err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.'
      return res.status(401).json({ message: msg })
    }

    // Fetch user from DB (excludes password by default)
    const user = await User.findById(decoded.userId).populate('society', 'name inviteCode memberCount')
    if (!user) return res.status(401).json({ message: 'User no longer exists.' })

    req.user = user   // make user available in all next handlers
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    res.status(500).json({ message: 'Server error during authentication.' })
  }
}

// requireRole — use after protect to restrict by role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to do this.' })
    }
    next()
  }
}

// optionalAuth — attaches user if token exists, continues even if not
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = await User.findById(decoded.userId)
    }
  } catch { /* ignore */ }
  next()
}

module.exports = { protect, requireRole, optionalAuth }
