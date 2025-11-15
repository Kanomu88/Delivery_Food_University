import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import './OrderDetailPage.css';

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

  const order = data?.data?.order || data?.data;

  // Debug
  console.log('Order data:', order);
  console.log('Order status:', order?.status);
  console.log('Payment status:', order?.paymentStatus);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready: 'success',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
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

  // Calculate progress percentage
  const getProgressPercentage = () => {
    const status = order?.status;
    const statusProgress = {
      'pending': 0,
      'preparing': 33,
      'ready': 66,
      'completed': 100,
      'cancelled': 0
    };
    const progress = statusProgress[status] || 0;
    console.log('Progress for status', status, ':', progress);
    return progress;
  };

  // Check if step is completed
  const isStepCompleted = (step) => {
    const status = order?.status;
    const stepOrder = ['pending', 'preparing', 'ready', 'completed'];
    const currentIndex = stepOrder.indexOf(status);
    const stepIndex = stepOrder.indexOf(step);
    return currentIndex > stepIndex;
  };

  // Check if step is active
  const isStepActive = (step) => {
    return order?.status === step;
  };

  return (
    <div className="order-detail-page">
      <div className="container">
        <button onClick={() => navigate('/orders')} className="btn-back">
          ← {t('common.back')}
        </button>

        <div className="order-detail">
          <div className="order-header">
            <h1>คำสั่งซื้อ #{order?._id?.slice(-6)}</h1>
            <span className={`status-badge ${getStatusColor(order?.status)}`}>
              {getStatusText(order?.status)}
            </span>
          </div>

          <div className="order-timeline" data-progress={getProgressPercentage()}>
            {/* Progress indicator */}
            <div className="progress-indicator">
              <div className="progress-text">
                ความคืบหน้า: {getProgressPercentage()}%
              </div>
            </div>

            {/* Step 1: รอชำระเงิน */}
            <div className={`timeline-step ${isStepActive('pending') ? 'active' : isStepCompleted('pending') ? 'completed' : ''}`}>
              <div className="step-icon">
                {isStepCompleted('pending') ? '✓' : isStepActive('pending') ? '💳' : '⏳'}
              </div>
              <div className="step-content">
                <div className="step-label">รอชำระเงิน</div>
                {isStepActive('pending') && <div className="step-time">กำลังรอ...</div>}
                {isStepCompleted('pending') && (
                  <div className="step-time completed-time">✓ ชำระแล้ว</div>
                )}
              </div>
            </div>
            
            {/* Step 2: กำลังเตรียม */}
            <div className={`timeline-step ${isStepActive('preparing') ? 'active' : isStepCompleted('preparing') ? 'completed' : ''}`}>
              <div className="step-icon">
                {isStepCompleted('preparing') ? '✓' : isStepActive('preparing') ? '👨‍🍳' : '⏳'}
              </div>
              <div className="step-content">
                <div className="step-label">กำลังเตรียม</div>
                {isStepActive('preparing') && <div className="step-time">กำลังทำอาหาร...</div>}
                {isStepCompleted('preparing') && (
                  <div className="step-time completed-time">✓ เตรียมเสร็จแล้ว</div>
                )}
              </div>
            </div>
            
            {/* Step 3: พร้อมรับ */}
            <div className={`timeline-step ${isStepActive('ready') ? 'active' : isStepCompleted('ready') ? 'completed' : ''}`}>
              <div className="step-icon">
                {isStepCompleted('ready') ? '✓' : isStepActive('ready') ? '🔔' : '⏳'}
              </div>
              <div className="step-content">
                <div className="step-label">พร้อมรับ</div>
                {isStepActive('ready') && order?.pickupTime && (
                  <div className="step-time">
                    รับได้ที่: {new Date(order.pickupTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {isStepCompleted('ready') && (
                  <div className="step-time completed-time">✓ รับแล้ว</div>
                )}
              </div>
            </div>
            
            {/* Step 4: เสร็จสิ้น */}
            <div className={`timeline-step ${isStepActive('completed') ? 'active completed' : ''}`}>
              <div className="step-icon">
                {isStepActive('completed') ? '🎉' : '⏳'}
              </div>
              <div className="step-content">
                <div className="step-label">เสร็จสิ้น</div>
                {isStepActive('completed') && <div className="step-time">ขอบคุณที่ใช้บริการ!</div>}
              </div>
            </div>
          </div>

          <div className="order-info-grid">
            <div className="info-card">
              <h3>ข้อมูลร้านค้า</h3>
              <p><strong>ร้านค้า:</strong> {order?.vendor?.name || 'ไม่ระบุ'}</p>
              <p><strong>อีเมล:</strong> {order?.vendor?.email || 'ไม่ระบุ'}</p>
            </div>

            <div className="info-card">
              <h3>เวลารับอาหาร</h3>
              <p>{order?.pickupTime ? new Date(order.pickupTime).toLocaleString('th-TH') : 'ไม่ระบุ'}</p>
            </div>

            <div className="info-card">
              <h3>วันที่สั่ง</h3>
              <p>{new Date(order?.createdAt).toLocaleString('th-TH')}</p>
            </div>
          </div>

          {order?.specialRequests && (
            <div className="special-requests">
              <h3>คำขอพิเศษ</h3>
              <p>{order.specialRequests}</p>
            </div>
          )}

          <div className="order-items">
            <h3>รายการอาหาร</h3>
            {order?.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">× {item.quantity}</span>
                </div>
                <span className="item-price">฿{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>ยอดรวม:</strong>
              <strong>฿{order?.totalAmount?.toFixed(2)}</strong>
            </div>
          </div>

          <div className="order-actions">
            {order?.status === 'pending' && (
              <>
                <button 
                  onClick={() => navigate(`/payment/${orderId}`)}
                  className="btn btn-primary"
                >
                  ชำระเงิน
                </button>
                <button 
                  onClick={handleCancelOrder}
                  className="btn btn-secondary"
                  disabled={cancelOrderMutation.isPending}
                >
                  ยกเลิกคำสั่งซื้อ
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
