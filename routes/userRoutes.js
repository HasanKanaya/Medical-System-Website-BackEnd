const express = require('express');
const { getProfile, updateProfile, getDoctors, getDoctorById, searchDoctors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadCV } = require('../controllers/userController');


router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.get('/doctors', protect, getDoctors);
router.get('/doctors/search', protect, searchDoctors);
router.get('/doctors/:id', protect, getDoctorById);
router.post('/doctor/upload-cv', protect, upload.single('cv'), uploadCV);
module.exports = router;