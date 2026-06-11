/**
 * models/Business.js
 * -------------------
 * Local business registered on SmartSociety.
 */

const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema(
  {
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:     { type: String, required: true, trim: true },
    category: {
      type:    String,
      enum:    ['food', 'grocery', 'education', 'health', 'salon', 'repair', 'other'],
      default: 'other',
    },
    phone:      { type: String, default: '' },
    address:    { type: String, default: '' },
    area:       { type: String },
    city:       { type: String },
    logoUrl:    { type: String, default: '' },
    promoText:  { type: String, default: '', maxlength: 300 },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
)

businessSchema.index({ area: 1, category: 1 })

module.exports = mongoose.model('Business', businessSchema)
