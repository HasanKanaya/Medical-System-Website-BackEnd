const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  dateString: { type: String, required: true }, // بصيغة YYYY-MM-DD
  timeSlot: { type: String, required: true },
  reason: { type: String, enum: ['routine', 'emergency', 'follow-up'], default: 'routine' },
  type: { type: String, enum: ['clinic', 'virtual'], default: 'clinic' },
  status: { type: String, 
     enum: ['pending', 'confirmed', 'cancelled', 'completed', 'cancelled_emergency', 'rescheduled'],
     default: 'pending' },
  notes: { type: String, default: '' },
  rescheduledFrom: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Appointment',
  default: null,
},
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);