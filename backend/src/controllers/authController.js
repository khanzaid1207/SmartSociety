/**
 * controllers/authController.js
 * Fixed Google OAuth to accept credential token from Google Identity Services
 */
const { OAuth2Client } = require('google-auth-library')
const User    = require('../models/User')
const Society = require('../models/Society')
const { generateToken }  = require('../services/tokenService')
const { asyncHandler, AppError } = require('../middleware/errorHandler')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function authResponse(res, user, statusCode=200) {
  const token = generateToken(user._id)
  res.status(statusCode).json({ success:true, token, user })
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, city, area, societyName, societyCode } = req.body
  if (!name||!email||!password) throw new AppError('Name, email and password are required', 400)
  if (password.length<6) throw new AppError('Password must be at least 6 characters', 400)
  if (await User.findOne({ email })) throw new AppError('Email already in use', 409)

  const user = await User.create({ name, email, password, role:role||'resident', city, area })

  if (societyCode) {
    const society = await Society.findOne({ inviteCode: societyCode.toUpperCase() })
    if (society) {
      society.members.push(user._id); await society.save()
      user.society = society._id; await user.save()
    }
  } else if (societyName && city && area) {
    const society = await Society.create({ name:societyName, city, area, admin:user._id, members:[user._id] })
    user.society = society._id; await user.save()
  }

  const populated = await User.findById(user._id).populate('society','name inviteCode memberCount')
  authResponse(res, populated, 201)
})

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email||!password) throw new AppError('Email and password are required', 400)
  const user = await User.findOne({ email }).select('+password').populate('society','name inviteCode memberCount')
  if (!user||!user.password) throw new AppError('Invalid email or password', 401)
  const match = await user.comparePassword(password)
  if (!match) throw new AppError('Invalid email or password', 401)
  authResponse(res, user)
})

// POST /api/auth/google
// Accepts the credential (id_token) from Google Identity Services (GIS)
const googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body
  if (!token) throw new AppError('Google token required', 400)

  let payload
  try {
    // Google Identity Services sends a credential which is an id_token
    const ticket = await googleClient.verifyIdToken({
      idToken:  token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch (err) {
    console.error('Google token verify error:', err.message)
    throw new AppError('Invalid Google token. Please try again.', 401)
  }

  const { sub: googleId, email, name, picture } = payload
  if (!email) throw new AppError('Could not retrieve email from Google account', 400)

  let user = await User.findOne({ $or:[{ googleId },{ email }] }).populate('society','name inviteCode memberCount')

  if (!user) {
    // New user — create account automatically
    user = await User.create({ googleId, email, name, avatar: picture||'' })
    user = await User.findById(user._id).populate('society','name inviteCode memberCount')
  } else {
    // Existing user — link Google ID if not already linked
    let changed = false
    if (!user.googleId) { user.googleId = googleId; changed = true }
    if (!user.avatar && picture) { user.avatar = picture; changed = true }
    if (changed) await user.save()
  }

  authResponse(res, user)
})

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('society','name inviteCode memberCount')
  res.json({ success:true, user })
})

module.exports = { register, login, googleLogin, getMe }
