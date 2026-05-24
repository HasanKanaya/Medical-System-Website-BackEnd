const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,  // مثلاً "10:00 AM - 10:30 AM"
      required: true,
    },
    reason: {
      type: String,
      enum: ['routine', 'emergency', 'follow-up'],
      default: 'routine',
    },
    type: {
      type: String,
      enum: ['clinic', 'virtual'],
      default: 'clinic',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;