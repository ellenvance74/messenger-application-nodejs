const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: '399132753994-94uprkbf9l543vh1antlelgc1l91v8gp.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/auth/google/callback',
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
