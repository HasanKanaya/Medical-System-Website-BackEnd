const express = require('express');
const { getMyPrescriptions, getPrescriptionById } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/me', getMyPrescriptions);
router.get('/:id', getPrescriptionById);

module.exports = router;