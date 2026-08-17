const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, doctorDetails, gender } = req.body;

    // التحقق من البريد المكرر
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل' });
    }

    // بناء كائن المستخدم بشكل ديناميكي
    const userData = {
      fullName,
      email,
      password,
      role: role || 'patient',
    };

    if (phone) userData.phone = phone;
    if (gender) userData.gender = gender;
    if (role === 'doctor' && doctorDetails) {
      userData.doctorDetails = doctorDetails;
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      gender: user.gender || null,
      address: user.address || '',
      doctorDetails: user.doctorDetails,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'الحساب غير نشط، يرجى التواصل مع الإدارة' });
    }

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || null,
      role: user.role,
      gender: user.gender || null,
      address: user.address || '',
      doctorDetails: user.doctorDetails,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};