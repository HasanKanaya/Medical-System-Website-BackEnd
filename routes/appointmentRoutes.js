const express = require('express');
const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getAvailableSlots,
  updateAppointmentStatus,
  rescheduleAppointment,
  getAppointmentById,
  cancelFullDay,
  completeAppointmentWithPrescription
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
router.put('/:id/reschedule', protect, rescheduleAppointment);
router.get('/:id', protect, getAppointmentById);
router.post('/cancel-day', protect, authorize('doctor'), cancelFullDay);
router.post('/:id/complete', protect, authorize('doctor'), completeAppointmentWithPrescription);

module.exports = router;