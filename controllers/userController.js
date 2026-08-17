const User = require('../models/User');

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

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { fullName, email, phone, address, gender } = req.body;

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    
    if (phone !== undefined) {
      user.phone = phone || null;
    }
    
    if (address !== undefined) {
      user.address = address || null;
    }
    
    if (gender) user.gender = gender;

    if (user.role === 'doctor' && req.body.doctorDetails) {
      const { qualifications, licenseNumber, specialization, yearsOfExperience, documents } = req.body.doctorDetails;
      if (qualifications) user.doctorDetails.qualifications = qualifications;
      if (licenseNumber) user.doctorDetails.licenseNumber = licenseNumber;
      if (specialization) user.doctorDetails.specialization = specialization;
      if (yearsOfExperience) user.doctorDetails.yearsOfExperience = yearsOfExperience;
      if (documents) user.doctorDetails.documents = documents;
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

const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true })
      .select('fullName email phone doctorDetails address gender');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const Availability = require('../models/Availability');
    const availability = await Availability.findOne({ doctor: doctor._id });
    res.json({ doctor, availability });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const searchDoctors = async (req, res) => {
//   try {
//     const { keyword, specialty, city, minRating, gender } = req.query;

//     let filter = {
//       role: 'doctor',
//       isActive: true,
//       'doctorDetails.isVerified': true,
//     };

//     // 2. فلترة التخصص (تبحث في qualifications + specialization)
//     if (specialty) {
//       let specialtyName = specialty.replace(/^(طبيب|دكتور)\s*/i, '').trim();
//       if (specialtyName) {
//         const words = specialtyName.split(/[\sو]+/).filter(w => w.length > 1);
//         if (words.length === 1) {
//           const pattern = words[0]
//             .replace(/أ/g, '[أا]')
//             .replace(/إ/g, '[إا]')
//             .replace(/آ/g, '[آا]')
//             .replace(/ة/g, '[هة]')
//             .replace(/ؤ/g, '[ؤو]')
//             .replace(/ئ/g, '[ئي]');
//           filter['$or'] = [
//             { 'doctorDetails.qualifications': { $regex: pattern, $options: 'i' } },
//             { 'doctorDetails.specialization': { $regex: pattern, $options: 'i' } }
//           ];
//         } else {
//           const wordConditions = words.map(word => {
//             const pattern = word
//               .replace(/أ/g, '[أا]')
//               .replace(/إ/g, '[إا]')
//               .replace(/آ/g, '[آا]')
//               .replace(/ة/g, '[هة]')
//               .replace(/ؤ/g, '[ؤو]')
//               .replace(/ئ/g, '[ئي]');
//             return {
//               $or: [
//                 { 'doctorDetails.qualifications': { $regex: pattern, $options: 'i' } },
//                 { 'doctorDetails.specialization': { $regex: pattern, $options: 'i' } }
//               ]
//             };
//           });
//           filter['$or'] = wordConditions;
//         }
//       }
//     }

//     // 3. الفلاتر الأخرى
//     if (city) {
//       filter['address'] = { $regex: city, $options: 'i' };
//     }
//     if (gender) {
//       filter['gender'] = gender;
//     }

//     // 4. البحث الحر (keyword)
//     let doctors = [];
//     if (keyword) {
//       const words = keyword.split(/\s+/).filter(w => w.length > 1);
//       const orConditions = words.map(word => ({
//         $or: [
//           { fullName: { $regex: word, $options: 'i' } },
//           { 'doctorDetails.specialization': { $regex: word, $options: 'i' } },
//           { 'doctorDetails.qualifications': { $regex: word, $options: 'i' } }
//         ]
//       }));
//       const finalFilter = { $and: [filter, { $or: orConditions }] };

//       doctors = await User.find(finalFilter)
//         .select('fullName email phone address gender doctorDetails profileImage');

//       doctors = doctors.map(doc => {
//         const searchText = (
//           (doc.fullName || '') + ' ' +
//           (doc.doctorDetails?.specialization || '') + ' ' +
//           (doc.doctorDetails?.qualifications || '')
//         ).toLowerCase();
//         let matchCount = 0;
//         words.forEach(word => {
//           if (searchText.includes(word.toLowerCase())) {
//             matchCount++;
//           }
//         });
//         return { ...doc._doc, matchCount };
//       });
//       doctors.sort((a, b) => b.matchCount - a.matchCount);
//     } else {
//       doctors = await User.find(filter)
//         .select('fullName email phone address gender doctorDetails profileImage');
//     }

//     if (minRating) {
//       doctors = doctors.filter(doc => (doc.doctorDetails?.averageRating || 0) >= parseFloat(minRating));
//     }

//     if (req.query.sortBy === 'recommendations') {
//       doctors.sort((a, b) => 
//         (b.doctorDetails?.recommendationCount || 0) - (a.doctorDetails?.recommendationCount || 0)
//       );
//     }

//     res.json(doctors);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };


// ===== دالة لاستخراج الجذر (إزالة اللواحق الشائعة) =====

const getStem = (word) => {
  if (!word) return word;
  const suffixes = ['ات', 'ون', 'ين', 'ي', 'تك', 'ته', 'تي', 'نا', 'كم', 'هم', 'كن', 'ها', 'يي'];
  let stem = word;
  for (let suffix of suffixes) {
    if (stem.endsWith(suffix)) {
      stem = stem.slice(0, -suffix.length);
      break;
    }
  }
  return stem;
};

const getSimilarChars = (word) => {
  
  const charMap = {
    'س': ['س', 'ش'],      
    'ش': ['ش', 'س'],      
    'ت': ['ت', 'ط'],      
    'ط': ['ط', 'ت'],      
    'د': ['د', 'ض'],      
    'ض': ['ض', 'د'],      
    'ع': ['ع', 'غ'],      
    'غ': ['غ', 'ع'],      
    'ب': ['ب', 'ي'],      
    'ي': ['ي', 'ب'],      
    'ذ': ['ذ', 'ز'],      
    'ز': ['ز', 'ذ'],      
    'ة': ['ة', 'ه'],      
    'ه': ['ه', 'ة'],      
    'أ': ['أ', 'ا', 'إ', 'آ'],
    'ا': ['ا', 'أ', 'إ', 'آ'],
    'إ': ['إ', 'ا', 'أ', 'آ'],
    'آ': ['آ', 'ا', 'أ', 'إ'],
  };

  let result = [word];
  // توليد جميع البدائل الممكنة بتغيير حرف واحد
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (charMap[char]) {
      const newWords = [];
      for (let base of result) {
        for (let replacement of charMap[char]) {
          const newWord = base.slice(0, i) + replacement + base.slice(i + 1);
          if (!result.includes(newWord) && !newWords.includes(newWord)) {
            newWords.push(newWord);
          }
        }
      }
      result = [...result, ...newWords];
    }
  }
  return result;
};

