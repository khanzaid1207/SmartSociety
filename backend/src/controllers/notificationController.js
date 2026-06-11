/**
 * controllers/notificationController.js
 */

const Notification = require('../models/Notification')
const { asyncHandler } = require('../middleware/errorHandler')

const getAll = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)
  res.json({ success: true, notifications })
})

const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }
  )
  res.json({ success: true })
})

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true })
  res.json({ success: true })
})

module.exports = { getAll, markRead, markAllRead }
