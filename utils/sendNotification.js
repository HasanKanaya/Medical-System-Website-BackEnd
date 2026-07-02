const Notification = require('../models/Notification');
// سنستورد io من server.js (سنضبطه لاحقاً)
let io;
const setIO = (ioInstance) => { io = ioInstance; };

const sendNotification = async (userId, { message, type, relatedId = null }) => {
  try {
    // 1. حفظ الإشعار في قاعدة البيانات
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      relatedId,
      isRead: false,
    });

    // 2. إذا كان io جاهزاً والمستخدم متصلاً، أرسل الإشعار فوراً
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

module.exports = { sendNotification, setIO };