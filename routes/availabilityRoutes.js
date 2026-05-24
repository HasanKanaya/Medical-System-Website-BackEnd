const express = require('express');
const {
  getAvailability,
  upsertAvailability,
} = require('../controllers/availabilityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor')); // فقط الأطباء

router.route('/')
  .get(getAvailability)
  .post(upsertAvailability);

module.exports = router;