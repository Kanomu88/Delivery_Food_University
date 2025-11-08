import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { orderService } from '../services/orderService';

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
              <div key={item._id} className="summary-item">
                <span>{item.name} × {item.quantity}</span>
                <span>฿{(item.price * item.quantity).toFixed(2)}</span>
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
              <label>{t('checkout.pickupTime')}</label>
              <input
                type="datetime-local"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleChange}
                min={getMinPickupTime()}
                required
              />
              <small>{t('checkout.pickupTimeNote')}</small>
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
