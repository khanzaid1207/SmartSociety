/**
 * models/Society.js
 * ------------------
 * A society is a building/apartment complex.
 * Members belong to one society. RWA admin manages it.
 */

const mongoose = require('mongoose')
const { randomBytes } = require('crypto')

const societySchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    area:    { type: String, required: true },
    city:    { type: String, required: true },
    address: { type: String, default: '' },

    // Invite code — share this with neighbours to let them join
    inviteCode: {
      type:    String,
      unique:  true,
      default: () => randomBytes(3).toString('hex').toUpperCase(),
    },

    admin:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Pinned notices (max 5)
    pinnedNotices: [
      {
        content:   String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

// Virtual: member count
societySchema.virtual('memberCount').get(function () {
  return this.members.length
})

societySchema.set('toJSON', { virtuals: true })

module.exports = mongoose.model('Society', societySchema)