// ===== دالة لحساب المسافة الإملائية (Levenshtein Distance) =====
const levenshteinDistance = (a, b) => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i-1] + 1,
        matrix[j-1][i] + 1,
        matrix[j-1][i-1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
};

const getFuzzyMatches = (word, maxDistance = 1) => {
  // لكننا سنستخدم البدائل المتولدة من Character Mapping
  return getSimilarChars(word);
};

const searchDoctors = async (req, res) => {
  try {
    const { keyword, specialty, city, minRating, gender } = req.query;

    let filter = {
      role: 'doctor',
      isActive: true,
      'doctorDetails.isVerified': true,
    };

    // فلترة التخصص (كما هي)
    if (specialty) {
      let specialtyName = specialty.replace(/^(طبيب|دكتور)\s*/i, '').trim();
      if (specialtyName) {
        const words = specialtyName.split(/[\sو]+/).filter(w => w.length > 1);
        if (words.length === 1) {
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
          filter['$or'] = wordConditions;
        }
      }
    }

    // الفلاتر الأخرى
    if (city) {
      filter['address'] = { $regex: city, $options: 'i' };
    }
    if (gender) {
      filter['gender'] = gender;
    }

    // ✅ البحث الحر المُحسَّن (مع معالجة الأخطاء الإملائية)
    let doctors = [];
    if (keyword) {
      const originalWords = keyword.split(/\s+/).filter(w => w.length > 1);
      const expandedWords = [];

      // توليد الكلمات البديلة لكل كلمة
      for (let word of originalWords) {
        const similar = getSimilarChars(word); // استبدال الحروف المتشابهة
        // نضيف الكلمة الأصلية وجميع البدائل
        expandedWords.push(word, ...similar);
        // نضيف أيضاً الجذور (بإزالة اللواحق)
        const stem = getStem(word);
        if (stem && stem !== word) expandedWords.push(stem);
      }

      // إزالة التكرار
      const uniqueExpanded = [...new Set(expandedWords)];

      // بناء شروط البحث باستخدام OR على الكلمات المولدة
      const orConditions = uniqueExpanded.map(word => ({
        $or: [
          { fullName: { $regex: word, $options: 'i' } },
          { 'doctorDetails.specialization': { $regex: word, $options: 'i' } },
          { 'doctorDetails.qualifications': { $regex: word, $options: 'i' } }
        ]
      }));

      const finalFilter = { $and: [filter, { $or: orConditions }] };

      // جلب النتائج الأولى
      doctors = await User.find(finalFilter)
        .select('fullName email phone address gender doctorDetails profileImage');

      // حساب درجة المطابقة (باستخدام المسافة الإملائية)
      doctors = doctors.map(doc => {
        const searchText = (
          (doc.fullName || '') + ' ' +
          (doc.doctorDetails?.specialization || '') + ' ' +
          (doc.doctorDetails?.qualifications || '')
        ).toLowerCase();
        let matchCount = 0;
        let totalDistance = 0;
        originalWords.forEach(word => {
          // البحث عن تطابق تام أو ضمن مسافة Levenshtein
          const wordsInText = searchText.split(/\s+/);
          let found = false;
          for (let textWord of wordsInText) {
            if (textWord.includes(word)) {
              matchCount++;
              found = true;
              break;
            }
            // تحقق من المسافة الإملائية (إذا كانت قريبة جداً)
            const distance = levenshteinDistance(word, textWord);
            if (distance <= 1) {
              matchCount += 0.5;
              totalDistance += distance;
              found = true;
              break;
            }
          }
          if (!found) {
            // حاول البحث في الجذر
            const stem = getStem(word);
            if (stem) {
              for (let textWord of wordsInText) {
                if (textWord.includes(stem)) {
                  matchCount += 0.3;
                  break;
                }
              }
            }
          }
        });
        return { ...doc._doc, matchCount };
      });

      // ترتيب تنازلي حسب درجة المطابقة
      doctors.sort((a, b) => b.matchCount - a.matchCount);

    } else {
      // بدون keyword، نطبق الفلاتر فقط
      doctors = await User.find(filter)
        .select('fullName email phone address gender doctorDetails profileImage');
    }

    if (minRating) {
      doctors = doctors.filter(doc => (doc.doctorDetails?.averageRating || 0) >= parseFloat(minRating));
    }

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