const User = require('../models/User');
const Appointment = require('../models/Appointment');
const VitalSign = require('../models/VitalSign');
const MedicalProfile = require('../models/MedicalProfile');
const Availability = require('../models/Availability'); // ✅ أضف هذا السطر
const { sendNotification } = require('../utils/sendNotification');

// @desc    جلب مرضى الطبيب المعين للمساعد
// @route   GET /api/assistant/patients
// @access  Private (assistant only)
exports.getAssignedDoctorPatients = async (req, res) => {
  try {
    const assistant = await User.findById(req.user.id).populate('assignedDoctor', 'fullName');
    if (!assistant || assistant.role !== 'assistant' || !assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned to you' });
    }
    const doctorId = assistant.assignedDoctor._id;
    const appointments = await Appointment.find({ doctor: doctorId }).populate('patient', 'fullName email phone');
    const patientsMap = new Map();
    appointments.forEach(app => {
      if (!patientsMap.has(app.patient._id.toString())) {
        patientsMap.set(app.patient._id.toString(), app.patient);
      }
    });
    const patients = Array.from(patientsMap.values());
    res.json({ doctor: assistant.assignedDoctor, patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    إضافة قياس حيوي لمريض (للمساعد مع التحقق من أن المريض يتبع الطبيب المعين)
// @route   POST /api/assistant/vitals
// @access  Private (assistant only)
exports.addVitalSignByAssistant = async (req, res) => {
  try {
    const assistant = await User.findById(req.user.id);
    if (!assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned' });
    }
    const { patientId, height, weight, heartRate, bloodPressureSystolic, bloodPressureDiastolic, bloodSugar, temperature, notes } = req.body;
    const appointment = await Appointment.findOne({ doctor: assistant.assignedDoctor, patient: patientId });
    if (!appointment) {
      return res.status(403).json({ message: 'You are not authorized to add vital signs for this patient' });
    }
    const vital = await VitalSign.create({
      patient: patientId,
      doctor: assistant.assignedDoctor,
      height,
      weight,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bloodSugar,
      temperature,
      notes,
    });
    res.status(201).json(vital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب المواعيد الملغاة بسبب الطوارئ للطبيب المعين
// @route   GET /api/assistant/cancelled-emergency
// @access  Private (assistant only)
exports.getCancelledEmergencyAppointments = async (req, res) => {
  try {
    const assistant = await User.findById(req.user.id);
    if (!assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned' });
    }
    const doctorId = assistant.assignedDoctor;
    const appointments = await Appointment.find({
      doctor: doctorId,
      status: 'cancelled_emergency',
    }).populate('patient', 'fullName email phone').populate('doctor', '_id fullName');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    إعادة جدولة موعد ملغي (للمساعد)
// @route   POST /api/assistant/reschedule/:appointmentId
// @access  Private (assistant only)
exports.rescheduleEmergencyAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTimeSlot } = req.body;
    const assistant = await User.findById(req.user.id);
    if (!assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned' });
    }
    const oldAppointment = await Appointment.findById(appointmentId);
    if (!oldAppointment || oldAppointment.status !== 'cancelled_emergency') {
      return res.status(404).json({ message: 'Appointment not found or not emergency cancelled' });
    }
    if (oldAppointment.doctor.toString() !== assistant.assignedDoctor.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const existing = await Appointment.findOne({
      doctor: oldAppointment.doctor,
      dateString: newDate,
      timeSlot: newTimeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'Time slot already booked' });
    }
    const newAppointment = await Appointment.create({
      patient: oldAppointment.patient,
      doctor: oldAppointment.doctor,
      date: new Date(newDate + 'T00:00:00.000Z'),
      dateString: newDate,
      timeSlot: newTimeSlot,
      reason: oldAppointment.reason,
      type: oldAppointment.type,
      notes: oldAppointment.notes,
      status: 'pending',
      rescheduledFrom: oldAppointment._id,
    });
    oldAppointment.status = 'rescheduled';
    oldAppointment.notes = (oldAppointment.notes || '') + ` [Rescheduled to ${newDate} ${newTimeSlot} by assistant ${assistant.fullName}]`;
    await oldAppointment.save();

    await sendNotification(oldAppointment.patient, {
      message: `Your cancelled appointment has been rescheduled to ${newDate} at ${newTimeSlot}. Please log in to confirm.`,
      type: 'appointment_rescheduled',
      relatedId: newAppointment._id,
    });

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب بيانات الطبيب المعين للمساعد
// @route   GET /api/assistant/assigned-doctor
// @access  Private (assistant only)
exports.getAssignedDoctor = async (req, res) => {
  try {
    const assistant = await User.findById(req.user.id).populate('assignedDoctor', 'fullName email');
    if (!assistant || assistant.role !== 'assistant' || !assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned to you' });
    }
    res.json(assistant.assignedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    جلب مواعيد الطبيب المعين للمساعد
// @route   GET /api/assistant/appointments
// @access  Private (assistant only)
exports.getAssignedDoctorAppointments = async (req, res) => {
  try {
    const assistant = await User.findById(req.user.id).populate('assignedDoctor');
    if (!assistant || assistant.role !== 'assistant' || !assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned' });
    }
    const doctorId = assistant.assignedDoctor._id;
    const { start, end } = req.query;
    let filter = { doctor: doctorId };
    if (start && end) {
      filter.dateString = { $gte: start.split('T')[0], $lte: end.split('T')[0] };
    }
    const appointments = await Appointment.find(filter)
      .populate('patient', 'fullName email phone')
      .sort({ dateString: 1, timeSlot: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    إلغاء يوم كامل للطبيب المعين (للمساعد)
// @route   POST /api/assistant/cancel-day
// @access  Private (assistant only)
exports.cancelDayByAssistant = async (req, res) => {
  try {
    const { date } = req.body; // date بصيغة "YYYY-MM-DD"
    
    // 1. التحقق من أن المستخدم مساعد ولديه طبيب معين
    const assistant = await User.findById(req.user.id).populate('assignedDoctor', 'fullName');
    if (!assistant || assistant.role !== 'assistant' || !assistant.assignedDoctor) {
      return res.status(403).json({ message: 'No doctor assigned to you' });
    }
    const doctorId = assistant.assignedDoctor._id;

    // 2. جلب جميع المواعيد في ذلك اليوم للطبيب المعين
    const appointments = await Appointment.find({
      doctor: doctorId,
      dateString: date,
      status: { $in: ['pending', 'confirmed'] },
    }).populate('patient', 'fullName email');

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments to cancel on this day' });
    }

    // 3. تحديث حالة كل موعد
    for (const app of appointments) {
      app.status = 'cancelled_emergency';
      await app.save();

      // إرسال إشعار لكل مريض
      await sendNotification(app.patient._id, {
        message: `Emergency: Your appointment with Dr. ${assistant.assignedDoctor.fullName} on ${date} at ${app.timeSlot} has been cancelled. Please contact the clinic to reschedule.`,
        type: 'appointment_cancelled',
        relatedId: app._id,
      });
    }

    // 4. إضافة التاريخ إلى blockedDates في Availability
    await Availability.findOneAndUpdate(
      { doctor: doctorId },
      { $addToSet: { blockedDates: date } }
    );

    res.json({ message: `Successfully cancelled ${appointments.length} appointments`, count: appointments.length });
  } catch (error) {
    console.error('Cancel day error:', error);
    res.status(500).json({ message: error.message });
  }
};

