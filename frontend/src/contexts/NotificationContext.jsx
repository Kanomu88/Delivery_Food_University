import React, { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications] = useState([]);
  const [unreadCount] = useState(0);
  const [loading] = useState(false);

  // Disabled features for Vercel deployment (no WebSocket support)
  // These features require a persistent server connection

  const fetchNotifications = useCallback(async () => {
    // Disabled - requires backend API endpoint
    console.log('Notifications disabled in production');
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    // Disabled - requires backend API endpoint
  }, []);

  const markAsRead = useCallback(async () => {
    // Disabled - requires backend API endpoint
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Disabled - requires backend API endpoint
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
