const User = require('../models/User');

// @desc    جلب بيانات المستخدم الحالي
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    تحديث بيانات المستخدم الحالي
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, email, phone, address, gender } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;

    // إذا كان المستخدم طبيباً، نسمح بتحديث doctorDetails
    if (user.role === 'doctor' && req.body.doctorDetails) {
      const { qualifications, licenseNumber, specialization, yearsOfExperience } = req.body.doctorDetails;
      if (qualifications) user.doctorDetails.qualifications = qualifications;
      if (licenseNumber) user.doctorDetails.licenseNumber = licenseNumber;
      if (specialization) user.doctorDetails.specialization = specialization;
      if (yearsOfExperience) user.doctorDetails.yearsOfExperience = yearsOfExperience;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      gender: updatedUser.gender || null,
      role: updatedUser.role,
      doctorDetails: updatedUser.doctorDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب جميع الأطباء (للمرضى)
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('fullName email phone doctorDetails address gender');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب بيانات طبيب معين مع تفاصيل التوافر
// @route   GET /api/users/doctors/:id
// @access  Private (patient, doctor, admin)
const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    // جلب إعدادات التوافر للطبيب
    const Availability = require('../models/Availability');
    const availability = await Availability.findOne({ doctor: doctor._id });
    res.json({ doctor, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors, getDoctorById };