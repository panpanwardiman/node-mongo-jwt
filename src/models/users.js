const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        createIndex: {
            unique: true
        },
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({
                    error: 'Invalid Email Address'
                })
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    }, 
    role: {
        type: String,
        required:true
    },
    birth_day: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({
        em: user.email, uid: user._id, r: user.role
    }, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256"
    })
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error({error: 'Invalid login credentials'})
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials')
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User
