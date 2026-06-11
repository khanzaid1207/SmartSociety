/**
 * routes/business.js
 */
const express = require('express')
const router  = express.Router()
const { registerBusiness, getMyBusiness, getNearby, promote } = require('../controllers/businessController')
const { protect } = require('../middleware/auth')
const { upload }  = require('../../config/cloudinary')

router.post('/',         protect, upload.single('logo'), registerBusiness)
router.get('/mine',      protect, getMyBusiness)
router.get('/nearby/:areaId', protect, getNearby)
router.post('/promote',  protect, promote)

module.exports = router
