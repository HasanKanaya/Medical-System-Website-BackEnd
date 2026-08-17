const mongoose = require('mongoose');
const User = require('./models/User');
const Availability = require('./models/Availability');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const VitalSign = require('./models/VitalSign');
const MedicalProfile = require('./models/MedicalProfile');
const Recommendation = require('./models/Recommendation');
require('dotenv').config();

// ============================================================
// 1️⃣ ADMIN (2)
// ============================================================
const admins = [
  {
    fullName: 'AdminOne',
    email: 'admin1@mediserve.com',
    phone: '0910000001',
    password: 'Admin@123',
    role: 'admin',
    address: 'دمشق',
    gender: 'male',
  },
  {
    fullName: 'AdminTwo',
    email: 'admin2@mediserve.com',
    phone: '0910000002',
    password: 'Admin@123',
    role: 'admin',
    address: 'حلب',
    gender: 'female',
  },
];

// ============================================================
// 2️⃣ أطباء الأسنان (5)
// ============================================================
const dentists = [
  {
    fullName: 'د. أحمد النجار',
    email: 'dr.ahmed.nejjar@clinic.com',
    phone: '0911000001',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أسنان',
      licenseNumber: 'LIC-DENT-001',
      specialization: 'معالجة التسوس\nتركيب حشوات\nخلع اسنان\nتنظيف\nتبييض الأسنان',
      yearsOfExperience: 10,
      isVerified: true,
    },
  },
  {
    fullName: 'د. سمر خالد',
    email: 'dr.samar.khaled@clinic.com',
    phone: '0911000002',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أسنان',
      licenseNumber: 'LIC-DENT-002',
      specialization: 'معالجة التسوس\nتركيب حشوات\nخلع اسنان\nتركيب جسور\nزراعة اسنان\nتقويم',
      yearsOfExperience: 8,
      isVerified: true,
    },
  },
  {
    fullName: 'د. وائل محمود',
    email: 'dr.wael.mahmoud@clinic.com',
    phone: '0911000003',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أسنان',
      licenseNumber: 'LIC-DENT-003',
      specialization: 'معالجة التسوس\nتركيب حشوات\nخلع اسنان\nتركيب جسور\nزراعة اسنان\nتقويم\nتبييض',
      yearsOfExperience: 12,
      isVerified: true,
    },
  },
  {
    fullName: 'د. نورا الحسن',
    email: 'dr.nora.alhassan@clinic.com',
    phone: '0911000004',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حمص',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أسنان',
      licenseNumber: 'LIC-DENT-004',
      specialization: 'معالجة التسوس\nتركيب حشوات\nتنظيف\nتبييض\nمعالجة اللثة\nخلع اسنان',
      yearsOfExperience: 6,
      isVerified: true,
    },
  },
  {
    fullName: 'د. بسام طاهر',
    email: 'dr.bassam.taher@clinic.com',
    phone: '0911000005',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'طرطوس',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أسنان',
      licenseNumber: 'LIC-DENT-005',
      specialization: 'خلع اسنان\nتركيب جسور\nزراعة اسنان\nتقويم\nمعالجة تسوس\nحشوات تجميلية',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
];

// ============================================================
// 3️⃣ أطباء القلبية (4)
// ============================================================
const cardiologists = [
  {
    fullName: 'د. رنا مصطفى',
    email: 'dr.ranna.mustafa@clinic.com',
    phone: '0911000011',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب قلبية',
      licenseNumber: 'LIC-CARD-001',
      specialization: 'قسطرة قلبية\nتخطيط قلب\nعلاج ضغط الدم\nكوليسترول\nفحوصات دورية للقلب',
      yearsOfExperience: 12,
      isVerified: true,
    },
  },
  {
    fullName: 'د. خالد العلي',
    email: 'dr.khaled.ali@clinic.com',
    phone: '0911000012',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب قلبية',
      licenseNumber: 'LIC-CARD-002',
      specialization: 'قسطرة قلبية\nتخطيط قلب\nعلاج ضغط الدم\nكوليسترول\nفحوصات دورية للقلب\nعلاج الجلطات',
      yearsOfExperience: 15,
      isVerified: true,
    },
  },
  {
    fullName: 'د. منى شعبان',
    email: 'dr.mona.shaaban@clinic.com',
    phone: '0911000013',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب قلبية',
      licenseNumber: 'LIC-CARD-003',
      specialization: 'تخطيط قلب\nعلاج ضغط الدم\nفحوصات دورية للقلب\nعلاج الجلطات\nقسطرة قلبية',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
  {
    fullName: 'د. وسام جميل',
    email: 'dr.wissam.jameel@clinic.com',
    phone: '0911000014',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حمص',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب قلبية',
      licenseNumber: 'LIC-CARD-004',
      specialization: 'علاج ضغط الدم\nكوليسترول\nفحوصات دورية للقلب\nتخطيط قلب\nقسطرة قلبية',
      yearsOfExperience: 7,
      isVerified: true,
    },
  },
];

