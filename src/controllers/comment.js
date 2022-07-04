const Comment = require('../models/comment')
const Blog = require('../models/blog')

exports.createComment = async (req, res) => {
    try {
        const blogId = req.params.blogId
        const comment = new Comment(req.body)
        comment.blog = blogId
        comment.commenter = {
            username: req.user.name,
            email: req.user.email
        }
        const commentBlog = await comment.save() 
        
        await Blog.updateOne({_id: blogId}, {
            $push: {
                commentars: {
                    comment: commentBlog._id
                }
            }
        })

        res.status(201).send({
            message: 'Successfully created comment',
            data: commentBlog
        })
    } catch (error) {
        res.status(400).send(error)
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.query.commentId
        const blogId = req.query.blogId

        console.log(commentId)
        console.log(blogId)

        const comment = await Comment.findByIdAndRemove(commentId)
        await Blog.updateOne({_id: blogId}, {
            $pull: { commentars: { comment: commentId } }
        })

        res.status(200).send({
            message: 'Successfully delete comment.',
            data: comment
        })
    } catch (error) {
        res.status(400).send(error)
    }
}