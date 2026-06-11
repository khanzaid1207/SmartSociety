/**
 * routes/society.js
 */
const express = require('express')
const router  = express.Router()
const { createSociety, joinSociety, getMyInfo, getMembers } = require('../controllers/societyController')
const { protect } = require('../middleware/auth')

router.post('/',           protect, createSociety)
router.post('/join',       protect, joinSociety)
router.get('/mine',        protect, getMyInfo)
router.get('/:id/members', protect, getMembers)

module.exports = router