// ============================================================
// 4️⃣ أطباء العظام (3)
// ============================================================
const orthopedics = [
  {
    fullName: 'د. حسام زين',
    email: 'dr.hossam.zein@clinic.com',
    phone: '0911000021',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب عظام',
      licenseNumber: 'LIC-ORTH-001',
      specialization: 'عمليات المفاصل\nعلاج الكسور\nعلاج الروماتيزم\nآلام الظهر\nخشونة الركبة',
      yearsOfExperience: 10,
      isVerified: true,
    },
  },
  {
    fullName: 'د. فاطمة عيسى',
    email: 'dr.fatima.issa@clinic.com',
    phone: '0911000022',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب عظام',
      licenseNumber: 'LIC-ORTH-002',
      specialization: 'عمليات المفاصل\nعلاج الكسور\nآلام الظهر\nخشونة الركبة\nالعلاج الطبيعي\nالروماتيزم',
      yearsOfExperience: 8,
      isVerified: true,
    },
  },
  {
    fullName: 'د. جمال صالح',
    email: 'dr.jamal.saleh@clinic.com',
    phone: '0911000023',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب عظام',
      licenseNumber: 'LIC-ORTH-003',
      specialization: 'علاج الكسور\nآلام الظهر\nخشونة الركبة\nعمليات المفاصل\nالروماتيزم',
      yearsOfExperience: 6,
      isVerified: true,
    },
  },
];

// ============================================================
// 5️⃣ أطباء الأطفال (4)
// ============================================================
const pediatricians = [
  {
    fullName: 'د. سوزان عارف',
    email: 'dr.suzan.aref@clinic.com',
    phone: '0911000031',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أطفال',
      licenseNumber: 'LIC-PED-001',
      specialization: 'فحوصات دورية\nلقاحات\nعلاج التهابات الأذن\nنمو وتطور الأطفال\nالحساسية',
      yearsOfExperience: 6,
      isVerified: true,
    },
  },
  {
    fullName: 'د. نضال رشيد',
    email: 'dr.nidal.rasheed@clinic.com',
    phone: '0911000032',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أطفال',
      licenseNumber: 'LIC-PED-002',
      specialization: 'فحوصات دورية\nلقاحات\nعلاج التهابات الأذن\nنمو وتطور الأطفال\nالحساسية\nتغذية الأطفال',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
  {
    fullName: 'د. ليلى عبدو',
    email: 'dr.layla.abdo@clinic.com',
    phone: '0911000033',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حمص',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أطفال',
      licenseNumber: 'LIC-PED-003',
      specialization: 'لقاحات\nعلاج التهابات الأذن\nنمو وتطور الأطفال\nالحساسية\nفحوصات دورية\nتغذية الأطفال',
      yearsOfExperience: 5,
      isVerified: true,
    },
  },
  {
    fullName: 'د. عماد سليمان',
    email: 'dr.emad.sulaiman@clinic.com',
    phone: '0911000034',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'طرطوس',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أطفال',
      licenseNumber: 'LIC-PED-004',
      specialization: 'فحوصات دورية\nلقاحات\nعلاج التهابات الأذن\nنمو وتطور الأطفال\nالحساسية\nعلاج الربو عند الأطفال',
      yearsOfExperience: 7,
      isVerified: true,
    },
  },
];

