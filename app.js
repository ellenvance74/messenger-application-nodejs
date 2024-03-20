const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const passport = require('passport');
const session = require('express-session');

const port = process.env.PORT || 3000;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname + '/public')));

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
var displayName;

// Protected route
app.get('/live-chat', ensureAuthenticated, (req, res) => {
  console.log('Accessing protected route');
  // // res.send('Protected Route');
  // res.sendFile(__dirname + '/views/chat.html');
  displayName = req.user.displayName;

  // Read the HTML file and replace tokens
  let htmlContent = require('fs').readFileSync(__dirname + '/views/chat.html', 'utf8');
  htmlContent = htmlContent.replace('{displayName}', displayName);

  // Send the modified HTML content
  res.send(htmlContent);
});

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('User is authenticated');
    req.user.socketUserVar = req.user.displayName;
    return next();
  }
  res.redirect('/auth/google');
}

// Google OAuth login route
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
);

// Google OAuth callback route
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/live-chat');
  }
);

// var currentUser;
// Home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // res.send(`<h1>Welcome ${req.user.displayName}</h1><a href="/logout">Logout</a>`);
    // currentUser = req.user.displayName;
    res.sendFile(__dirname + '/views/chat.html');
  } else {
    res.sendFile(__dirname + '/views/home.html');
  }
});

// Logout route
app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

io.on('connection', (socket) => {
  const currentUser = displayName;
  console.log(`User connected ${displayName}`);
  io.emit('user connected', { user: `${displayName}` });
  socket.on('disconnect', () => {
    console.log(`User disconnected ${displayName}`)
    io.emit('user disconnected', { user: `${displayName}` });
  })
  socket.on('chat message', (msg) => {
    io.emit('chat message', { user: `${displayName}`, message: msg });
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
