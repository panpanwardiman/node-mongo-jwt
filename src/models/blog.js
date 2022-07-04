const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    author: {
        username: String,
        email: String
    },
    tags: [String],
    commentars: [{
        comment: {
            type: mongoose.Types.ObjectId,
            ref: 'Comment'
        }
    }]
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog