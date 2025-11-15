import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import './VendorNotificationBell.css';

const VendorNotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(false);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Socket.io is disabled on Vercel (serverless doesn't support WebSocket)
    // Real-time notifications are not available in production
    // TODO: Use alternative like Pusher, Ably, or deploy backend to a service that supports WebSocket
    
    if (import.meta.env.DEV) {
      // Only enable Socket.io in development
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const socket = io(baseUrl, {
        transports: ['polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
      
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Notification socket connected');
        if (user?._id) {
          socket.emit('join', user._id);
        }
      });

      // Listen for new orders
      socket.on('order:new', (order) => {
        console.log('New order notification:', order);
        
        const notification = {
          id: order._id,
          type: 'new_order',
          orderId: order._id,
          customerName: order.user?.name || 'ลูกค้า',
          totalAmount: order.totalAmount,
          itemCount: order.items?.length || 0,
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        setShowBadgeAnimation(true);
        setTimeout(() => setShowBadgeAnimation(false), 1000);

        // Play notification sound
        playNotificationSound();
      });

      // Listen for order cancellations
      socket.on('order:cancelled', (data) => {
        console.log('Order cancelled notification:', data);
        
        const notification = {
          id: `cancel-${data.orderId}-${Date.now()}`,
          type: 'order_cancelled',
          orderId: data.orderId,
          customerName: data.customerName || 'ลูกค้า',
          timestamp: new Date(),
          read: false,
        };

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [user]);

  const playNotificationSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read when opening
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // seconds

    if (diff < 60) return 'เมื่อสักครู่';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <div className="vendor-notification-bell" ref={dropdownRef}>
      <button 
        className={`notification-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className={`notification-badge ${showBadgeAnimation ? 'pulse' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>การแจ้งเตือน</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={clearAllNotifications}
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="icon">🔕</span>
                <p>ไม่มีการแจ้งเตือน</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to="/vendor/orders"
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="notification-icon">
                    {notification.type === 'new_order' ? '🆕' : '❌'}
                  </div>
                  <div className="notification-content">
                    {notification.type === 'new_order' ? (
                      <>
                        <div className="notification-title">
                          คำสั่งซื้อใหม่จาก {notification.customerName}
                        </div>
                        <div className="notification-details">
                          {notification.itemCount} รายการ • ฿{notification.totalAmount?.toLocaleString()}
                        </div>
                        <div className="notification-time">
                          {formatTime(notification.timestamp)}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="notification-title">
                          คำสั่งซื้อถูกยกเลิก
                        </div>
                        <div className="notification-details">
                          {notification.customerName} ยกเลิกคำสั่งซื้อ
                        </div>
                        <div className="notification-time">
                          {formatTime(notification.timestamp)}
                        </div>
                      </>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <Link 
                to="/vendor/orders" 
                className="view-all-link"
                onClick={() => setIsOpen(false)}
              >
                ดูคำสั่งซื้อทั้งหมด →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorNotificationBell;
