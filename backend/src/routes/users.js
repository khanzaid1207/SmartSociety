/**
 * routes/users.js
 */
const express = require('express')
const router  = express.Router()
const { getProfile, updateProfile, uploadAvatar } = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { upload }  = require('../../config/cloudinary')

router.get('/profile',        protect, (req, res) => res.redirect(`/api/users/${req.user._id}`))
router.put('/profile',        protect, updateProfile)
router.post('/avatar',        protect, upload.single('avatar'), uploadAvatar)
router.get('/:id',            protect, getProfile)

module.exports = router
