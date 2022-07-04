const express = require('express')
const authorized = require('../middlewares/auth')

const router = express.Router()
const userController = require('../controllers/users')

router.post('/user', userController.createUser)
router.get('/user/:userId', [authorized.auth, authorized.role('admin')], userController.getUserById)
router.get('/users', [authorized.auth, authorized.role()], userController.getAllUsers)
router.get('/user', [authorized.auth, authorized.role('admin')], userController.searchUser)
router.put('/user/:userId', [authorized.auth, authorized.role('admin')], userController.updateUser)
router.delete('/user/:userId', [authorized.auth, authorized.role('admin')], userController.deleteUser)

module.exports = router
