const User = require("../models/users")

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        return res.status(201).send({ user })
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.getUserById = async (req, res) => {
    try {
        const user_id = req.params.userId

        const user = await User.findById(user_id, {
            name: 1,
            email: 1,
            address: 1,
            birth_day: 1,
            tokens: 1
        })

        if (!user) {
            const err = new Error('User not found.')
            err.errCode = 404
            throw err
        }        

        return res.status(200).send({
            message: 'Successfully get user by ID.',
            data: user
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.getAllUsers = async (req, res) => {
    try {
        const page = req.query.page || 1
        const perPage = req.query.perPage || 5

        const count = await User.find().countDocuments()
        const users = await User.find({}, {
            name: 1, 
            email: 1,
            birth_day: 1,
            address: 1,
            role: 1
        }).skip((parseInt(page) - 1) * parseInt(perPage)).limit(parseInt(perPage))
        
        const totalPage = Math.ceil(count / parseInt(perPage))
        const prevPage = parseInt(page) - 1
        const nextPage = parseInt(page) + 1

        const paging = {
            total_items: count,
            total_page: totalPage,
            current_page: parseInt(page),
            per_page: parseInt(perPage),
            first_page: 1,
            last_page: totalPage,
            previous_page: prevPage,
            next_page: nextPage,
        }

        const result = {users, paging}

        res.status(200).send({
            message: 'Successfully get all users.',          
            data: result,
            
        })
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.userId

        const user = await User.findById(userId, {
            name: 1,
            email: 1,
            birth_day: 1,
            address: 1,
            role: 1
        })

        if (!user) {
            const err = new Error('User not found.')
            err.errCode = 404
            throw err
        }

        user.name = req.body.name
        user.email = req.body.email
        user.birth_day = req.body.birth_day
        user.address = req.body.address
        user.role = req.body.role

        const result = await user.save()

        res.status(200).send({
            message: `Updated data user id ${userId}`,
            data: result
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.userId

        const user = await User.findById(userId, {
            name: 1,
            email: 1
        })

        if (!user) {
            const err = new Error('User not found.')
            err.errCode = 404
            throw err
        }

        const result = await User.findByIdAndRemove(userId)
        res.status(200).send({
            message: `Successfully delete user id ${userId}`,
            data: result
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.searchUser = async (req, res, next) => {
    try {
        const search = req.query.queries 
        
        const query = { 
            name: {
                $regex: search,
                $options: "i"
            }
        }
        const projection = {
            name: 1,
            email: 1,
            birth_day: 1,
            address: 1
        }        

        const user = await User.find(query, projection)

        res.status(200).send({
            message: `Successfully search ${search}`,
            searchTerm: search,
            data: user
        })
    } catch (error) {
        res.status(400).send({message: error})
    }
}