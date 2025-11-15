import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import { useNotification } from '../contexts/NotificationContext';
import './PaymentPage.css';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [selectedMethod, setSelectedMethod] = useState('qr_code');
  const [paymentData, setPaymentData] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrderById(orderId),
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: paymentService.initiatePayment,
    onSuccess: (data) => {
      setPaymentData(data.data);
      setPaymentError(null);
      showNotification(t('payment.initiated'), 'success');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || t('payment.error');
      const errorDetails = error.response?.data?.error?.details;
      
      setPaymentError({
        message: errorMessage,
        details: errorDetails,
      });
      
      showNotification(errorMessage, 'error');
    },
  });

  const retryPaymentMutation = useMutation({
    mutationFn: paymentService.retryPayment,
    onSuccess: (data) => {
      setPaymentData(data.data);
      setPaymentError(null);
      showNotification(t('payment.retrySuccess'), 'success');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || t('payment.retryError');
      const errorDetails = error.response?.data?.error?.details;
      
      setPaymentError({
        message: errorMessage,
        details: errorDetails,
      });
      
      showNotification(errorMessage, 'error');
    },
  });

  const processPaymentMutation = useMutation({
    mutationFn: ({ orderId, paymentMethod }) => 
      paymentService.processPayment(orderId, paymentMethod),
    onSuccess: () => {
      // Redirect to success page
      navigate(`/payment-success/${orderId}`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการชำระเงิน';
      showNotification(errorMessage, 'error');
    },
  });

  const handleInitiatePayment = () => {
    // Simulate payment initiation
    setPaymentData({
      transactionId: `TXN${Date.now()}`,
      qrCode: selectedMethod === 'qr_code' 
        ? 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAYMENT_' + orderId
        : null,
      paymentUrl: selectedMethod === 'debit_card'
        ? '#'
        : null,
    });
  };

  const handleConfirmPayment = () => {
    processPaymentMutation.mutate({
      orderId,
      paymentMethod: selectedMethod,
    });
  };

  const handleRetryPayment = () => {
    if (paymentError?.details?.paymentId) {
      retryPaymentMutation.mutate(paymentError.details.paymentId);
    }
  };

  if (isLoading) return <Loading />;

  const order = orderData?.data?.order;

  return (
    <div className="payment-page">
      <div className="container">
        <h1>{t('payment.title')}</h1>

        <div className="payment-content">
          <div className="order-info">
            <h2>ข้อมูลคำสั่งซื้อ</h2>
            <div className="info-row">
              <span className="info-label">หมายเลขคำสั่งซื้อ:</span>
              <span className="info-value">#{order?._id?.slice(-6)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">จำนวนรายการ:</span>
              <span className="info-value">{order?.items?.length} รายการ</span>
            </div>
            <div className="info-row total-row">
              <span className="info-label">ยอดชำระ:</span>
              <span className="info-value amount">฿{order?.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {paymentError && (
            <div className="payment-error">
              <div className="error-icon">⚠️</div>
              <h2>{t('payment.errorTitle')}</h2>
              <p className="error-message">{paymentError.message}</p>
              
              {paymentError.details?.totalAttempts && (
                <p className="error-attempts">
                  {t('payment.attempts')}: {paymentError.details.totalAttempts}
                </p>
              )}

              {paymentError.details?.canRetry && (
                <div className="error-actions">
                  <button 
                    onClick={handleRetryPayment}
                    className="btn btn-primary"
                    disabled={retryPaymentMutation.isPending}
                  >
                    {retryPaymentMutation.isPending ? t('common.loading') : t('payment.retry')}
                  </button>
                  <button 
                    onClick={() => {
                      setPaymentError(null);
                      setPaymentData(null);
                    }}
                    className="btn btn-secondary"
                  >
                    {t('payment.changeMethod')}
                  </button>
                </div>
              )}

              <button 
                onClick={() => navigate('/orders')}
                className="btn btn-link"
              >
                {t('payment.backToOrders')}
              </button>
            </div>
          )}

          {!paymentData && !paymentError ? (
            <div className="payment-methods">
              <h2>{t('payment.selectMethod')}</h2>
              
              <div className="method-options">
                <label className={`method-option ${selectedMethod === 'qr_code' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr_code"
                    checked={selectedMethod === 'qr_code'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <h3>{t('payment.qrCode')}</h3>
                    <p>{t('payment.qrCodeDesc')}</p>
                  </div>
                </label>

                <label className={`method-option ${selectedMethod === 'debit_card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit_card"
                    checked={selectedMethod === 'debit_card'}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                  />
                  <div className="method-content">
                    <h3>{t('payment.debitCard')}</h3>
                    <p>{t('payment.debitCardDesc')}</p>
                  </div>
                </label>
              </div>

              <button 
                onClick={handleInitiatePayment}
                className="btn btn-primary btn-block"
                disabled={initiatePaymentMutation.isPending}
              >
                {initiatePaymentMutation.isPending ? t('common.loading') : t('payment.proceed')}
              </button>


            </div>
          ) : paymentData ? (
            <div className="payment-display">
              {selectedMethod === 'qr_code' && paymentData.qrCode && (
                <div className="qr-payment">
                  <h2>สแกน QR Code เพื่อชำระเงิน</h2>
                  <img src={paymentData.qrCode} alt="QR Code" className="qr-code" />
                  <p>รหัสธุรกรรม: {paymentData.transactionId}</p>
                  <p className="payment-amount">ยอดชำระ: ฿{order?.totalAmount?.toFixed(2)}</p>
                  <button 
                    onClick={handleConfirmPayment}
                    className="btn btn-primary btn-block"
                    disabled={processPaymentMutation.isPending}
                  >
                    {processPaymentMutation.isPending ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                  </button>
                </div>
              )}

              {selectedMethod === 'debit_card' && (
                <div className="card-payment">
                  <h2>ชำระเงินด้วยบัตรเดบิต</h2>
                  <div className="card-form">
                    <div className="form-group">
                      <label>หมายเลขบัตร</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="form-control" />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>วันหมดอายุ</label>
                        <input type="text" placeholder="MM/YY" className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>CVV</label>
                        <input type="text" placeholder="123" className="form-control" />
                      </div>
                    </div>
                    <p className="payment-amount">ยอดชำระ: ฿{order?.totalAmount?.toFixed(2)}</p>
                    <button 
                      onClick={handleConfirmPayment}
                      className="btn btn-primary btn-block"
                      disabled={processPaymentMutation.isPending}
                    >
                      {processPaymentMutation.isPending ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