// ============================================================
// 6️⃣ أطباء الجلدية (3)
// ============================================================
const dermatologists = [
  {
    fullName: 'د. مروان سليم',
    email: 'dr.marwan.salem@clinic.com',
    phone: '0911000041',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب جلدية',
      licenseNumber: 'LIC-DERM-001',
      specialization: 'علاج حب الشباب\nإزالة الشامات\nعلاج الأكزيما\nالصدفية\nالليزر التجميلي',
      yearsOfExperience: 7,
      isVerified: true,
    },
  },
  {
    fullName: 'د. هدى خليل',
    email: 'dr.huda.khalil@clinic.com',
    phone: '0911000042',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب جلدية',
      licenseNumber: 'LIC-DERM-002',
      specialization: 'علاج حب الشباب\nإزالة الشامات\nعلاج الأكزيما\nالصدفية\nالليزر التجميلي\nعلاج تساقط الشعر',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
  {
    fullName: 'د. رياض عثمان',
    email: 'dr.riad.othman@clinic.com',
    phone: '0911000043',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب جلدية',
      licenseNumber: 'LIC-DERM-003',
      specialization: 'علاج حب الشباب\nإزالة الشامات\nعلاج الأكزيما\nالصدفية\nالليزر التجميلي\nعلاج تساقط الشعر',
      yearsOfExperience: 8,
      isVerified: true,
    },
  },
];

// ============================================================
// 7️⃣ أطباء العيون (3)
// ============================================================
const ophthalmologists = [
  {
    fullName: 'د. رامي يونس',
    email: 'dr.rami.younes@clinic.com',
    phone: '0911000051',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب عيون',
      licenseNumber: 'LIC-OPH-001',
      specialization: 'فحص النظر\nوصف نظارات\nعلاج التهابات العين\nعلاج جفاف العين\nعمليات المياه البيضاء',
      yearsOfExperience: 11,
      isVerified: true,
    },
  },
  {
    fullName: 'د. غادة طالب',
    email: 'dr.ghada.taleb@clinic.com',
    phone: '0911000052',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب عيون',
      licenseNumber: 'LIC-OPH-002',
      specialization: 'فحص النظر\nوصف نظارات\nعلاج التهابات العين\nعلاج جفاف العين\nعمليات المياه البيضاء\nالليزك',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
  {
    fullName: 'د. سمير فرح',
    email: 'dr.samir.farha@clinic.com',
    phone: '0911000053',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب عيون',
      licenseNumber: 'LIC-OPH-003',
      specialization: 'فحص النظر\nوصف نظارات\nعلاج التهابات العين\nعمليات المياه البيضاء\nالليزك',
      yearsOfExperience: 7,
      isVerified: true,
    },
  },
];

// ============================================================
// 8️⃣ أطباء الأنف والأذن والحنجرة (3)
// ============================================================
const ents = [
  {
    fullName: 'د. باسل ديب',
    email: 'dr.basel.deeb@clinic.com',
    phone: '0911000061',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أنف وأذن وحنجرة',
      licenseNumber: 'LIC-ENT-001',
      specialization: 'علاج التهابات الأذن\nالتهابات الجيوب الأنفية\nاللوزتين\nعمليات الأنف\nعمليات الأذن',
      yearsOfExperience: 13,
      isVerified: true,
    },
  },
  {
    fullName: 'د. نهاد سامي',
    email: 'dr.nihad.sami@clinic.com',
    phone: '0911000062',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أنف وأذن وحنجرة',
      licenseNumber: 'LIC-ENT-002',
      specialization: 'علاج التهابات الأذن\nالتهابات الجيوب الأنفية\nاللوزتين\nعمليات الأنف\nعمليات الأذن\nعلاج الدوار',
      yearsOfExperience: 10,
      isVerified: true,
    },
  },
  {
    fullName: 'د. هيام رشيد',
    email: 'dr.hiyam.rasheed@clinic.com',
    phone: '0911000063',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حمص',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أنف وأذن وحنجرة',
      licenseNumber: 'LIC-ENT-003',
      specialization: 'علاج التهابات الأذن\nالتهابات الجيوب الأنفية\nعمليات الأنف\nعمليات الأذن\nاللوزتين',
      yearsOfExperience: 8,
      isVerified: true,
    },
  },
];

