const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { setIO } = require('./utils/sendNotification');
const prescriptionRoutes = require('./routes/prescriptionRoutes');


dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};
connectDB();

// إنشاء خادم HTTP لـ Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// تخزين اتصالات المستخدمين
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('register', (userId) => {
    if (userId) {
      userSockets.set(userId, socket.id);
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on('disconnect', () => {
    for (let [userId, sockId] of userSockets.entries()) {
      if (sockId === socket.id) {
        userSockets.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

setIO(io);

// تشغيل الخادم (بدلاً من app.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { io };