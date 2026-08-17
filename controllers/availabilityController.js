const Availability = require('../models/Availability');

const dayNameToNumber = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6
};

const getAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ doctor: req.user.id });
    if (!availability) {
      availability = await Availability.create({
        doctor: req.user.id,
        workingDays: [1, 2, 3, 4, 5],
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

const upsertAvailability = async (req, res) => {
  try {
    let { workingDays, startTime, endTime, breakStart, breakEnd, slotDuration, maxPatientsPerDay } = req.body;

    if (workingDays && workingDays.length > 0 && typeof workingDays[0] === 'string') {
      workingDays = workingDays.map(day => dayNameToNumber[day]);
    }

    let availability = await Availability.findOne({ doctor: req.user.id });
    if (availability) {
      availability.workingDays = workingDays;
      availability.startTime = startTime;
      availability.endTime = endTime;
      availability.breakStart = breakStart;
      availability.breakEnd = breakEnd;
      availability.slotDuration = slotDuration;
      availability.maxPatientsPerDay = maxPatientsPerDay;
    } else {
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

const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availability = await Availability.findOne({ doctor: doctorId });
    if (!availability) {
      return res.status(404).json({ message: 'Availability not set' });
    }
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAvailability, upsertAvailability, getDoctorAvailability };