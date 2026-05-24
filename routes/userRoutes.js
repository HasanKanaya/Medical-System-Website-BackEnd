const express = require('express');
const { getProfile, updateProfile, getDoctors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// جميع المسارات محمية (تحتاج توكن)
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/doctors', protect, getDoctors);

module.exports = router;