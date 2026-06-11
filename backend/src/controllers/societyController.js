/**
 * controllers/societyController.js
 */

const Society = require('../models/Society')
const User    = require('../models/User')
const { asyncHandler, AppError } = require('../middleware/errorHandler')

const createSociety = asyncHandler(async (req, res) => {
  const { name, area, city, address } = req.body
  if (!name || !area || !city) throw new AppError('Name, area and city are required', 400)

  const society = await Society.create({
    name, area, city, address,
    admin:   req.user._id,
    members: [req.user._id],
  })

  await User.findByIdAndUpdate(req.user._id, { society: society._id })
  res.status(201).json({ success: true, society })
})

const joinSociety = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) throw new AppError('Invite code required', 400)

  const society = await Society.findOne({ inviteCode: code.toUpperCase() })
  if (!society) throw new AppError('Invalid invite code', 404)

  if (society.members.includes(req.user._id)) {
    return res.json({ success: true, message: 'Already a member', society })
  }

  society.members.push(req.user._id)
  await society.save()
  await User.findByIdAndUpdate(req.user._id, { society: society._id })

  res.json({ success: true, society })
})

const getMyInfo = asyncHandler(async (req, res) => {
  if (!req.user.society) return res.json({ success: true, society: null })
  const society = await Society.findById(req.user.society).populate('members', 'name avatar role')
  res.json({ success: true, society })
})

const getMembers = asyncHandler(async (req, res) => {
  const society = await Society.findById(req.params.id).populate('members', 'name avatar role city area')
  if (!society) throw new AppError('Society not found', 404)
  res.json({ success: true, members: society.members, total: society.members.length })
})

module.exports = { createSociety, joinSociety, getMyInfo, getMembers }
