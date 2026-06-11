/**
 * controllers/postController.js
 * Full CRUD + AI pipeline + author filter fix
 */
const Post     = require('../models/Post')
const { analysePost }    = require('../services/aiService')
const { notifySociety, notify } = require('../services/notificationService')
const { asyncHandler, AppError } = require('../middleware/errorHandler')

// GET /api/posts/feed/:level
const getFeed = asyncHandler(async (req, res) => {
  const { level } = req.params
  const { page=1, limit=10, category, q, author } = req.query

  if (!['society','area','public'].includes(level))
    throw new AppError('Invalid feed level', 400)

  const filter = { isSpam: false }

  // Author filter — for profile page (fetch posts by a specific user across any level)
  if (author) {
    filter.author = author
    // Don't restrict by level when filtering by author — show all their posts
  } else {
    filter.level = level
    if (level === 'society' && req.user.society) {
      filter.society = req.user.society._id ?? req.user.society
    } else if (level === 'area') {
      filter.area = req.user.area
      filter.city = req.user.city
    }
  }

  if (category && category !== 'all') filter.category = category
  if (q) filter.$text = { $search: q }

  const skip  = (Number(page)-1) * Number(limit)
  const total = await Post.countDocuments(filter)

  let posts = await Post.find(filter)
    .sort({ isEmergency:-1, createdAt:-1 })
    .skip(skip).limit(Number(limit))
    .populate('author','name avatar isVerified role')
    .populate('comments.author','name avatar')
    .lean({ virtuals: true })

  const userId = req.user._id.toString()
  posts = posts.map(p => ({
    ...p,
    likedByMe:  p.likes?.some(id => id.toString()===userId) ?? false,
    likesCount: p.likes?.length ?? 0,
  }))

  res.json({ success:true, posts, page:Number(page), hasMore: skip+posts.length<total, total })
})

// POST /api/posts
const createPost = asyncHandler(async (req, res) => {
  const { content, level } = req.body
  if (!content?.trim()) throw new AppError('Content cannot be empty', 400)
  if (content.length > 500) throw new AppError('Post too long (max 500 chars)', 400)
  if (!['society','area','public'].includes(level)) throw new AppError('Invalid level', 400)

  const ai = await analysePost(content)
  if (ai.isSpam) return res.status(422).json({ success:false, message:'Post flagged as spam by AI.' })

  const postData = {
    author: req.user._id, content: content.trim(), level,
    category: ai.category, isEmergency: ai.isEmergency, isSpam: false, aiScore: ai.score,
    city: req.user.city, area: req.user.area,
  }
  if (level==='society' && req.user.society) postData.society = req.user.society._id ?? req.user.society
  if (req.file?.path) postData.imageUrl = req.file.path

  const post = await Post.create(postData)
  await post.populate('author','name avatar isVerified role')

  if (ai.isEmergency && postData.society) {
    notifySociety(postData.society, `🚨 Emergency: ${content.slice(0,80)}…`, `/post/${post._id}`).catch(()=>{})
  }

  res.status(201).json({ success:true, post:{ ...post.toJSON(), likedByMe:false, likesCount:0 } })
})

// PUT /api/posts/:id/like
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  const userId = req.user._id
  const idx = post.likes.indexOf(userId)
  if (idx===-1) {
    post.likes.push(userId)
    if (post.author.toString()!==userId.toString())
      notify(post.author,'like',`${req.user.name} liked your post`,`/post/${post._id}`).catch(()=>{})
  } else { post.likes.splice(idx,1) }
  await post.save()
  res.json({ success:true, likesCount:post.likes.length, liked:idx===-1 })
})

// POST /api/posts/:id/comments
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body
  if (!text?.trim()) throw new AppError('Comment cannot be empty', 400)
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  post.comments.push({ author:req.user._id, text:text.trim() })
  await post.save()
  await post.populate('comments.author','name avatar')
  if (post.author.toString()!==req.user._id.toString())
    notify(post.author,'comment',`${req.user.name} commented on your post`,`/post/${post._id}`).catch(()=>{})
  res.json({ success:true, comments:post.comments })
})

// DELETE /api/posts/:id/comments/:commentId
const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  const comment = post.comments.id(req.params.commentId)
  if (!comment) throw new AppError('Comment not found', 404)
  if (comment.author.toString()!==req.user._id.toString()) throw new AppError('Not your comment', 403)
  comment.deleteOne()
  await post.save()
  res.json({ success:true, comments:post.comments })
})

// DELETE /api/posts/:id
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) throw new AppError('Post not found', 404)
  if (post.author.toString()!==req.user._id.toString() && req.user.role!=='rwa')
    throw new AppError('Not authorized', 403)
  await post.deleteOne()
  res.json({ success:true, message:'Post deleted' })
})

// GET /api/posts/:id
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author','name avatar isVerified role')
    .populate('comments.author','name avatar')
    .lean({ virtuals:true })
  if (!post) throw new AppError('Post not found', 404)
  const userId = req.user._id.toString()
  res.json({ success:true, post:{ ...post, likedByMe:post.likes?.some(id=>id.toString()===userId), likesCount:post.likes?.length??0 } })
})

module.exports = { getFeed, createPost, likePost, addComment, deleteComment, deletePost, getPost }
