const express = require('express')
const blogController = require('../controllers/blog')
const authorized = require('../middlewares/auth')

const router = express.Router()

router.post('/blog', [authorized.auth, authorized.role()], blogController.createBlog)
router.get('/blog/:blogId', blogController.getBlogById)
router.put('/blog/:blogId', [authorized.auth, authorized.owner, authorized.role()], blogController.updateBlog)
router.delete('/blog/:blogId', [authorized.auth, authorized.owner, authorized.role()], blogController.deleteBlog)
router.get('/blog', blogController.searchBlog)

module.exports = router