const Availability = require('../models/Availability');

// @desc    جلب إعدادات التوافر للطبيب الحالي
// @route   GET /api/availability
// @access  Private/Doctor
const getAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ doctor: req.user.id });
    if (!availability) {
      // إنشاء إعدادات افتراضية إذا لم توجد
      availability = await Availability.create({
        doctor: req.user.id,
        workingDays: [1,2,3,4,5],
        startTime: '09:00',
        endTime: '17:00',
        breakStart: '13:00',
        breakEnd: '14:00',
        slotDuration: 30,
        maxPatientsPerDay: 15,
      });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    إنشاء أو تحديث إعدادات التوافر
// @route   POST /api/availability
// @access  Private/Doctor
const upsertAvailability = async (req, res) => {
  try {
    const { workingDays, startTime, endTime, breakStart, breakEnd, slotDuration, maxPatientsPerDay } = req.body;
    let availability = await Availability.findOne({ doctor: req.user.id });
    if (availability) {
      // تحديث
      availability.workingDays = workingDays;
      availability.startTime = startTime;
      availability.endTime = endTime;
      availability.breakStart = breakStart;
      availability.breakEnd = breakEnd;
      availability.slotDuration = slotDuration;
      availability.maxPatientsPerDay = maxPatientsPerDay;
    } else {
      // إنشاء جديد
      availability = new Availability({
        doctor: req.user.id,
        workingDays,
        startTime,
        endTime,
        breakStart,
        breakEnd,
        slotDuration,
        maxPatientsPerDay,
      });
    }
    await availability.save();
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAvailability, upsertAvailability };