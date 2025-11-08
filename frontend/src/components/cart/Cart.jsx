import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import './Cart.css';

const Cart = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total } = useCart();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`cart-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />
      
      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>{t('cart.title')}</h2>
          <button 
            className="cart-close" 
            onClick={onClose}
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="empty-illustration">🛒</div>
              <h3>{t('cart.empty')}</h3>
              <p>{t('cart.emptyMessage')}</p>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{t('cart.total')}</span>
              <span className="total-amount">฿{total.toFixed(2)}</span>
            </div>
            <button 
              className="btn btn-primary btn-checkout"
              onClick={handleCheckout}
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
