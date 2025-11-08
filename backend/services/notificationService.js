import { createNotification } from '../controllers/notificationController.js';

// Send notification to user via Socket.io and save to database
export const sendNotification = async (io, userId, type, title, message, relatedOrderId = null) => {
  try {
    // Save notification to database
    const notification = await createNotification(userId, type, title, message, relatedOrderId);

    // Emit real-time notification to user's room
    io.to(`user:${userId}`).emit('notification', {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      relatedOrderId: notification.relatedOrderId,
      createdAt: notification.createdAt,
    });

    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
    throw error;
  }
};
