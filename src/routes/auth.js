const express = require('express')
const authorized = require('../middlewares/auth')

const router = express.Router()
const authContrller = require('../controllers/auth')

router.post('/signup', authContrller.signup)
router.post('/login', authContrller.login)
router.post('/logout', authorized.auth, authContrller.logout)
router.post('/logoutall', authorized.auth, authContrller.logoutAll)

module.exports = router