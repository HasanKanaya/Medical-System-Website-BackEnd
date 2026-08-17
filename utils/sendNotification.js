const Notification = require('../models/Notification');
let io;
const setIO = (ioInstance) => { io = ioInstance; };

const sendNotification = async (userId, { message, type, relatedId = null }) => {
  try {
    
    const notification = await Notification.create({
      user: userId,
      message,
      type,
      relatedId,
      isRead: false,
    });

    
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