const express = require('express');
const { getAssignedDoctorPatients, addVitalSignByAssistant, getCancelledEmergencyAppointments, rescheduleEmergencyAppointment } = require('../controllers/assistantController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('assistant'));

router.get('/patients', getAssignedDoctorPatients);
router.post('/vitals', addVitalSignByAssistant);
router.get('/cancelled-emergency', getCancelledEmergencyAppointments);
router.post('/reschedule/:appointmentId', rescheduleEmergencyAppointment);

module.exports = router;