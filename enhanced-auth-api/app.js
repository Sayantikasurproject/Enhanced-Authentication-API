const express = require('express');
const app = express();
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

module.exports = app;
