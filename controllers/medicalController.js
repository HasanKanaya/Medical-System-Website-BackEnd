const MedicalProfile = require('../models/MedicalProfile');
const VitalSign = require('../models/VitalSign');
const User = require('../models/User');

exports.getMedicalProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.id !== patientId && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    let profile = await MedicalProfile.findOne({ patient: patientId });
    if (!profile) {
      profile = await MedicalProfile.create({ patient: patientId });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMedicalProfile = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update medical profiles' });
    }
    const { patientId } = req.params;
    const { bloodType, allergies, chronicDiseases, pastSurgeries, regularMedications } = req.body;
    let profile = await MedicalProfile.findOne({ patient: patientId });
    if (!profile) {
      profile = new MedicalProfile({ patient: patientId });
    }
    if (bloodType) profile.bloodType = bloodType;
    if (allergies !== undefined) profile.allergies = allergies;
    if (chronicDiseases !== undefined) profile.chronicDiseases = chronicDiseases;
    if (pastSurgeries !== undefined) profile.pastSurgeries = pastSurgeries;
    if (regularMedications !== undefined) profile.regularMedications = regularMedications;
    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addVitalSign = async (req, res) => {
  console.log('addVitalSign called with body:', req.body);
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can add vital signs' });
    }
    const { patientId, height, weight, heartRate, bloodPressureSystolic, bloodPressureDiastolic, bloodSugar, temperature, respiratoryRate, oxygenSaturation, notes } = req.body;
    const vital = await VitalSign.create({
      patient: patientId,
      doctor: req.user.id,
      height,
      weight,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      temperature,
      respiratoryRate,
      oxygenSaturation,
      notes,
    });
    res.status(201).json(vital);
  } catch (error) {
    console.error('Error in addVitalSign:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getVitalSigns = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (req.user.id !== patientId && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const vitals = await VitalSign.find({ patient: patientId })
      .populate('doctor', 'fullName')
      .sort({ recordedAt: -1 });
    res.json(vitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVitalSign = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update vital signs' });
    }
    const vital = await VitalSign.findById(req.params.id);
    if (!vital) return res.status(404).json({ message: 'Not found' });

    const updates = req.body;
    Object.assign(vital, updates);
    await vital.save();
    res.json(vital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};