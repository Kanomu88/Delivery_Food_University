import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../hooks/useCart';
import { getImageUrl } from '../utils/imageHelper';

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="empty-cart">
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.emptyMessage')}</p>
          <button onClick={() => navigate('/menu')} className="btn btn-primary">
            {t('cart.browseMenu')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>{t('cart.title')}</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                {item.image && <img src={getImageUrl(item.image)} alt={item.name} />}
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="price">฿{item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">
                  ฿{(item.price * item.quantity).toFixed(2)}
                </div>
                <button 
                  onClick={() => removeFromCart(item._id)} 
                  className="btn-remove"
                  aria-label={t('cart.remove')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>{t('cart.summary')}</h3>
            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>{t('cart.total')}</span>
              <span>฿{total.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')} 
              className="btn btn-primary btn-block"
            >
              {t('cart.checkout')}
            </button>
            <button 
              onClick={clearCart} 
              className="btn btn-secondary btn-block"
            >
              {t('cart.clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
