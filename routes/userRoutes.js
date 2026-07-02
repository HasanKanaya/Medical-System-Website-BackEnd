const express = require('express');
const { getProfile, updateProfile, getDoctors, getDoctorById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/doctors', protect, getDoctors);
router.get('/doctors/:id', protect, getDoctorById);
module.exports = router;