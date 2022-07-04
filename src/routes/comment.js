const express = require('express')
const authorized = require('../middlewares/auth')
const commentController = require('../controllers/comment')

const router = express.Router()

router.post('/comment/:blogId', [authorized.auth, authorized.role()], commentController.createComment)
router.delete('/comment', commentController.deleteComment)

module.exports = router