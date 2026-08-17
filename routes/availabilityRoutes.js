const express = require('express');
const {
  getAvailability,
  upsertAvailability,
  getDoctorAvailability,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/doctor/:doctorId', getDoctorAvailability);

router.use(authorize('doctor'));

router.route('/')
  .get(getAvailability)
  .post(upsertAvailability);

module.exports = router;