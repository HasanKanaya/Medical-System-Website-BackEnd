const express = require('express');
const { getMyPrescriptions, getPrescriptionById, getPatientPrescriptions } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// ✅ ترتيب المسارات: الأكثر تحديداً أولاً
router.get('/me', getMyPrescriptions);
router.get('/patient/:patientId', getPatientPrescriptions); // وضعه قبل /:id لتجنب التعارض
router.get('/:id', getPrescriptionById);

module.exports = router;