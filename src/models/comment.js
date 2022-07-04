const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    text: String,
    commenter: {
        username: String,
        email: String
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment