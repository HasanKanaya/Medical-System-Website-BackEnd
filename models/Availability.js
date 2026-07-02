const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  workingDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  breakStart: { type: String, default: '13:00' },
  breakEnd: { type: String, default: '14:00' },
  slotDuration: { type: Number, default: 30 },
  maxPatientsPerDay: { type: Number, default: 15 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Availability', availabilitySchema);