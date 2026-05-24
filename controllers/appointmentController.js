const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Availability = require('../models/Availability');

// @desc    حجز موعد جديد
// @route   POST /api/appointments
// @access  Private (patient)
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, type, notes } = req.body;
    const patientId = req.user.id;

    // التأكد من أن الطبيب موجود ودوره doctor
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // منع الحجز المزدوج (نفس الطبيب، نفس اليوم، نفس الفترة)
    const existing = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      timeSlot,
      reason,
      type,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب مواعيد المريض الحالي
// @route   GET /api/appointments/my-appointments
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'fullName email specialization doctorDetails')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب مواعيد الطبيب (لمن هو طبيب)
const getDoctorAppointments = async (req, res) => {
  try {
    const { start, end } = req.query;
    let filter = { doctor: req.user.id };
    
    if (start && end) {
      filter.date = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }
    
    const appointments = await Appointment.find(filter)
      .populate('patient', 'fullName email phone')
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    إلغاء موعد
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    // التحقق من الصلاحية: المريض نفسه أو الطبيب المعني
    if (appointment.patient.toString() !== req.user.id && appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 
// @desc    تحديث حالة الموعد (للطبيب)
// @route   PUT /api/appointments/:id/status
// @access  Private (doctor only)
// تحويل "09:00" إلى كائن Date مع الحفاظ على التاريخ المحدد
function timeToDate(date, timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const d = new Date(date);
  d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return d;
}

// توليد فترات الحجز بين start و end مع break
function generateSlots(startTime, endTime, breakStart, breakEnd, slotDuration, appointmentDate) {
  const slots = [];
  let current = timeToDate(appointmentDate, startTime);
  const end = timeToDate(appointmentDate, endTime);
  const breakFrom = breakStart ? timeToDate(appointmentDate, breakStart) : null;
  const breakTo = breakEnd ? timeToDate(appointmentDate, breakEnd) : null;

  while (current < end) {
    // تجاوز فترة الراحة
    if (breakFrom && breakTo && current >= breakFrom && current < breakTo) {
      current = new Date(breakTo);
      continue;
    }
    const slotEnd = new Date(current.getTime() + slotDuration * 60000);
    if (slotEnd > end) break;
    const timeStr = `${current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${slotEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    slots.push(timeStr);
    current = slotEnd;
  }
  return slots;
}
// 

const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    // جلب إعدادات التوافر للطبيب
    const availability = await Availability.findOne({ doctor: doctorId });
    if (!availability || !availability.isActive) {
      return res.status(404).json({ message: 'Doctor availability not set' });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 الأحد, 6 السبت

    // هل اليوم ضمن أيام العمل؟
    if (!availability.workingDays.includes(dayOfWeek)) {
      return res.json([]); // لا أوقات متاحة في هذا اليوم
    }

    // توليد جميع الفترات الممكنة حسب الإعدادات
    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.breakStart,
      availability.breakEnd,
      availability.slotDuration,
      selectedDate
    );

    // جلب الفترات المحجوزة لهذا اليوم
    const startDate = new Date(selectedDate);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23,59,59,999);

    const booked = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startDate, $lt: endDate },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = booked.map(b => b.timeSlot);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

    // تطبيق حد أقصى للمرضى في اليوم
    const confirmedCount = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: startDate, $lt: endDate },
      status: { $in: ['confirmed', 'pending'] },
    });
    const remainingSlots = availability.maxPatientsPerDay - confirmedCount;
    const finalSlots = availableSlots.slice(0, remainingSlots);

    res.json(finalSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    // تأكد أن الطبيب الحالي هو المعني
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  cancelAppointment,
  getAvailableSlots,
  updateAppointmentStatus,
};