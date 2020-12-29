const express = require('express');
const cors = require('cors');
require('dotenv').config()



const app = express()

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

app.use('/auth', require('./routes/auth.js'))
app.use('/vacations', require('./routes/vacations.js'))

app.listen(1000, ()=>console.log(`[SERVER] docked at port 1000`))