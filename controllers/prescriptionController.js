const Prescription = require('../models/Prescription');

// @desc    جلب جميع الوصفات الخاصة بالمريض الحالي
// @route   GET /api/prescriptions/me
// @access  Private
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate('doctor', 'fullName specialization')
      .sort({ date: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ التصحيح: إضافة exports.
// @desc    جلب وصفة معينة (للمريض أو الطبيب)
// @route   GET /api/prescriptions/:id
// @access  Private
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'fullName email')
      .populate('doctor', 'fullName specialization');
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    // التحقق من الصلاحية: المريض نفسه أو الطبيب المعالج
    if (prescription.patient._id.toString() !== req.user.id && prescription.doctor._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب وصفات مريض معين (للطبيب)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate('doctor', 'fullName specialization')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};