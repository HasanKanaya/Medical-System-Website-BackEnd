const mongoose = require('mongoose');

const vitalSignSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordedAt: { type: Date, default: Date.now },
  height: { type: Number, default: null },
  weight: { type: Number, default: null },
  bmi: { type: Number, default: null },
  heartRate: { type: Number, default: null },
  bloodPressureSystolic: { type: Number, default: null },
  bloodPressureDiastolic: { type: Number, default: null },
  bloodSugar: { type: Number, default: null },
  temperature: { type: Number, default: null },
  respiratoryRate: { type: Number, default: null },
  oxygenSaturation: { type: Number, default: null },
  notes: { type: String, default: '' },
});

vitalSignSchema.pre('save', async function() {
  if (this.height && this.weight && this.height > 0) {
    const heightInMeters = this.height / 100;
    this.bmi = parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  } else {
    this.bmi = null;
  }
});

module.exports = mongoose.model('VitalSign', vitalSignSchema);