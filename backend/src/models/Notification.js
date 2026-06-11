/**
 * models/Notification.js
 * -----------------------
 * Stores in-app notifications for each user.
 */

const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:      { type: String, enum: ['emergency', 'like', 'comment', 'info'], default: 'info' },
    message:   { type: String, required: true },
    link:      { type: String, default: '' },   // e.g. /post/123
    read:      { type: Boolean, default: false },
  },
  { timestamps: true }
)

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
