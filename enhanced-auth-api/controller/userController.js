const User = require('../models/User');

// Get the profile of the logged-in user
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update the profile of the logged-in user
exports.updateProfile = async (req, res) => {
  const { name, email, bio, phone, photo, password, isPublic } = req.body;

  const updatedFields = {};
  if (name) updatedFields.name = name;
  if (email) updatedFields.email = email;
  if (bio) updatedFields.bio = bio;
  if (phone) updatedFields.phone = phone;
  if (photo) updatedFields.photo = photo;
  if (typeof isPublic !== 'undefined') updatedFields.isPublic = isPublic;
  if (password) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    updatedFields.password = await bcrypt.hash(password, salt);
  }

  try {
    const user = await User.findByIdAndUpdate(req.user.id, updatedFields, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List public profiles
exports.listPublicProfiles = async (req, res) => {
  try {
    const users = await User.find({ isPublic: true }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: List all profiles
exports.getAllProfiles = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
