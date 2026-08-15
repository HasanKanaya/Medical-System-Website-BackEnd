const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    جلب جميع المستخدمين (للمسؤول)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    // ✅ إضافة populate لجلب بيانات الطبيب المعين
    const users = await User.find({})
      .select('-password')
      .populate('assignedDoctor', 'fullName email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث حالة المستخدم (تعليق/تفعيل)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = isActive;
    await user.save();
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    الموافقة على طبيب (تعيين isVerified = true)
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private/Admin
const verifyDoctor = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    user.doctorDetails.isVerified = true;
    await user.save();
    res.json({ message: 'Doctor verified successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب إحصائيات النظام (عدد المستخدمين، المواعيد، إلخ)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAssistants = await User.countDocuments({ role: 'assistant' });
    const pendingDoctors = await User.countDocuments({ role: 'doctor', 'doctorDetails.isVerified': false });
    const totalAppointments = await Appointment.countDocuments();
    const upcomingAppointments = await Appointment.countDocuments({ date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } });

    res.json({
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAssistants,
      pendingDoctors,
      totalAppointments,
      upcomingAppointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ @desc    جلب قائمة الأطباء مع التخصص
// @route   GET /api/admin/doctors-list
// @access  Private/Admin
const getDoctorsList = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('_id fullName email doctorDetails.specialization');

    // تنسيق البيانات لإظهار التخصص
    const formatted = doctors.map(doc => ({
      _id: doc._id,
      fullName: doc.fullName,
      email: doc.email,
      specialization: doc.doctorDetails?.specialization || 'General'
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تعيين مساعد لطبيب
// @route   PUT /api/admin/assign-assistant/:assistantId
// @access  Private/Admin
const assignAssistantToDoctor = async (req, res) => {
  try {
    const { assistantId } = req.params;
    const { doctorId } = req.body;
    const assistant = await User.findById(assistantId);
    if (!assistant || assistant.role !== 'assistant') {
      return res.status(404).json({ message: 'Assistant not found' });
    }
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    assistant.assignedDoctor = doctorId;
    await assistant.save();
    res.json({ message: 'Assistant assigned successfully', assistant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  verifyDoctor,
  getStats,
  getDoctorsList,
  assignAssistantToDoctor,
};