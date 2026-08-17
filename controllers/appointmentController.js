const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Availability = require('../models/Availability');
const Prescription = require('../models/Prescription');
const { sendNotification } = require('../utils/sendNotification');


function getDayNumberFromDateString(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(Date.UTC(parseInt(year), parseInt(month)-1, parseInt(day)));
  return date.getUTCDay();
}

function timeToUTCDate(dateStr, timeStr) {
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');
  return new Date(Date.UTC(parseInt(year), parseInt(month)-1, parseInt(day), parseInt(hours), parseInt(minutes), 0));
}

function generateSlots(startTime, endTime, breakStart, breakEnd, slotDuration, dateStr) {
  const slots = [];
  let current = timeToUTCDate(dateStr, startTime);
  const end = timeToUTCDate(dateStr, endTime);
  const breakFrom = breakStart ? timeToUTCDate(dateStr, breakStart) : null;
  const breakTo = breakEnd ? timeToUTCDate(dateStr, breakEnd) : null;

  while (current < end) {
    if (breakFrom && breakTo && current >= breakFrom && current < breakTo) {
      current = new Date(breakTo);
      continue;
    }
    const slotEnd = new Date(current.getTime() + slotDuration * 60000);
    if (slotEnd > end) break;
    const timeStr = `${current.toISOString().substr(11,5)} - ${slotEnd.toISOString().substr(11,5)}`;
    slots.push(timeStr);
    current = slotEnd;
  }
  return slots;
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    console.log('📅 Received date:', date);
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const dayNumber = getDayNumberFromDateString(date);
    console.log('📆 Day number:', dayNumber);

    const availability = await Availability.findOne({ doctor: doctorId });
    console.log('⚙️ Availability found:', availability);
    if (!availability || !availability.isActive) {
      return res.status(404).json({ message: 'Doctor availability not set' });
    }

    if (availability.blockedDates && availability.blockedDates.includes(date)) {
      console.log('❌ This date is blocked by doctor (emergency cancellation)');
      return res.json([]);
    }

    console.log('✅ Working days (numbers):', availability.workingDays);
    if (!availability.workingDays.includes(dayNumber)) {
      console.log('❌ Day not in working days');
      return res.json([]);
    }

    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.breakStart,
      availability.breakEnd,
      availability.slotDuration,
      date
    );
    console.log('⏰ Generated slots:', allSlots);

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    let filteredSlots = allSlots;
    if (date === todayStr) {
      filteredSlots = allSlots.filter(slot => {
        const startTime = slot.split(' - ')[0];
        const [hours, minutes] = startTime.split(':').map(Number);
        const slotMinutes = hours * 60 + minutes;
        return slotMinutes > currentMinutes;
      });
      console.log('⏳ Filtered past slots for today:', filteredSlots);
    }

    const booked = await Appointment.find({
      doctor: doctorId,
      dateString: date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');
    const bookedSlots = booked.map(b => b.timeSlot);
    let availableSlots = filteredSlots.filter(slot => !bookedSlots.includes(slot));

    const confirmedCount = await Appointment.countDocuments({
      doctor: doctorId,
      dateString: date,
      status: { $in: ['pending', 'confirmed'] },
    });
    const remainingSlots = availability.maxPatientsPerDay - confirmedCount;
    const finalSlots = availableSlots.slice(0, remainingSlots);
    console.log('✨ Final slots:', finalSlots);
    res.json(finalSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, reason, type, notes } = req.body;
    const patientId = req.user.id;

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const availability = await Availability.findOne({ doctor: doctorId });
    if (!availability || !availability.isActive) {
      return res.status(404).json({ message: 'Doctor availability not set' });
    }

    const confirmedCount = await Appointment.countDocuments({
      doctor: doctorId,
      dateString: date,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (confirmedCount >= availability.maxPatientsPerDay) {
      return res.status(400).json({
        message: `Doctor has reached the maximum number of patients (${availability.maxPatientsPerDay}) for this day.`
      });
    }

    const existing = await Appointment.findOne({
      doctor: doctorId,
      dateString: date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const dateObj = new Date(date + 'T00:00:00.000Z');
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date: dateObj,
      dateString: date,
      timeSlot,
      reason,
      type,
      notes,
    });

    sendNotification(doctorId, {
      message: `New appointment booked by ${req.user.fullName} on ${date} at ${timeSlot}`,
      type: 'appointment_created',
      relatedId: appointment._id,
    }).catch(err => console.error('Notification error:', err));

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'fullName email doctorDetails specialization')
      .sort({ dateString: -1, timeSlot: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const { start, end } = req.query;
    let filter = { doctor: req.user.id };
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

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
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

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    
    const appointment = await Appointment.findById(id).populate('patient', 'fullName');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.doctor.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
    
    appointment.status = status;
    await appointment.save();

    const patientId = appointment.patient._id;
    const doctorName = req.user.fullName;
    const date = appointment.dateString;
    const time = appointment.timeSlot;
    
    let message = '';
    if (status === 'confirmed') {
      message = `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been confirmed.`;
    } else if (status === 'cancelled') {
      message = `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled.`;
    } else if (status === 'completed') {
      message = `Your appointment with Dr. ${doctorName} on ${date} at ${time} has been marked as completed.`;
    } else {
      message = `Your appointment with Dr. ${doctorName} on ${date} at ${time} is now ${status}.`;
    }

    sendNotification(patientId, {
      message,
      type: `appointment_${status}`,
      relatedId: appointment._id,
    }).catch(err => console.error('Notification error:', err));

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, timeSlot } = req.body; // date بصيغة YYYY-MM-DD
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return res.status(400).json({ message: 'Cannot reschedule this appointment' });
    }
    
    const existing = await Appointment.findOne({
      doctor: appointment.doctor,
      dateString: date,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
      _id: { $ne: id } 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    appointment.dateString = date;
    appointment.timeSlot = timeSlot;
    appointment.date = new Date(date + 'T00:00:00.000Z');
    await appointment.save();
    
    res.json({ message: 'Appointment rescheduled successfully', appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'fullName email doctorDetails specialization');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelFullDay = async (req, res) => {
  try {
    const { date } = req.body; 
    const doctorId = req.user.id;

    const appointments = await Appointment.find({
      doctor: doctorId,
      dateString: date,
      status: { $in: ['pending', 'confirmed'] },
    }).populate('patient', 'fullName email');

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments to cancel on this day' });
    }

    for (const app of appointments) {
      app.status = 'cancelled_emergency';
      await app.save();

      await sendNotification(app.patient._id, {
        message: `Emergency: Your appointment with Dr. ${req.user.fullName} on ${date} at ${app.timeSlot} has been cancelled. Please contact the clinic to reschedule.`,
        type: 'appointment_cancelled',
        relatedId: app._id,
      });
    }

    await Availability.findOneAndUpdate(
      { doctor: doctorId },
      { $addToSet: { blockedDates: date } } 
    );

    res.json({ message: `Successfully cancelled ${appointments.length} appointments`, count: appointments.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeAppointmentWithPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { medications, instructions } = req.body;

    const appointment = await Appointment.findById(id).populate('patient', 'fullName email');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (appointment.status === 'completed') {
      return res.status(400).json({ message: 'Appointment already completed' });
    }
    if (!medications || medications.length === 0) {
      return res.status(400).json({ message: 'At least one medication is required' });
    }

    const prescription = await Prescription.create({
      patient: appointment.patient._id,
      doctor: req.user.id,
      appointment: appointment._id,
      medications,
      instructions: instructions || '',
    });

    appointment.status = 'completed';
    await appointment.save();

    await sendNotification(appointment.patient._id, {
      message: `Dr. ${req.user.fullName} has added a new prescription for your visit on ${appointment.dateString}. Please check your prescriptions.`,
      type: 'prescription_added',
      relatedId: prescription._id,
    });

    res.status(201).json({ message: 'Appointment completed with prescription', prescription, appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};