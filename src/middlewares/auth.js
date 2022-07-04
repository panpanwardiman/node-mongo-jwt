const jwt = require('jsonwebtoken')
const User = require('../models/users')
const Blog = require('../models/blog')

const auth = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Unauthorized' })
    }

    const token = req.headers.authorization.replace('Bearer ', '')

    const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    try {
        const user = await User.findOne({
            _id: data.uid, 'tokens.token': token
        })

        if (!user) {
            res.status(404).send({
                code: 404,
                message: 'User not found.'
            })
        }

        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }
}

const role = function(roles = []) {
    return (req, res, next) => {
        // params bisa diisi dengan string ex: ('admin')
        // atau object (roles.Admin)
        if (typeof roles == "string") {
            roles = [roles]
        }

        if (roles.length && !roles.includes(req.user.role)) {
            res.status(401).send({message: 'Unauthorized.'})
        }
        next();
    }
}

const owner = async (req, res, next) => {
    const em = req.user.email
    const blogId = req.query.blogId
    const userRole = req.user.role

    const blog = await Blog.findById(blogId)

    if (!blog) {
        res.status(404).send({
            code: 404,
            message: 'Data not found.'
        })
    }

    if (!((userRole == 'user' && em == blog.author.email) || userRole == 'admin')) {
        res.status(401).send({message: 'Forbidden Access'})
    } 
    next()
}

const authorized = {
    auth,
    role,
    owner
}

module.exports = authorized