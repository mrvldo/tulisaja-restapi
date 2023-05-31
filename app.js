const express = require('express')
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

require('dotenv').config()

app.use(bodyParser.urlencoded({
    extended: true
}))


app.use(bodyParser.json())
app.use(cors())

// import Route
const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/post')
app.use('/auth', authRoutes)
app.use('/post', postRoutes)

mongoose.connect(process.env.DATABASE_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

let db = mongoose.connection

// Handle Error
db.on('error', console.error.bind(console, 'Error Establishing a Database'))

// Handle Succes
db.once('open', () => {
    console.log("Database is connected")
})
app.listen(process.env.PORT, () => {
    console.log(Example app listening on port ${process.env.PORT})
})