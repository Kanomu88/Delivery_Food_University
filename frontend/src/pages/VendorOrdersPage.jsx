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

  useEffect(() => {
    fetchOrders();
    
    // Initialize Socket.io connection
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
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
          // Add to new orders set for animation
          setNewOrderIds(prev => new Set(prev).add(order._id));
          // Remove from new orders after 5 seconds
          setTimeout(() => {
            setNewOrderIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(order._id);
              return newSet;
            });
          }, 5000);
          return [order, ...prevOrders];
        }
        return prevOrders;
      });
      showNotification(t('vendor.orders.newOrderReceived') || 'New order received!', 'info');
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

    return () => {
      socket.disconnect();
    };
  }, [filter, user]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filter === 'active') {
        params.status = 'paid,preparing';
      }
      const data = await orderService.getVendorOrders(params);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showNotification(t('vendor.orders.loadError') || 'Failed to load orders', 'error');
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
      paid: '#F59E0B',
      preparing: '#3B82F6',
      ready: '#10B981',
      completed: '#6B7280',
      cancelled: '#EF4444',
    };
    return colors[status] || '#6B7280';
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
        <h1>{t('vendor.orders.title')}</h1>
        <div className="orders-filter">
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            {t('vendor.orders.activeOrders')}
          </button>
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('vendor.orders.allOrders')}
          </button>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📋</div>
          <h3>{t('vendor.orders.noOrders')}</h3>
          <p>{t('vendor.orders.noOrdersMessage')}</p>
        </div>
      ) : (
        <div className="orders-queue">
          {sortedOrders.map((order) => (
            <div
              key={order._id}
              className={`order-card ${order.status === 'paid' || newOrderIds.has(order._id) ? 'new-order' : ''}`}
            >
              <div className="order-header">
                <div className="order-number">
                  <span className="label">{t('vendor.orders.orderNumber')}</span>
                  <span className="value">#{order.orderNumber}</span>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {t(`order.status.${order.status}`)}
                </div>
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span className="icon">👤</span>
                  <span className="label">{t('vendor.orders.customer')}:</span>
                  <span className="value">{order.customerId?.username || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="icon">🕐</span>
                  <span className="label">{t('vendor.orders.pickupTime')}:</span>
                  <span className="value">{formatPickupTime(order.pickupTime)}</span>
                </div>
                <div className="info-row">
                  <span className="icon">💰</span>
                  <span className="label">{t('vendor.orders.total')}:</span>
                  <span className="value">฿{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="order-items">
                <h4>{t('vendor.orders.items')}:</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                      <span className="item-price">฿{item.subtotal.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.specialRequests && (
                <div className="special-requests">
                  <span className="icon">📝</span>
                  <span className="label">{t('vendor.orders.specialRequests')}:</span>
                  <p>{order.specialRequests}</p>
                </div>
              )}

              <div className="order-actions">
                {order.status === 'paid' && (
                  <button
                    className="action-btn preparing"
                    onClick={() => handleStatusUpdate(order._id, 'preparing')}
                    disabled={updatingOrderId === order._id}
                  >
                    {updatingOrderId === order._id ? (
                      <span className="spinner"></span>
                    ) : (
                      <>
                        <span className="icon">👨‍🍳</span>
                        {t('vendor.orders.startPreparing')}
                      </>
                    )}
                  </button>
                )}
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
                        {t('vendor.orders.markReady')}
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
                        {t('vendor.orders.markCompleted')}
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