// ============================================================
// 9️⃣ أطباء الأعصاب (3)
// ============================================================
const neurologists = [
  {
    fullName: 'د. نبيل رضوان',
    email: 'dr.nabil.radwan@clinic.com',
    phone: '0911000071',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أعصاب',
      licenseNumber: 'LIC-NEURO-001',
      specialization: 'علاج الصداع النصفي\nالصرع\nالأمراض العصبية\nالرعاش\nالتصلب المتعدد',
      yearsOfExperience: 14,
      isVerified: true,
    },
  },
  {
    fullName: 'د. أماني المصري',
    email: 'dr.amani.masri@clinic.com',
    phone: '0911000072',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب أعصاب',
      licenseNumber: 'LIC-NEURO-002',
      specialization: 'علاج الصداع النصفي\nالصرع\nالأمراض العصبية\nالرعاش\nالتصلب المتعدد\nالزهايمر',
      yearsOfExperience: 11,
      isVerified: true,
    },
  },
  {
    fullName: 'د. شادي حيدر',
    email: 'dr.shadi.haidar@clinic.com',
    phone: '0911000073',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب أعصاب',
      licenseNumber: 'LIC-NEURO-003',
      specialization: 'علاج الصداع النصفي\nالصرع\nالأمراض العصبية\nالرعاش\nالزهايمر',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
];

// ============================================================
// 🔟 أطباء الأمراض النفسية (3)
// ============================================================
const psychiatrists = [
  {
    fullName: 'د. لينا أحمد',
    email: 'dr.lina.ahmad@clinic.com',
    phone: '0911000081',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب نفسي',
      licenseNumber: 'LIC-PSY-001',
      specialization: 'علاج القلق\nالاكتئاب\nاضطرابات النوم\nالعلاج النفسي\nالاضطرابات النفسية',
      yearsOfExperience: 10,
      isVerified: true,
    },
  },
  {
    fullName: 'د. فادي صبح',
    email: 'dr.fadi.sobh@clinic.com',
    phone: '0911000082',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب نفسي',
      licenseNumber: 'LIC-PSY-002',
      specialization: 'علاج القلق\nالاكتئاب\nاضطرابات النوم\nالعلاج النفسي\nالاضطرابات النفسية\nالعلاج السلوكي',
      yearsOfExperience: 12,
      isVerified: true,
    },
  },
  {
    fullName: 'د. ريم حميد',
    email: 'dr.rim.hameed@clinic.com',
    phone: '0911000083',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'اللاذقية',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب نفسي',
      licenseNumber: 'LIC-PSY-003',
      specialization: 'علاج القلق\nالاكتئاب\nاضطرابات النوم\nالاضطرابات النفسية\nالعلاج السلوكي',
      yearsOfExperience: 8,
      isVerified: true,
    },
  },
];

// ============================================================
// 1️⃣1️⃣ أطباء الجهاز الهضمي (3)
// ============================================================
const gastroenterologists = [
  {
    fullName: 'د. ماهر خطاب',
    email: 'dr.maher.khattab@clinic.com',
    phone: '0911000091',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'دمشق',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب جهاز هضمي',
      licenseNumber: 'LIC-GASTRO-001',
      specialization: 'علاج القولون\nالقرحة\nأمراض الكبد\nالمنظار\nعسر الهضم',
      yearsOfExperience: 12,
      isVerified: true,
    },
  },
  {
    fullName: 'د. سهام نور',
    email: 'dr.siham.nour@clinic.com',
    phone: '0911000092',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حلب',
    gender: 'female',
    doctorDetails: {
      qualifications: 'طبيب جهاز هضمي',
      licenseNumber: 'LIC-GASTRO-002',
      specialization: 'علاج القولون\nالقرحة\nأمراض الكبد\nالمنظار\nعسر الهضم\nالتهاب المعدة',
      yearsOfExperience: 10,
      isVerified: true,
    },
  },
  {
    fullName: 'د. سامي عثمان',
    email: 'dr.sami.othman@clinic.com',
    phone: '0911000093',
    password: 'Doctor@123',
    role: 'doctor',
    address: 'حمص',
    gender: 'male',
    doctorDetails: {
      qualifications: 'طبيب جهاز هضمي',
      licenseNumber: 'LIC-GASTRO-003',
      specialization: 'علاج القولون\nالقرحة\nأمراض الكبد\nالمنظار\nعسر الهضم\nالتهاب المعدة',
      yearsOfExperience: 9,
      isVerified: true,
    },
  },
];

