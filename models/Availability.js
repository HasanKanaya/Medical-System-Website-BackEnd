const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // طبيب واحد لديه إعداد توافر واحد
    },
    // الأيام المختارة (0 = الأحد، 6 = السبت حسب getDay())
    workingDays: {
      type: [Number], // مثال: [1,2,3,4,5] من الاثنين إلى الجمعة
      default: [1,2,3,4,5],
    },
    startTime: {
      type: String, // تنسيق "09:00"
      default: '09:00',
    },
    endTime: {
      type: String,
      default: '17:00',
    },
    breakStart: {
      type: String,
      default: '13:00',
    },
    breakEnd: {
      type: String,
      default: '14:00',
    },
    slotDuration: {
      type: Number, // مدة الحجز بالدقائق
      default: 30,
    },
    maxPatientsPerDay: {
      type: Number,
      default: 15,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;