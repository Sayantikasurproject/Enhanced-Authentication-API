const express = require('express');
const { getProfile, updateProfile, listPublicProfiles, getAllProfiles } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/profiles', protect, listPublicProfiles);
router.get('/admin/profiles', protect, admin, getAllProfiles);

module.exports = router;
