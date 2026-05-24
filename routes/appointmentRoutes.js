const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getAvailableSlots,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // كل المسارات محمية

router.route('/')
  .post(createAppointment);

  router.put('/:id/status', updateAppointmentStatus);
router.get('/my-appointments', getMyAppointments);
router.get('/doctor-appointments', authorize('doctor'), getDoctorAppointments);
router.put('/:id/cancel', cancelAppointment);
router.get('/available-slots/:doctorId', getAvailableSlots);

module.exports = router;