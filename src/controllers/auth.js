const User = require('../models/users')

exports.signup = async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            birth_day: req.body.birth_day,
            address: req.body.address,
            role: req.body.role || 'user'
        })
        await user.save()
        const token = await user.generateAuthToken()
        return res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({
                error: 'Login failed! Check authentication credentials.'
            })
        }

        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.logout = async (req, res) => {
    try {
        // filter token dari object tokens, jika sama dengan req.token maka akan dihapus,
        // jika tidak maka akan dimasukkan ke array baru 
        req.user.tokens = req.user.tokens.filter((token) => {
            console.log(token)
            return token.token != req.token
        })
        await req.user.save()
        res.send({
            message: "Successfully logout."
        })
    } catch (error) {
        console.log(`error: ${error}`)
        res.status(500).send({
            message: error
        })
    }
}

exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send({
            message: "Successfully logout all device."
        })
    } catch (error) {
        console.log(`errorsss: ${error}`)
        res.status(500).send({
            message: error
        })
    }
}
