const MedicalProfile = require('../models/MedicalProfile');
const VitalSign = require('../models/VitalSign');
const User = require('../models/User');


// ========== Medical Profile (بيانات ثابتة) ==========
// @desc    جلب الملف الطبي للمريض (للمريض نفسه أو للطبيب المعالج)
// @route   GET /api/medical/profile/:patientId
// @access  Private (patient or doctor who treats this patient)
exports.getMedicalProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    // التحقق من الصلاحية: المريض نفسه أو طبيب (يمكننا لاحقاً التحقق من وجود علاقة)
    if (req.user.id !== patientId && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    let profile = await MedicalProfile.findOne({ patient: patientId });
    if (!profile) {
      // إنشاء ملف فارغ إذا لم يوجد
      profile = await MedicalProfile.create({ patient: patientId });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث الملف الطبي (للطبيب أو المريض? يفضل الطبيب فقط)
// @route   PUT /api/medical/profile/:patientId
// @access  Private (doctor only)
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

// ========== Vital Signs (قياسات دورية) ==========
// @desc    إضافة قياس جديد
// @route   POST /api/medical/vitals
// @access  Private (doctor only)
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

// @desc    جلب قياسات مريض (مع صلاحية: المريض نفسه أو طبيبه)
// @route   GET /api/medical/vitals/:patientId
// @access  Private (patient or doctor)
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

// @desc    تحديث قياس معين (للطبيب)
// @route   PUT /api/medical/vitals/:id
// @access  Private (doctor only)
exports.updateVitalSign = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can update vital signs' });
    }
    const vital = await VitalSign.findById(req.params.id);
    if (!vital) return res.status(404).json({ message: 'Not found' });
    // السماح بتحديث الحقول
    const updates = req.body;
    Object.assign(vital, updates);
    await vital.save();
    res.json(vital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};