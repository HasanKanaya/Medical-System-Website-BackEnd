const express = require('express');
const { getUsers, updateUserStatus, verifyDoctor, getStats, getDoctorsList, assignAssistantToDoctor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // فقط المسؤول

router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);
router.put('/doctors/:id/verify', verifyDoctor);
router.get('/stats', getStats);
router.get('/doctors-list', getDoctorsList);
router.put('/assign-assistant/:assistantId', assignAssistantToDoctor);

module.exports = router;