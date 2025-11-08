import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: () => orderService.getUserOrders({ status: statusFilter }),
  });

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'warning',
      paid: 'info',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  if (isLoading) return <Loading />;

  const orders = data?.data?.orders || [];

  return (
    <div className="orders-page">
      <div className="container">
        <h1>{t('orders.title')}</h1>

        <div className="orders-filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">{t('orders.allStatuses')}</option>
            <option value="pending_payment">{t('order.status.pending_payment')}</option>
            <option value="paid">{t('order.status.paid')}</option>
            <option value="preparing">{t('order.status.preparing')}</option>
            <option value="ready">{t('order.status.ready')}</option>
            <option value="completed">{t('order.status.completed')}</option>
            <option value="cancelled">{t('order.status.cancelled')}</option>
          </select>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <p>{t('orders.noOrders')}</p>
            <button onClick={() => navigate('/menu')} className="btn btn-primary">
              {t('orders.startOrdering')}
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="order-card"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <div className="order-header">
                  <h3>{order.orderNumber}</h3>
                  <span className={`status-badge ${getStatusColor(order.status)}`}>
                    {t(`order.status.${order.status}`)}
                  </span>
                </div>
                <div className="order-info">
                  <p><strong>{t('orders.vendor')}:</strong> {order.vendorId?.shopName}</p>
                  <p><strong>{t('orders.items')}:</strong> {order.items?.length} {t('orders.itemsCount')}</p>
                  <p><strong>{t('orders.total')}:</strong> ฿{order.totalAmount?.toFixed(2)}</p>
                  <p><strong>{t('orders.date')}:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
