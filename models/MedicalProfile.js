const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodType: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], default: null },
  allergies: { type: String, default: '' },
  chronicDiseases: { type: String, default: '' },
  pastSurgeries: { type: String, default: '' },
  regularMedications: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MedicalProfile', medicalProfileSchema);