import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '../components/common/Toast';

export const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [unreadCount] = useState(0);
  const [loading] = useState(false);

  // Show toast notification
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

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
    showNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
