import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import { orderService } from '../services/orderService';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import './VendorOrdersPage.css';

const VendorOrdersPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active'); // active, all
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    
    // Socket.io is disabled on Vercel (serverless doesn't support WebSocket)
    // Real-time notifications are not available in production
    // Orders will need manual refresh
    
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
        console.log('Socket connected');
        if (user?._id) {
          socket.emit('join', user._id);
        }
      });

      // Listen for new orders
      socket.on('order:new', (order) => {
        console.log('New order received:', order);
        setOrders(prevOrders => {
          // Check if order already exists
          const exists = prevOrders.some(o => o._id === order._id);
          if (!exists) {
            // Play notification sound
            playNotificationSound();
            
            // Add to new orders set for animation
            setNewOrderIds(prev => new Set(prev).add(order._id));
            // Remove from new orders after 8 seconds
            setTimeout(() => {
              setNewOrderIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(order._id);
                return newSet;
              });
            }, 8000);
            return [order, ...prevOrders];
          }
          return prevOrders;
        });
        showNotification(t('vendor.orders.newOrderReceived') || 'มีคำสั่งซื้อใหม่เข้ามา! 🎉', 'success');
      });

      // Listen for order cancellations
      socket.on('order:cancelled', (data) => {
        console.log('Order cancelled:', data);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === data.orderId ? { ...order, status: 'cancelled' } : order
          )
        );
        showNotification(t('vendor.orders.orderCancelled') || 'Order cancelled', 'warning');
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [filter, user]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a pleasant notification sound (two tones)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filter === 'active') {
        params.status = 'preparing,ready';
      }
      const response = await orderService.getVendorOrders(params);
      const ordersData = response.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification('ไม่สามารถโหลดคำสั่งซื้อได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      showNotification(t('vendor.orders.statusUpdated') || 'Status updated successfully', 'success');
      
      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      showToast(t('vendor.orders.statusUpdateError'), 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      confirmed: '#F59E0B',
      preparing: '#3B82F6',
      ready: '#10B981',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'รอชำระเงิน',
      confirmed: 'ยืนยันแล้ว',
      preparing: 'กำลังเตรียม',
      ready: 'พร้อมรับ',
      completed: 'เสร็จสิ้น',
      cancelled: 'ยกเลิก',
    };
    return statusTexts[status] || status;
  };

  const formatPickupTime = (date) => {
    return new Date(date).toLocaleString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(a.pickupTime) - new Date(b.pickupTime);
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="vendor-orders-page">
      <div className="orders-header">
        <h1>คำสั่งซื้อ</h1>
        <div className="orders-filter">
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            คำสั่งซื้อที่ต้องทำ
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ทั้งหมด
          </button>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📋</div>
          <h3>ไม่มีคำสั่งซื้อ</h3>
          <p>ยังไม่มีคำสั่งซื้อในขณะนี้</p>
        </div>
      ) : (
        <div className="orders-queue">
          {sortedOrders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${order.status === 'preparing' || newOrderIds.has(order._id) ? 'new-order' : ''}`}
            >
              <div className="order-header">
                <div className="order-number">
                  <span className="label">คำสั่งซื้อ</span>
                  <span className="value">#{order._id?.slice(-6)}</span>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span className="icon">👤</span>
                  <span className="label">ลูกค้า:</span>
                  <span className="value">{order.user?.name || 'ไม่ระบุ'}</span>
                </div>
                <div className="info-row">
                  <span className="icon">📅</span>
                  <span className="label">สั่งเมื่อ:</span>
                  <span className="value">{order.createdAt ? formatPickupTime(order.createdAt) : 'ไม่ระบุ'}</span>
                </div>
                <div className="info-row">
                  <span className="icon">🕐</span>
                  <span className="label">เวลารับอาหาร:</span>
                  <span className="value">{order.pickupTime ? formatPickupTime(order.pickupTime) : 'ไม่ระบุ'}</span>
                </div>
                <div className="info-row">
                  <span className="icon">💰</span>
                  <span className="label">ยอดรวม:</span>
                  <span className="value">฿{order.totalAmount?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>รายการอาหาร:</h4>
                <ul>
                  {order.items?.map((item, index) => (
                    <li key={index}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">฿{(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.specialRequests && (
                <div className="special-requests">
                  <span className="icon">📝</span>
                  <span className="label">คำขอพิเศษ:</span>
                  <p>{order.specialRequests}</p>
                </div>
              )}

              <div className="order-actions">
                {order.status === 'preparing' && (
                  <button
                    className="action-btn ready"
                    onClick={() => handleStatusUpdate(order._id, 'ready')}
                    disabled={updatingOrderId === order._id}
                  >
                    {updatingOrderId === order._id ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <span className="icon">✅</span>
                        ทำเสร็จแล้ว - พร้อมรับ
                      </>
                    )}
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    className="action-btn completed"
                    onClick={() => handleStatusUpdate(order._id, 'completed')}
                    disabled={updatingOrderId === order._id}
                  >
                    {updatingOrderId === order._id ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <span className="icon">🎉</span>
                        ลูกค้ารับแล้ว
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrdersPage;
