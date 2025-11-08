import api from './api';

// Get user's notifications
export const getNotifications = async (page = 1, limit = 20, type = null) => {
  try {
    const params = { page, limit };
    if (type) {
      params.type = type;
    }

    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};
