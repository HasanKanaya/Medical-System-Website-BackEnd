const User = require('../models/User');
const Appointment = require('../models/Appointment');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('assignedDoctor', 'fullName email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

const getDoctorsList = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('_id fullName email doctorDetails.specialization');

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