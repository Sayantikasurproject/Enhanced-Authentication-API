const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const { Strategy: TwitterStrategy } = require('passport-twitter');
const { Strategy: GitHubStrategy } = require('passport-github');
const passport = require('passport');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// User login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.logout();
  res.json({ message: 'User logged out' });
};

// Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: ':)',
        photo: picture,
        isPublic: true,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Passport Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name', 'picture.type(large)']
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const { email, first_name, last_name, picture } = profile._json;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: `${first_name} ${last_name}`,
        email,
        password: ':)',
        photo: picture.data.url,
        isPublic: true,
      });
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

// Passport Twitter Strategy
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: '/auth/twitter/callback',
  includeEmail: true
},
async (token, tokenSecret, profile, done) => {
  try {
    const { email, displayName, photos } = profile;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: displayName,
        email,
        password: ':)',
        photo: photos[0].value,
        isPublic: true,
      });
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
  scope: 'user:email'
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const { email, displayName, photos } = profile;
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: displayName,
        email,
        password: ':)',
        photo: photos[0].value,
        isPublic: true,
      });
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
}));

exports.socialAuthCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`/auth/success?token=${token}`);
};
