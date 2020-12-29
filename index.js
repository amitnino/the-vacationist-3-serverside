const express = require('express');
const cors = require('cors');
require('dotenv').config()



const app = express()

app.use(express.static('public'))
app.use(cors())
app.use(express.json())

// ** MIDDLEWARE ** //
const whitelist = ['http://localhost:1000', 'http://localhost:3000', 'https://thevacationist.herokuapp.com']
const corsOptions = {
  origin: function (origin, callback) {
    console.log("** Origin of request " + origin)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      console.log("Origin acceptable")
      callback(null, true)
    } else {
      console.log("Origin rejected")
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))

app.use('/auth', require('./routes/auth.js'))
app.use('/vacations', require('./routes/vacations.js'))

//  Serve client react instead of backend 
//  Add the follwing code to your server file on the backend 
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const port = process.env.PORT || 1000
app.listen(port, err => {
    if(err) throw err;
    console.log(`[SERVER] docked at port ${port}`);
});