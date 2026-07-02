const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordDate: {
    type: Date,
    default: Date.now,
  },
  // المعلومات الثابتة (يمكن تخزينها كمفاتيح منفصلة)
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    default: null,
  },
  allergies: {
    type: String,
    default: '',
  },
  chronicDiseases: {
    type: String,
    default: '',
  },
  pastSurgeries: {
    type: String,
    default: '',
  },
  regularMedications: {
    type: String,
    default: '',
  },
  // القياسات المتغيرة (يمكن إضافة إدخالات متعددة عبر وقت)
  // لكن سنستخدم نموذجاً مبسطاً: نستخدم الحقول التالية كأحدث القياسات.
  // للمحافظة على التاريخ، سنضيف سجلاً لكل قياس. لكن الأسهل هو أن يكون لكل مريض مستند MedicalRecord واحد يتم تحديثه.
  // ومع ذلك، لرسم التطور، سنحتاج إلى سلسلة زمنية. لذا الأفضل أن يكون القياس كوثيقة منفصلة (Measurement).
  // لتجنب التعقيد، سنفصل: MedicalRecord (بيانات ثابتة) + Measurement (قياسات دورية).
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);