// ============================================================
// دمج جميع الأطباء
// ============================================================
const allDoctors = [
  ...dentists,
  ...cardiologists,
  ...orthopedics,
  ...pediatricians,
  ...dermatologists,
  ...ophthalmologists,
  ...ents,
  ...neurologists,
  ...psychiatrists,
  ...gastroenterologists,
];

// ============================================================
// 1️⃣2️⃣ مرضى (5)
// ============================================================
const patients = [
  {
    fullName: 'أحمد محمد علي',
    email: 'ahmed.m@example.com',
    phone: '0911111111',
    password: 'Patient@123',
    role: 'patient',
    address: 'دمشق',
    gender: 'male',
  },
  {
    fullName: 'سارة خالد حسن',
    email: 'sara.k@example.com',
    phone: '0911111112',
    password: 'Patient@123',
    role: 'patient',
    address: 'حلب',
    gender: 'female',
  },
  {
    fullName: 'محمد يوسف علي',
    email: 'mohammed.y@example.com',
    phone: '0911111113',
    password: 'Patient@123',
    role: 'patient',
    address: 'اللاذقية',
    gender: 'male',
  },
  {
    fullName: 'فاطمة حسين أحمد',
    email: 'fatima.h@example.com',
    phone: '0911111114',
    password: 'Patient@123',
    role: 'patient',
    address: 'حمص',
    gender: 'female',
  },
  {
    fullName: 'علي صالح إبراهيم',
    email: 'ali.s@example.com',
    phone: '0911111115',
    password: 'Patient@123',
    role: 'patient',
    address: 'طرطوس',
    gender: 'male',
  },
];

// ============================================================
// 1️⃣3️⃣ مساعدين (5) مرتبطين بأطباء
// ============================================================
const assistants = [
  {
    fullName: 'نورا سامي',
    email: 'assistant1@clinic.com',
    phone: '0912000001',
    password: 'Assistant@123',
    role: 'assistant',
    address: 'دمشق',
    gender: 'female',
  },
  {
    fullName: 'حسن عادل',
    email: 'assistant2@clinic.com',
    phone: '0912000002',
    password: 'Assistant@123',
    role: 'assistant',
    address: 'حلب',
    gender: 'male',
  },
  {
    fullName: 'ليلى جمال',
    email: 'assistant3@clinic.com',
    phone: '0912000003',
    password: 'Assistant@123',
    role: 'assistant',
    address: 'اللاذقية',
    gender: 'female',
  },
  {
    fullName: 'عمر محمود',
    email: 'assistant4@clinic.com',
    phone: '0912000004',
    password: 'Assistant@123',
    role: 'assistant',
    address: 'حمص',
    gender: 'male',
  },
  {
    fullName: 'ريما ناصر',
    email: 'assistant5@clinic.com',
    phone: '0912000005',
    password: 'Assistant@123',
    role: 'assistant',
    address: 'طرطوس',
    gender: 'female',
  },
];

// ============================================================
// دالة إنشاء أوقات العمل لكل طبيب
// ============================================================
const createAvailability = async (doctorId, index) => {
  const dayPatterns = [
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [1, 3, 5],
    [2, 4, 6],
  ];
  const pattern = dayPatterns[index % dayPatterns.length];
  const timeVariations = [
    { start: '09:00', end: '17:00', breakStart: '13:00', breakEnd: '14:00' },
    { start: '08:00', end: '16:00', breakStart: '12:00', breakEnd: '13:00' },
    { start: '10:00', end: '18:00', breakStart: '14:00', breakEnd: '15:00' },
    { start: '09:00', end: '18:00', breakStart: '13:00', breakEnd: '14:00' },
  ];
  const times = timeVariations[index % timeVariations.length];
  const availability = new Availability({
    doctor: doctorId,
    workingDays: pattern,
    startTime: times.start,
    endTime: times.end,
    breakStart: times.breakStart,
    breakEnd: times.breakEnd,
    slotDuration: 30,
    maxPatientsPerDay: 10 + (index % 5) * 2,
    isActive: true,
  });
  await availability.save();
  return availability;
};

