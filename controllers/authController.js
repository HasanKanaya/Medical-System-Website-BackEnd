const User = require('../models/User');
const jwt = require('jsonwebtoken');

// توليد توكن JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


// تسجيل مستخدم جديد 
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, doctorDetails } = req.body;

    // التحقق من البريد المكرر
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // بناء كائن المستخدم بشكل ديناميكي
    const userData = {
      fullName,
      email,
      password,
      role: role || 'patient',
    };

    // إضافة الهاتف فقط إذا وجد
    if (phone) {
      userData.phone = phone;
    }

    // إضافة تفاصيل الطبيب إذا كان الدكتور
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
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تسجيل الدخول
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
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};