/**
 * controllers/businessController.js
 */

const Business = require('../models/Business')
const { asyncHandler, AppError } = require('../middleware/errorHandler')

const registerBusiness = asyncHandler(async (req, res) => {
  const { name, category, phone, address, promoText } = req.body
  if (!name) throw new AppError('Business name required', 400)

  const existing = await Business.findOne({ owner: req.user._id })
  if (existing) throw new AppError('You already have a registered business', 409)

  const biz = await Business.create({
    owner: req.user._id, name, category, phone, address, promoText,
    area:  req.user.area,
    city:  req.user.city,
    logoUrl: req.file?.path ?? '',
  })
  res.status(201).json({ success: true, business: biz })
})

const getMyBusiness = asyncHandler(async (req, res) => {
  const biz = await Business.findOne({ owner: req.user._id })
  res.json({ success: true, business: biz })
})

const getNearby = asyncHandler(async (req, res) => {
  const { category } = req.query
  const filter = { area: req.user.area, isActive: true }
  if (category && category !== 'all') filter.category = category

  const businesses = await Business.find(filter).sort({ isVerified: -1, createdAt: -1 }).limit(30)
  res.json({ success: true, businesses })
})

const promote = asyncHandler(async (req, res) => {
  const { promoText } = req.body
  const biz = await Business.findOneAndUpdate(
    { owner: req.user._id },
    { promoText },
    { new: true }
  )
  if (!biz) throw new AppError('No business found for your account', 404)
  res.json({ success: true, business: biz })
})

module.exports = { registerBusiness, getMyBusiness, getNearby, promote }