// ============================================================
// دالة إنشاء مواعيد وهمية
// ============================================================
const createAppointments = async (patientsList, doctorsList) => {
  const appointments = [];
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const reasons = ['routine', 'emergency', 'follow-up'];
  const types = ['clinic', 'virtual'];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const patient = patientsList[i % patientsList.length];
    const doctor = doctorsList[i % doctorsList.length];
    const status = statuses[i % statuses.length];
    const date = new Date(now);
    date.setDate(date.getDate() + (i % 30) + 1);
    const timeSlots = ['09:00 - 09:30', '10:00 - 10:30', '11:00 - 11:30', '14:00 - 14:30', '15:00 - 15:30', '16:00 - 16:30'];
    const timeSlot = timeSlots[i % timeSlots.length];

    const appointment = new Appointment({
      patient: patient._id,
      doctor: doctor._id,
      date: date,
      dateString: date.toISOString().split('T')[0],
      timeSlot: timeSlot,
      reason: reasons[i % reasons.length],
      type: types[i % types.length],
      status: status,
      notes: `Appointment ${i+1} for ${patient.fullName} with ${doctor.fullName}`,
    });
    await appointment.save();
    appointments.push(appointment);
  }
  return appointments;
};

// ============================================================
// دالة إنشاء وصفات طبية (للمواعيد المكتملة)
// ============================================================
const createPrescriptions = async (appointmentsList, doctorsList, patientsList) => {
  const completedAppointments = appointmentsList.filter(a => a.status === 'completed');
  const prescriptions = [];

  for (let i = 0; i < completedAppointments.length && i < 15; i++) {
    const app = completedAppointments[i];
    const doctor = doctorsList.find(d => d._id.toString() === app.doctor.toString());
    const patient = patientsList.find(p => p._id.toString() === app.patient.toString());
    if (!doctor || !patient) continue;

    const meds = [
      ['Panadol', '500mg', '3 times daily', '5 days'],
      ['Amoxicillin', '250mg', '2 times daily', '7 days'],
      ['Ibuprofen', '400mg', '3 times daily', '3 days'],
      ['Omeprazole', '20mg', '1 time daily', '14 days'],
      ['Metformin', '500mg', '2 times daily', '30 days'],
    ];

    const med = meds[i % meds.length];
    const prescription = new Prescription({
      patient: patient._id,
      doctor: doctor._id,
      appointment: app._id,
      medications: [
        {
          name: med[0],
          dosage: med[1],
          frequency: med[2],
          duration: med[3],
          notes: `Take with meals`,
        },
      ],
      instructions: `Follow the prescription as directed.`,
      status: 'active',
    });
    await prescription.save();
    prescriptions.push(prescription);
  }
  return prescriptions;
};

// ============================================================
// دالة إنشاء سجلات طبية (Vital Signs) للمرضى
// ============================================================
const createVitalSigns = async (patientsList, doctorsList) => {
  const vitals = [];
  for (let i = 0; i < patientsList.length; i++) {
    const patient = patientsList[i];
    const doctor = doctorsList[i % doctorsList.length];
    for (let j = 0; j < 4; j++) {
      const date = new Date();
      date.setDate(date.getDate() - (j * 7));
      const vital = new VitalSign({
        patient: patient._id,
        doctor: doctor._id,
        recordedAt: date,
        height: 160 + Math.floor(Math.random() * 20),
        weight: 60 + Math.floor(Math.random() * 30),
        heartRate: 70 + Math.floor(Math.random() * 20),
        bloodPressureSystolic: 110 + Math.floor(Math.random() * 30),
        bloodPressureDiastolic: 70 + Math.floor(Math.random() * 20),
        bloodSugar: 90 + Math.floor(Math.random() * 40),
        temperature: 36.5 + Math.round(Math.random() * 1.0),
        notes: `Regular checkup ${j+1}`,
      });
      await vital.save();
      vitals.push(vital);
    }
  }
  return vitals;
};

// ============================================================
// دالة إنشاء Medical Profiles للمرضى
// ============================================================
const createMedicalProfiles = async (patientsList) => {
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  for (let i = 0; i < patientsList.length; i++) {
    const patient = patientsList[i];
    const profile = new MedicalProfile({
      patient: patient._id,
      bloodType: bloodTypes[i % bloodTypes.length],
      allergies: i % 2 === 0 ? 'None' : 'Penicillin, Dust',
      chronicDiseases: i % 3 === 0 ? 'Diabetes Type 2' : 'None',
      pastSurgeries: i % 4 === 0 ? 'Appendectomy (2019)' : 'None',
      regularMedications: i % 5 === 0 ? 'Metformin 500mg' : 'None',
    });
    await profile.save();
  }
};

