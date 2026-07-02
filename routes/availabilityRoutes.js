const express = require('express');
const {
  getAvailability,
  upsertAvailability,
  getDoctorAvailability,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// هذا المسار عام (للمساعد والأطباء)
router.get('/doctor/:doctorId', getDoctorAvailability);

// باقي المسارات تتطلب دور طبيب
router.use(authorize('doctor'));

router.route('/')
  .get(getAvailability)
  .post(upsertAvailability);

module.exports = router;