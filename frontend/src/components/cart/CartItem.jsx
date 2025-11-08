import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { getImageUrl } from '../../utils/imageHelper';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item._id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1);
    } else {
      removeFromCart(item._id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item._id);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        {item.image ? (
          <img src={getImageUrl(item.image)} alt={item.name} />
        ) : (
          <div className="cart-item-placeholder">🍽️</div>
        )}
      </div>

      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-price">฿{item.price.toFixed(2)}</p>

        <div className="cart-item-actions">
          <div className="quantity-controls">
            <button 
              className="quantity-btn"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="quantity-value">{item.quantity}</span>
            <button 
              className="quantity-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="cart-item-subtotal">
            ฿{subtotal.toFixed(2)}
          </div>
        </div>
      </div>

      <button 
        className="cart-item-remove"
        onClick={handleRemove}
        aria-label={t('cart.remove')}
      >
        ×
      </button>
    </div>
  );
};

export default CartItem;
