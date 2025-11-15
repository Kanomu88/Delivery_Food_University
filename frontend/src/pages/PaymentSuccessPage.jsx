import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService';
import './PaymentSuccessPage.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [countdown, setCountdown] = useState(10);

  const { data: orderData } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/orders/${orderId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orderId, navigate]);

  const order = orderData?.data;

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-animation">
          <div className="checkmark-circle">
            <div className="checkmark"></div>
          </div>
        </div>

        <h1 className="success-title">ชำระเงินสำเร็จ!</h1>
        <p className="success-subtitle">ขอบคุณที่ใช้บริการ</p>

        <div className="order-summary-card">
          <div className="order-header">
            <h2>รายละเอียดคำสั่งซื้อ</h2>
            <span className="order-number">#{order?._id?.slice(-6)}</span>
          </div>

          <div className="order-status-badge preparing">
            <span className="status-icon">👨‍🍳</span>
            <span className="status-text">กำลังเตรียมอาหาร</span>
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-icon">🏪</span>
              <div className="info-content">
                <span className="info-label">ร้านค้า</span>
                <span className="info-value">{order?.vendor?.name || 'ไม่ระบุ'}</span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🕐</span>
              <div className="info-content">
                <span className="info-label">เวลารับอาหาร</span>
                <span className="info-value">
                  {order?.pickupTime 
                    ? new Date(order.pickupTime).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'ไม่ระบุ'}
                </span>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">💰</span>
              <div className="info-content">
                <span className="info-label">ยอดชำระ</span>
                <span className="info-value amount">฿{order?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="order-items-summary">
            <h3>รายการอาหาร ({order?.items?.length || 0} รายการ)</h3>
            <div className="items-list">
              {order?.items?.map((item, index) => (
                <div key={index} className="item-row">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price">฿{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {order?.specialRequests && (
            <div className="special-requests-box">
              <span className="request-icon">📝</span>
              <div className="request-content">
                <span className="request-label">คำขอพิเศษ:</span>
                <p className="request-text">{order.specialRequests}</p>
              </div>
            </div>
          )}
        </div>

        <div className="next-steps">
          <h3>ขั้นตอนถัดไป</h3>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">1</span>
              <span className="step-icon">👨‍🍳</span>
              <p className="step-text">ร้านค้ากำลังเตรียมอาหาร</p>
            </div>
            <div className="step-card">
              <span className="step-number">2</span>
              <span className="step-icon">🔔</span>
              <p className="step-text">คุณจะได้รับการแจ้งเตือนเมื่อพร้อม</p>
            </div>
            <div className="step-card">
              <span className="step-number">3</span>
              <span className="step-icon">🎉</span>
              <p className="step-text">รับอาหารตามเวลาที่กำหนด</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/orders/${orderId}`)}
          >
            ดูรายละเอียดคำสั่งซื้อ
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/menu')}
          >
            สั่งอาหารเพิ่ม
          </button>
        </div>

        <div className="auto-redirect">
          <p>จะนำคุณไปยังหน้ารายละเอียดคำสั่งซื้อใน {countdown} วินาที</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
