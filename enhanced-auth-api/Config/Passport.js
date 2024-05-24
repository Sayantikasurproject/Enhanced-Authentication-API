const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

const configureOAuthStrategy = (Strategy, clientID, clientSecret, callbackURL, provider) => {
  passport.use(new Strategy({
    clientID,
    clientSecret,
    callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    const existingUser = await User.findOne({ email: profile.emails[0].value });
    if (existingUser) {
      return done(null, existingUser);
    }
    const newUser = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      authProvider: provider,
      isPublic: true // Default to public profile
    });
    await newUser.save();
    done(null, newUser);
  }));
};

configureOAuthStrategy(GoogleStrategy, process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, '/auth/google/callback', 'google');
configureOAuthStrategy(FacebookStrategy, process.env.FACEBOOK_APP_ID, process.env.FACEBOOK_APP_SECRET, '/auth/facebook/callback', 'facebook');
configureOAuthStrategy(TwitterStrategy, process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, '/auth/twitter/callback', 'twitter');
configureOAuthStrategy(GitHubStrategy, process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, '/auth/github/callback', 'github');

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));
