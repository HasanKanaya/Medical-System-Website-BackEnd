const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'الاسم الثلاثي مطلوب'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,   
      default: null,
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'assistant', 'admin'],
      default: 'patient',
    },
    profileImage: {
      type: String,
      default: '',
    },
    address: {
  type: String,
  default: '',
},
    isActive: {
      type: Boolean,
      default: true,
    },
    
    doctorDetails: {
      qualifications: { type: String },
      licenseNumber: { type: String },
      specialization: { type: String },
      yearsOfExperience: { type: Number },
      documents: [{ type: String }],
      isVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// تشفير كلمة المرور قبل حفظ المستخدم
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;