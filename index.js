require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')

const app = express()
const authRoutes = require('./src/routes/auth')
const userRoutes = require('./src/routes/users')
const blogRoutes = require('./src/routes/blog')
const commentRoutes = require('./src/routes/comment')

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getTime() + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('photo'))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Mehtods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/v1/auth', authRoutes)
app.use('/v1/', userRoutes)
app.use('/v1/', blogRoutes)
app.use('/v1/', commentRoutes)

const port = process.env.PORT || 3000

mongoose.connect('mongodb://localhost:27017/db_node_jwt', {useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })
}).catch(err => console.log(err))