// ============================================================
// دالة إنشاء توصيات (Recommendations) وهمية
// ============================================================
const createRecommendations = async (patientsList, doctorsList) => {
  const recommendations = [];
  for (let i = 0; i < 8; i++) {
    const patient = patientsList[i % patientsList.length];
    const doctor = doctorsList[(i * 3) % doctorsList.length];
    const rec = new Recommendation({
      patient: patient._id,
      doctor: doctor._id,
    });
    await rec.save();
    // تحديث عدد التوصيات للطبيب
    await User.findByIdAndUpdate(doctor._id, {
      $inc: { 'doctorDetails.recommendationCount': 1 },
    });
    recommendations.push(rec);
  }
  return recommendations;
};

// ============================================================
// دالة التشغيل الرئيسية
// ============================================================
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // حذف جميع البيانات السابقة
    await User.deleteMany({});
    await Availability.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await VitalSign.deleteMany({});
    await MedicalProfile.deleteMany({});
    await Recommendation.deleteMany({});
    console.log('🗑️ All existing data deleted');

    // 1. إنشاء المسؤولين
    const createdAdmins = await User.create(admins);
    console.log(`✅ ${createdAdmins.length} admins created`);

    // 2. إنشاء الأطباء
    const createdDoctors = await User.create(allDoctors);
    console.log(`✅ ${createdDoctors.length} doctors created`);

    // 3. إنشاء أوقات العمل للأطباء
    console.log('⏰ Creating availability for doctors...');
    for (let i = 0; i < createdDoctors.length; i++) {
      await createAvailability(createdDoctors[i]._id, i);
    }
    console.log(`✅ Availability created for ${createdDoctors.length} doctors`);

    // 4. إنشاء المرضى
    const createdPatients = await User.create(patients);
    console.log(`✅ ${createdPatients.length} patients created`);

    // 5. إنشاء المساعدين وربطهم بأطباء
    const createdAssistants = [];
    for (let i = 0; i < assistants.length; i++) {
      const assistantData = { ...assistants[i] };
      assistantData.assignedDoctor = createdDoctors[i % createdDoctors.length]._id;
      const assistant = await User.create(assistantData);
      createdAssistants.push(assistant);
    }
    console.log(`✅ ${createdAssistants.length} assistants created and linked to doctors`);

    // 6. إنشاء الملفات الطبية للمرضى
    await createMedicalProfiles(createdPatients);
    console.log(`✅ Medical profiles created for ${createdPatients.length} patients`);

    // 7. إنشاء السجلات الطبية (Vital Signs)
    const vitals = await createVitalSigns(createdPatients, createdDoctors);
    console.log(`✅ ${vitals.length} vital signs recorded`);

    // 8. إنشاء المواعيد
    const appointments = await createAppointments(createdPatients, createdDoctors);
    console.log(`✅ ${appointments.length} appointments created`);

    // 9. إنشاء الوصفات الطبية
    const prescriptions = await createPrescriptions(appointments, createdDoctors, createdPatients);
    console.log(`✅ ${prescriptions.length} prescriptions created`);

    // 10. إنشاء التوصيات
    const recommendations = await createRecommendations(createdPatients, createdDoctors);
    console.log(`✅ ${recommendations.length} recommendations created`);

    // ============================================================
    // عرض إحصائية نهائية
    // ============================================================
    console.log('\n📊 Final Summary:');
    console.log(`   - Admins: ${createdAdmins.length}`);
    console.log(`   - Doctors: ${createdDoctors.length}`);
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Assistants: ${createdAssistants.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    console.log(`   - Prescriptions: ${prescriptions.length}`);
    console.log(`   - Vital Signs: ${vitals.length}`);
    console.log(`   - Recommendations: ${recommendations.length}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   🔹 Admins: admin1@mediserve.com / Admin@123');
    console.log('   🔹 Doctors: dr.ahmed.nejjar@clinic.com / Doctor@123');
    console.log('   🔹 Patients: ahmed.m@example.com / Patient@123');
    console.log('   🔹 Assistants: assistant1@clinic.com / Assistant@123');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();