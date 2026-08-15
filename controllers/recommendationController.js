const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

// @desc    Check if patient already recommended a specific doctor
// @route   GET /api/recommendations/check/:doctorId
// @access  Private
exports.checkRecommendation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId } = req.params;

    const exists = await Recommendation.findOne({ patient: patientId, doctor: doctorId });
    res.json({ recommended: !!exists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new recommendation
// @route   POST /api/recommendations
// @access  Private
exports.createRecommendation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, prescriptionId } = req.body;

    // 1. Check if this patient has a prescription from this doctor (to validate eligibility)
    const Prescription = require('../models/Prescription');
    const hasPrescription = await Prescription.findOne({ patient: patientId, doctor: doctorId });
    if (!hasPrescription) {
      return res.status(400).json({ message: 'You cannot recommend a doctor you have no prescription from.' });
    }

    // 2. Check if already recommended
    const existing = await Recommendation.findOne({ patient: patientId, doctor: doctorId });
    if (existing) {
      return res.status(400).json({ message: 'You already recommended this doctor.' });
    }

    // 3. Create recommendation
    const recommendation = await Recommendation.create({
      patient: patientId,
      doctor: doctorId,
      prescription: prescriptionId || null,
    });

    // 4. Increment the doctor's recommendation count
    await User.findByIdAndUpdate(doctorId, {
      $inc: { 'doctorDetails.recommendationCount': 1 },
    });

    res.status(201).json({ message: 'Recommendation added successfully!', recommendation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};