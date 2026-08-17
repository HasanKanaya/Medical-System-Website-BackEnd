const Recommendation = require('../models/Recommendation');
const User = require('../models/User');

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

exports.createRecommendation = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { doctorId, prescriptionId } = req.body;

    const Prescription = require('../models/Prescription');
    const hasPrescription = await Prescription.findOne({ patient: patientId, doctor: doctorId });
    if (!hasPrescription) {
      return res.status(400).json({ message: 'You cannot recommend a doctor you have no prescription from.' });
    }

    const existing = await Recommendation.findOne({ patient: patientId, doctor: doctorId });
    if (existing) {
      return res.status(400).json({ message: 'You already recommended this doctor.' });
    }

    const recommendation = await Recommendation.create({
      patient: patientId,
      doctor: doctorId,
      prescription: prescriptionId || null,
    });

    await User.findByIdAndUpdate(doctorId, {
      $inc: { 'doctorDetails.recommendationCount': 1 },
    });

    res.status(201).json({ message: 'Recommendation added successfully!', recommendation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};