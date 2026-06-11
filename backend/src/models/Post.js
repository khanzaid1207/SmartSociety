/**
 * models/Post.js
 * ---------------
 * Defines the shape of a post document in MongoDB.
 */

const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text:   { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
)

const postSchema = new mongoose.Schema(
  {
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 500 },
    imageUrl:{ type: String, default: '' },

    // Which feed level this post belongs to
    level: {
      type:     String,
      enum:     ['society', 'area', 'public'],
      required: true,
    },

    // AI-assigned category (set by the Python AI service)
    category: {
      type:    String,
      enum:    ['help', 'event', 'business', 'emergency', 'general', 'lost_found'],
      default: 'general',
    },

    // Location scoping — which society/area can see this post
    society: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    area:    { type: String },   // area name string for now
    city:    { type: String },

    // AI flags
    isEmergency: { type: Boolean, default: false },
    isSpam:      { type: Boolean, default: false },
    aiScore:     { type: Number,  default: 0 },    // confidence score from AI

    // Engagement
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// Virtual field: count of likes (no need to store this separately)
postSchema.virtual('likesCount').get(function () {
  return this.likes.length
})

// Index for fast feed queries — most recent posts first, within a level+area
postSchema.index({ level: 1, area: 1, createdAt: -1 })
postSchema.index({ level: 1, society: 1, createdAt: -1 })
postSchema.index({ isEmergency: 1, createdAt: -1 })

module.exports = mongoose.model('Post', postSchema)
