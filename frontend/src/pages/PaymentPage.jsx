import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import Loading from '../components/common/Loading';
import { useToast } from '../hooks/useToast';
import './PaymentPage.css';

const PaymentPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
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
      showToast(t('payment.initiated'), 'success');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || t('payment.error');
      const errorDetails = error.response?.data?.error?.details;
      
      setPaymentError({
        message: errorMessage,
        details: errorDetails,
      });
      
      showToast(errorMessage, 'error');
    },
  });

  const retryPaymentMutation = useMutation({
    mutationFn: paymentService.retryPayment,
    onSuccess: (data) => {
      setPaymentData(data.data);
      setPaymentError(null);
      showToast(t('payment.retrySuccess'), 'success');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || t('payment.retryError');
      const errorDetails = error.response?.data?.error?.details;
      
      setPaymentError({
        message: errorMessage,
        details: errorDetails,
      });
      
      showToast(errorMessage, 'error');
    },
  });

  const mockPaymentMutation = useMutation({
    mutationFn: paymentService.mockPaymentSuccess,
    onSuccess: () => {
      navigate(`/orders/${orderId}`);
    },
  });

  const handleInitiatePayment = () => {
    initiatePaymentMutation.mutate({
      orderId,
      method: selectedMethod,
    });
  };

  const handleMockPayment = () => {
    mockPaymentMutation.mutate(orderId);
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
            <h2>{t('payment.orderInfo')}</h2>
            <p><strong>{t('payment.orderNumber')}:</strong> {order?.orderNumber}</p>
            <p><strong>{t('payment.amount')}:</strong> ฿{order?.totalAmount?.toFixed(2)}</p>
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

              <div className="mock-payment">
                <p>{t('payment.testMode')}</p>
                <button 
                  onClick={handleMockPayment}
                  className="btn btn-secondary"
                  disabled={mockPaymentMutation.isPending}
                >
                  {t('payment.mockSuccess')}
                </button>
              </div>
            </div>
          ) : paymentData ? (
            <div className="payment-display">
              {selectedMethod === 'qr_code' && paymentData.qrCode && (
                <div className="qr-payment">
                  <h2>{t('payment.scanQR')}</h2>
                  <img src={paymentData.qrCode} alt="QR Code" className="qr-code" />
                  <p>{t('payment.transactionId')}: {paymentData.transactionId}</p>
                </div>
              )}

              {selectedMethod === 'debit_card' && paymentData.paymentUrl && (
                <div className="card-payment">
                  <h2>{t('payment.redirecting')}</h2>
                  <p>{t('payment.redirectMessage')}</p>
                  <a href={paymentData.paymentUrl} className="btn btn-primary">
                    {t('payment.goToPayment')}
                  </a>
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
