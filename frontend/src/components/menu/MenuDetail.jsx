import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../common/Modal';
import { getImageUrl } from '../../utils/imageHelper';
import './MenuDetail.css';

const MenuDetail = ({ item, isOpen, onClose, onAddToCart }) => {
  const { t, i18n } = useTranslation();
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    onAddToCart({ ...item, quantity });
    onClose();
    setQuantity(1);
  };

  if (!item) return null;

  const currentLang = i18n.language;
  const displayName = currentLang === 'th' ? item.name : (item.nameEn || item.name);
  const displayDescription = currentLang === 'th' ? item.description : (item.descriptionEn || item.description);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="menu-detail">
        <div className="menu-detail-image">
          {item.image ? (
            <img src={getImageUrl(item.image)} alt={displayName} />
          ) : (
            <div className="menu-detail-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="menu-detail-content">
          <h2 className="menu-detail-name">{displayName}</h2>
          
          {item.category && (
            <span className="menu-detail-category">
              {t(`menu.filter.${item.category}`, item.category)}
            </span>
          )}

          {displayDescription && (
            <p className="menu-detail-description">{displayDescription}</p>
          )}

          {item.allergenInfo && (
            <div className="menu-detail-allergen">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <strong>{t('menu.allergenInfo')}</strong>
                <p>{item.allergenInfo}</p>
              </div>
            </div>
          )}

          <div className="menu-detail-footer">
            <div className="menu-detail-price">
              <span className="price-label">{t('menu.price')}</span>
              <span className="price-value">฿{item.price}</span>
            </div>

            <div className="menu-detail-actions">
              <div className="quantity-selector">
                <button 
                  onClick={handleDecrement} 
                  className="quantity-btn"
                  aria-label="Decrease quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="quantity-value">{quantity}</span>
                <button 
                  onClick={handleIncrement} 
                  className="quantity-btn"
                  aria-label="Increase quantity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary btn-add-to-cart">
                {t('menu.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MenuDetail;
