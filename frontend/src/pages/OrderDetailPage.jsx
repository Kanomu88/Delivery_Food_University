import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';

const OrderDetailPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: orderService.cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['order', orderId]);
      queryClient.invalidateQueries(['orders']);
    },
  });

  const handleCancelOrder = () => {
    if (window.confirm(t('order.confirmCancel'))) {
      cancelOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) return <Loading />;

  const order = data?.data?.order;

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

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate('/orders')} className="btn-back">
          ← {t('common.back')}
        </button>

        <div className="order-detail">
          <div className="order-header">
            <h1>{t('order.orderNumber')}: {order?.orderNumber}</h1>
            <span className={`status-badge ${getStatusColor(order?.status)}`}>
              {t(`order.status.${order?.status}`)}
            </span>
          </div>

          <div className="order-timeline">
            <div className={`timeline-step ${['pending_payment', 'paid', 'preparing', 'ready', 'completed'].includes(order?.status) ? 'active' : ''}`}>
              <div className="step-icon">1</div>
              <div className="step-label">{t('order.status.pending_payment')}</div>
            </div>
            <div className={`timeline-step ${['paid', 'preparing', 'ready', 'completed'].includes(order?.status) ? 'active' : ''}`}>
              <div className="step-icon">2</div>
              <div className="step-label">{t('order.status.paid')}</div>
            </div>
            <div className={`timeline-step ${['preparing', 'ready', 'completed'].includes(order?.status) ? 'active' : ''}`}>
              <div className="step-icon">3</div>
              <div className="step-label">{t('order.status.preparing')}</div>
            </div>
            <div className={`timeline-step ${['ready', 'completed'].includes(order?.status) ? 'active' : ''}`}>
              <div className="step-icon">4</div>
              <div className="step-label">{t('order.status.ready')}</div>
            </div>
            <div className={`timeline-step ${order?.status === 'completed' ? 'active' : ''}`}>
              <div className="step-icon">5</div>
              <div className="step-label">{t('order.status.completed')}</div>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-card">
              <h3>{t('order.vendorInfo')}</h3>
              <p><strong>{t('order.vendor')}:</strong> {order?.vendorId?.shopName}</p>
            </div>

            <div className="info-card">
              <h3>{t('order.pickupInfo')}</h3>
              <p><strong>{t('order.pickupTime')}:</strong> {new Date(order?.pickupTime).toLocaleString()}</p>
            </div>

            <div className="info-card">
              <h3>{t('order.orderDate')}</h3>
              <p>{new Date(order?.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {order?.specialRequests && (
            <div className="special-requests">
              <h3>{t('order.specialRequests')}</h3>
              <p>{order.specialRequests}</p>
            </div>
          )}

          <div className="order-items">
            <h3>{t('order.items')}</h3>
            {order?.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
                <span className="item-price">฿{item.subtotal?.toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>{t('order.total')}:</strong>
              <strong>฿{order?.totalAmount?.toFixed(2)}</strong>
            </div>
          </div>

          <div className="order-actions">
            {order?.status === 'pending_payment' && (
              <>
                <button 
                  onClick={() => navigate(`/payment/${orderId}`)}
                  className="btn btn-primary"
                >
                  {t('order.payNow')}
                </button>
                <button 
                  onClick={handleCancelOrder}
                  className="btn btn-secondary"
                  disabled={cancelOrderMutation.isPending}
                >
                  {t('order.cancel')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
