const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true },
  type: {
  type: String,
  enum: ['appointment_created', 'appointment_confirmed', 'appointment_cancelled', 'appointment_reminder', 'vital_added', 'system', 'appointment_rescheduled', 'prescription_added'],
  default: 'system',
},
  relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);