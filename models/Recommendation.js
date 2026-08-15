const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
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
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ✅ Enforce one recommendation per patient-doctor pair
recommendationSchema.index({ patient: 1, doctor: 1 }, { unique: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);