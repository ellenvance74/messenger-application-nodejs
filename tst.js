const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const passport = require('passport');
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = 3000;

// app.use - mount middleware functions at a specified path. (logging etc)
// res.sendFile - send content of file as response to HTTP request. (static - HTML, CSS)
// res.render - render dynamic views, create HTML on server side. (dynamic)

// Server static files from 'public' dir
// app.use(express.static(__dirname + '/public'));


// Set up session
app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Use the Passport setup file
require('./passport-setup');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('User is authenticated')
    return next();
  }
  res.redirect('/auth/google');
}

app.get('/protected-route', ensureAuthenticated, (req, res) => {
  res.send('Protected Route');
  console.log('Protected Route');
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

// Google OAuth login route
app.get('/auth/google',
  (req, res, next) => {
    console.log('/auth/google route accessed');
    next();
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/views/index.html');
  }
);

io.on('connection', (socket) => {
  console.log(`${socket.id}`);
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


http://localhost:3000/auth/google/callback?code=4%2F0AfJohXlcE3i1SmopCSPIN4VOxVdcWZW1ibYlKyvKpJQOqZDROKYPPGq_ABD9qpnKtFDZ8g&scope=email+profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+openid&authuser=0&prompt=consent