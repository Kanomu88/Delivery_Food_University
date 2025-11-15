import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    vendorId: items[0]?.vendorId?._id || '',
    pickupTime: '',
    specialRequests: '',
  });
  const [error, setError] = useState('');
  const [quickTimeOption, setQuickTimeOption] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: orderService.createOrder,
    onSuccess: (data) => {
      clearCart();
      navigate(`/payment/${data.data.order._id}`);
    },
    onError: (err) => {
      setError(err.response?.data?.error?.message || t('order.createError'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Get vendor ID from first item
    const vendorId = items[0]?.vendorId?._id || items[0]?.vendorId;
    
    // Prepare order data
    const orderData = {
      vendorId,
      items: items.map(item => ({
        menuItemId: item._id,
        quantity: item.quantity,
      })),
      pickupTime: formData.pickupTime,
      specialRequests: formData.specialRequests,
    };

    createOrderMutation.mutate(orderData);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calculate minimum pickup time (15 minutes from now)
  const getMinPickupTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  };

  // Calculate maximum pickup time (2 hours from now)
  const getMaxPickupTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    return now.toISOString().slice(0, 16);
  };

  // Quick time options
  const handleQuickTime = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const timeString = now.toISOString().slice(0, 16);
    setFormData({ ...formData, pickupTime: timeString });
    setQuickTimeOption(minutes.toString());
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>{t('checkout.title')}</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="checkout-content">
          <div className="order-summary">
            <h2>{t('checkout.orderSummary')}</h2>
            {items.map((item) => (
              <div key={item._id} className="summary-item-wrapper">
                <div className="summary-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.specialRequests && (
                  <div className="item-special-requests">
                    <span className="special-icon">⭐</span>
                    <span className="special-text">{item.specialRequests}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="summary-total">
              <strong>{t('checkout.total')}</strong>
              <strong>฿{total.toFixed(2)}</strong>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>{t('checkout.details')}</h2>
            
            <div className="form-group">
              <label>เวลารับอาหาร</label>
              
              <div className="quick-time-options">
                <button
                  type="button"
                  className={`quick-time-btn ${quickTimeOption === '15' ? 'active' : ''}`}
                  onClick={() => handleQuickTime(15)}
                >
                  <span className="time-icon">⚡</span>
                  <span className="time-text">15 นาที</span>
                </button>
                <button
                  type="button"
                  className={`quick-time-btn ${quickTimeOption === '30' ? 'active' : ''}`}
                  onClick={() => handleQuickTime(30)}
                >
                  <span className="time-icon">🕐</span>
                  <span className="time-text">30 นาที</span>
                </button>
                <button
                  type="button"
                  className={`quick-time-btn ${quickTimeOption === '60' ? 'active' : ''}`}
                  onClick={() => handleQuickTime(60)}
                >
                  <span className="time-icon">🕑</span>
                  <span className="time-text">1 ชั่วโมง</span>
                </button>
                <button
                  type="button"
                  className={`quick-time-btn ${quickTimeOption === '120' ? 'active' : ''}`}
                  onClick={() => handleQuickTime(120)}
                >
                  <span className="time-icon">🕒</span>
                  <span className="time-text">2 ชั่วโมง</span>
                </button>
              </div>

              <div className="custom-time-section">
                <label className="custom-time-label">หรือกำหนดเวลาเอง:</label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={(e) => {
                    handleChange(e);
                    setQuickTimeOption('');
                  }}
                  min={getMinPickupTime()}
                  max={getMaxPickupTime()}
                  required
                  className="custom-time-input"
                />
              </div>
              
              <small className="time-note">
                ⏰ เลือกเวลารับอาหาร (15 นาที - 2 ชั่วโมงจากตอนนี้)
              </small>
            </div>

            <div className="form-group">
              <label>{t('checkout.specialRequests')}</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                rows="4"
                placeholder={t('checkout.specialRequestsPlaceholder')}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? t('common.loading') : t('checkout.placeOrder')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
