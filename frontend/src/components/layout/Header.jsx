import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Notification from '../common/Notification';
import VendorNotificationBell from '../common/VendorNotificationBell';
import Cart from '../cart/Cart';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { items } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'th' ? 'en' : 'th');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <h1>{t('app.title')}</h1>
        </Link>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {/* Mobile Menu Close Button */}
          <button className="mobile-menu-close" onClick={closeMobileMenu}>
            ✕
          </button>
          
          <Link to="/menu" onClick={closeMobileMenu}>{t('nav.menu')}</Link>
          {user && user.role === 'customer' && (
            <>
              <Link to="/orders" onClick={closeMobileMenu}>{t('nav.orders')}</Link>
              <button
                className="cart-button"
                onClick={() => {
                  setIsCartOpen(true);
                  closeMobileMenu();
                }}
              >
                <span className="cart-icon">🛒</span>
                <span>ตะกร้า</span>
                {items.length > 0 && (
                  <span className="cart-badge">{items.length}</span>
                )}
              </button>
            </>
          )}
          {user && user.role === 'vendor' && (
            <>
              <Link to="/vendor/dashboard" onClick={closeMobileMenu}>{t('nav.dashboard')}</Link>
              <Link to="/vendor/orders" onClick={closeMobileMenu}>{t('nav.orders')}</Link>
              <Link to="/vendor/menu" onClick={closeMobileMenu}>{t('nav.menuManagement')}</Link>
              <Link to="/vendor/reports" onClick={closeMobileMenu}>{t('nav.reports')}</Link>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin" onClick={closeMobileMenu}>{t('nav.dashboard')}</Link>
              <Link to="/admin/users" onClick={closeMobileMenu}>จัดการผู้ใช้</Link>
              <Link to="/admin/vendors" onClick={closeMobileMenu}>จัดการร้านค้า</Link>
              <Link to="/admin/reports" onClick={closeMobileMenu}>รายงาน</Link>
            </>
          )}
          
          {/* User Info in Mobile Menu */}
          {user && (
            <div className="mobile-user-info">
              <span className="mobile-user-name">{user.name || user.email}</span>
              <button onClick={() => { logout(); closeMobileMenu(); }} className="btn btn-secondary mobile-logout-btn">
                {t('auth.logout')}
              </button>
            </div>
          )}
        </nav>

        <div className="header-actions">
          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>

          <button onClick={toggleLanguage} className="btn-lang">
            {i18n.language === 'th' ? 'EN' : 'TH'}
          </button>
          {/* Notification disabled for Vercel deployment */}
          {/* {user && <Notification />} */}
          {user ? (
            <div className="user-menu">
              <span>{user.name || user.email}</span>
              <button onClick={logout} className="btn btn-secondary">
                {t('auth.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              {t('auth.login')}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        />
      )}

      {/* Cart Sidebar */}
      {user && user.role === 'customer' && (
        <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      )}
    </header>
  );
};

export default Header;
