/**
 * routes/posts.js
 */
const express = require('express')
const router  = express.Router()
const {
  getFeed, createPost, likePost,
  addComment, deleteComment, deletePost, getPost,
} = require('../controllers/postController')
const { protect } = require('../middleware/auth')
const { upload }  = require('../../config/cloudinary')

router.get('/feed/:level',              protect, getFeed)
router.post('/',                        protect, upload.single('image'), createPost)
router.get('/:id',                      protect, getPost)
router.delete('/:id',                   protect, deletePost)
router.put('/:id/like',                 protect, likePost)
router.post('/:id/comments',            protect, addComment)
router.delete('/:id/comments/:commentId', protect, deleteComment)

module.exports = router
