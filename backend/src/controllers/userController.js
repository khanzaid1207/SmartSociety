/**
 * controllers/userController.js
 */

const User = require('../models/User')
const { asyncHandler, AppError } = require('../middleware/errorHandler')

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('society', 'name inviteCode memberCount')
  if (!user) throw new AppError('User not found', 404)
  res.json({ success: true, user })
})

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'city', 'area', 'notifPrefs']
  const updates = {}
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

  // Password change
  if (req.body.newPassword) {
    const user = await User.findById(req.user._id).select('+password')
    if (!req.body.currentPassword) throw new AppError('Current password required', 400)
    const ok = await user.comparePassword(req.body.currentPassword)
    if (!ok) throw new AppError('Current password is incorrect', 401)
    user.password = req.body.newPassword
    await user.save()
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
    .populate('society', 'name inviteCode memberCount')
  res.json({ success: true, user })
})

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.path) throw new AppError('No image uploaded', 400)
  const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path }, { new: true })
  res.json({ success: true, avatarUrl: user.avatar })
})

module.exports = { getProfile, updateProfile, uploadAvatar }
