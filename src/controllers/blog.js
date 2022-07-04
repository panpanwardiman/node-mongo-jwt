const Blog = require('../models/blog')
const Comment = require('../models/comment')
const path = require('path')
const fs = require('fs')

exports.createBlog = async (req, res, next) => {
    try {
        const blog = new Blog(req.body) 
        blog.photo = req.file.path.replace('\\', '/') 
        blog.tags = req.body.tags.replace(/\s/g, '').split(',')        
        blog.author = {
            username: req.user.name,
            email: req.user.email
        }  

        if (!req.file) {
            const err = new Error('require photo to upload.')
            err.errCode = 422
            throw err
        }

        const post = await blog.save()
        return res.status(201).send({
            status: 'success',
            message: 'Successfully created new blog.',
            data: post
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.getBlogById = async (req, res) => {
    try {
        const blogId = req.params.blogId

        const blog = await Blog.findById(blogId)
        .populate('commentars.comment') 

        if (!blog) {
            const err = new Error('Data not found.')
            err.errCode = 404
            throw err
        }

        blog.commentars.map(u => {
            console.log(u.comment.commenter.email)
        })
        
        res.status(200).send({
            status: 'Success',
            message: 'Successfully get blog by id',
            data: blog
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.searchBlog = async (req, res) => {
    try {
        const searchTerm = req.query.searchTerm
        const page = req.query.page || 1
        const perPage = req.query.perPage || 5

        const query = {
            title: {
                $regex: searchTerm,
                $options: "i"
            }
        }

        const projection = {
            title: 1,
            content: 1,
            photo: 1,
            tags: 1,
            author: 1,
            commentars: 1
        }

        const count = await Blog.find(query, projection).countDocuments()
        const blogs = await Blog.find(query, projection).skip((parseInt(page) - 1) * parseInt(perPage)).limit(parseInt(perPage))

        console.log(count)

        const totalPage = Math.ceil(count / parseInt(perPage))
        const prevPage = parseInt(page) - 1
        const nextPage = parseInt(page) + 1

        const paging = {
            total_items: count,
            total_page: totalPage,
            current_page: parseInt(page),
            per_page: parseInt(perPage),            
            links: {
                first_page: `/blog?searchTerm=${searchTerm}&page=1&perPage=${parseInt(perPage)}`,
                last_page: `/blog?searchTerm=${searchTerm}&page=${totalPage}&perPage=${parseInt(perPage)}`,
                previous_page: `/blog?searchTerm=${searchTerm}&page=${prevPage}&perPage=${parseInt(perPage)}`,
                next_page: `/blog?searchTerm=${searchTerm}&page=${nextPage}&perPage=${parseInt(perPage)}`,
            }
        }

        const result = {blogs, paging, searchTerm} 

        res.status(200).send({
            message: 'Successfully',
            data: result
            
        })
    } catch (error) {
        res.status(400).send({message: error.message})
    }
}

exports.updateBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId

        const blog = await Blog.findById(blogId)

        if (!blog) {
            const err = new Error('Data not found.')
            err.errCode = 404
            throw err
        }

        if (!req.file) {
            const err = new Error('require photo to upload.')
            err.errCode = 422
            throw err
        }

        blog.title = req.body.title
        blog.content = req.body.content
        blog.photo = req.file.path.replace('\\', '/')
        blog.tags = req.body.tags.replace(/\s/g, '').split(',')
        blog.author = {
            username: req.user.name,
            email: req.user.email
        }

        const updateBlog = await blog.save()

        res.status(201).send({
            code: 201,
            status: 'Success',
            message: 'Successfully updated blog.',
            data: updateBlog
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

exports.deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId

        const comment_id = []
        const blog = await Blog.findByIdAndRemove(blogId)
        removeImage(blog.photo)
        if (!blog) {
            const err = new Error('Data not found.')
            err.errCode = 404
            throw err
        }

        blog.commentars.map(u => {
            comment_id.push(u.comment)
        })
        
        await Comment.deleteMany({ _id: { $in: comment_id }})

        res.status(200).send({
            status: 'Success',
            message: 'Successfully delete blog by id.',
            data: blog
        })
    } catch (error) {
        res.status(error.errCode).send({
            code: error.errCode,
            message: error.message
        })
    }
}

const removeImage = (filePath) => {
    filePath = path.join(__dirname, '../..', filePath)
    fs.unlink(filePath, err => console.log(err))
}

