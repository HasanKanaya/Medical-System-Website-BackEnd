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

    // داخل دالة updateProfile، في قسم doctorDetails
if (user.role === 'doctor' && req.body.doctorDetails) {
  const { qualifications, licenseNumber, specialization, yearsOfExperience, documents } = req.body.doctorDetails;
  if (qualifications) user.doctorDetails.qualifications = qualifications;
  if (licenseNumber) user.doctorDetails.licenseNumber = licenseNumber;
  if (specialization) user.doctorDetails.specialization = specialization;
  if (yearsOfExperience) user.doctorDetails.yearsOfExperience = yearsOfExperience;
  if (documents) user.doctorDetails.documents = documents; // ✅ إضافة هذا السطر
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

// ========== دالة لتطبيع النص العربي (إزالة الهمزات والتشكيل) ==========
const normalizeArabic = (text) => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u064B-\u065F]/g, '') // إزالة التشكيل
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .toLowerCase();
};
// @desc    البحث المتقدم عن الأطباء (مع ترتيب النتائج حسب المطابقة)
// @route   GET /api/users/doctors/search
// @access  Private
const searchDoctors = async (req, res) => {
  try {
    const { keyword, specialty, city, minRating, gender, insurance } = req.query;

    // 1. الفلتر الأساسي
    let filter = {
      role: 'doctor',
      isActive: true,
      'doctorDetails.isVerified': true,
    };

    // 2. فلترة التخصص (تبحث في qualifications + specialization)
    if (specialty) {
      // إزالة "طبيب" أو "دكتور" من البداية
      let specialtyName = specialty.replace(/^(طبيب|دكتور)\s*/i, '').trim();
      if (specialtyName) {
        // تقسيم النص إلى كلمات مفيدة (باستثناء "و" وحروف الجر)
        const words = specialtyName.split(/[\sو]+/).filter(w => w.length > 1);
        if (words.length === 1) {
          // كلمة واحدة: نبحث عنها في كلا الحقلين
          const pattern = words[0]
            .replace(/أ/g, '[أا]')
            .replace(/إ/g, '[إا]')
            .replace(/آ/g, '[آا]')
            .replace(/ة/g, '[هة]')
            .replace(/ؤ/g, '[ؤو]')
            .replace(/ئ/g, '[ئي]');
          filter['$or'] = [
            { 'doctorDetails.qualifications': { $regex: pattern, $options: 'i' } },
            { 'doctorDetails.specialization': { $regex: pattern, $options: 'i' } }
          ];
        } else {
          // كلمات متعددة: نبحث عن أي كلمة في أي من الحقلين (OR)
          const wordConditions = words.map(word => {
            const pattern = word
              .replace(/أ/g, '[أا]')
              .replace(/إ/g, '[إا]')
              .replace(/آ/g, '[آا]')
              .replace(/ة/g, '[هة]')
              .replace(/ؤ/g, '[ؤو]')
              .replace(/ئ/g, '[ئي]');
            return {
              $or: [
                { 'doctorDetails.qualifications': { $regex: pattern, $options: 'i' } },
                { 'doctorDetails.specialization': { $regex: pattern, $options: 'i' } }
              ]
            };
          });
          // نريد أن يطابق أي شرط من هذه الشروط
          filter['$or'] = wordConditions;
        }
      }
    }

    // 3. الفلاتر الأخرى
    if (city) {
      filter['address'] = { $regex: city, $options: 'i' };
    }
    if (gender) {
      filter['gender'] = gender;
    }
    if (insurance) {
      filter['doctorDetails.insuranceAccepted'] = { $regex: insurance, $options: 'i' };
    }

    // 4. البحث الحر (keyword)
    let doctors = [];
    if (keyword) {
      const words = keyword.split(/\s+/).filter(w => w.length > 1);
      // بناء شروط OR للبحث في الاسم، التخصص، والمؤهلات
      const orConditions = words.map(word => ({
        $or: [
          { fullName: { $regex: word, $options: 'i' } },
          { 'doctorDetails.specialization': { $regex: word, $options: 'i' } },
          { 'doctorDetails.qualifications': { $regex: word, $options: 'i' } }
        ]
      }));
      // دمج مع الفلتر الحالي (AND)
      const finalFilter = { $and: [filter, { $or: orConditions }] };

      doctors = await User.find(finalFilter)
        .select('fullName email phone address gender doctorDetails profileImage');

      // حساب درجة المطابقة (عدد الكلمات التي ظهرت في أي من الحقول)
      doctors = doctors.map(doc => {
        const searchText = (
          (doc.fullName || '') + ' ' +
          (doc.doctorDetails?.specialization || '') + ' ' +
          (doc.doctorDetails?.qualifications || '')
        ).toLowerCase();
        let matchCount = 0;
        words.forEach(word => {
          if (searchText.includes(word.toLowerCase())) {
            matchCount++;
          }
        });
        return { ...doc._doc, matchCount };
      });
      // ترتيب تنازلي حسب المطابقة
      doctors.sort((a, b) => b.matchCount - a.matchCount);

    } else {
      // بدون keyword، نطبق الفلاتر فقط
      doctors = await User.find(filter)
        .select('fullName email phone address gender doctorDetails profileImage');
    }

    // 5. فلترة حسب التقييم (إذا وجد)
    if (minRating) {
      doctors = doctors.filter(doc => (doc.doctorDetails?.averageRating || 0) >= parseFloat(minRating));
    }

    // بعد جلب الأطباء وقبل الإرسال
if (req.query.sortBy === 'recommendations') {
  doctors.sort((a, b) => 
    (b.doctorDetails?.recommendationCount || 0) - (a.doctorDetails?.recommendationCount || 0)
  );
}
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    رفع السيرة الذاتية (CV) للطبيب (استبدال الملف القديم)
// @route   POST /api/users/doctor/upload-cv
// @access  Private (doctor only)
const uploadCV = async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can upload a CV.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const doctor = await User.findById(req.user.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const fileUrl = `/uploads/cvs/${req.file.filename}`;

    // 🔥 استبدال الملف القديم بملف جديد
    doctor.doctorDetails.documents = [fileUrl];

    await doctor.save();

    res.status(201).json({
      message: 'CV uploaded successfully.',
      documentUrl: fileUrl,
      documents: doctor.doctorDetails.documents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getDoctors, getDoctorById, searchDoctors, uploadCV };