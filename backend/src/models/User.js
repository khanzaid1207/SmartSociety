/**
 * models/User.js
 * ---------------
 * Defines the shape of a user document in MongoDB.
 * Think of this like a table schema in SQL.
 */

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:   { type: String, select: false },   // select:false = not returned by default in queries
    googleId:   { type: String },

    avatar:     { type: String, default: '' },
    bio:        { type: String, default: '', maxlength: 200 },

    // Role controls what the user can do
    role: {
      type:    String,
      enum:    ['resident', 'business', 'rwa'],
      default: 'resident',
    },

    // Location
    city:     { type: String, default: '' },
    area:     { type: String, default: '' },

    // References to related documents
    society:  { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },

    isVerified: { type: Boolean, default: false },

    // Notification preferences
    notifPrefs: {
      emergency: { type: Boolean, default: true },
      likes:     { type: Boolean, default: true },
      comments:  { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,   // automatically adds createdAt and updatedAt fields
  }
)

// Before saving: hash the password if it was changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt  = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Method to compare plain password with hashed one (used during login)
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password)
}

// Never return the password in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

module.exports = mongoose.model('User', userSchema)
