require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { postHook } = require('./hook/controllers')

const app = express()

app.use(bodyParser.json())
app.post('/hook', postHook)

const PORT = process.env.PORT || 3000
app.listen(PORT)
console.log(`Listening on port ${PORT}`)
