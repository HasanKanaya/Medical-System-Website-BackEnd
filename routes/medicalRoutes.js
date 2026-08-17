const express = require('express');
const {
  getMedicalProfile,
  updateMedicalProfile,
  addVitalSign,
  getVitalSigns,
  updateVitalSign,
} = require('../controllers/medicalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); 

router.route('/profile/:patientId')
  .get(getMedicalProfile)
  .put(authorize('doctor'), updateMedicalProfile);

router.route('/vitals')
  .post(authorize('doctor'), addVitalSign);

router.route('/vitals/:patientId')
  .get(getVitalSigns);

router.route('/vitals/:id')
  .put(authorize('doctor'), updateVitalSign);

module.exports = router;