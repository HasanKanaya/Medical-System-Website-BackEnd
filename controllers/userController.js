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

    // الحقول الأساسية التي يمكن تحديثها لأي مستخدم
    const { fullName, email, phone, address } = req.body;
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address; // سنضيف حقل address لاحقاً في النموذج

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
      .select('fullName email phone doctorDetails address');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors };