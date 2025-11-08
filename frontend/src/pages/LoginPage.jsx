import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h2>{t('auth.login')}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : t('auth.login')}
          </button>
        </form>
        <p className="auth-link">
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>

        {/* Demo Accounts */}
        <div className="demo-accounts">
          <h4>🔑 บัญชีทดสอบ (Demo Accounts)</h4>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            คลิกปุ่มด้านล่างเพื่อกรอกข้อมูลอัตโนมัติ
          </p>
          <div className="demo-account">
            <strong>👤 ลูกค้า (Customer)</strong>
            <div><code>customer@test.com</code> / <code>password123</code></div>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '5px', fontSize: '0.85em' }}
              onClick={() => setFormData({ email: 'customer@test.com', password: 'password123' })}
            >
              ใช้บัญชีนี้
            </button>
          </div>
          <div className="demo-account">
            <strong>🏪 ร้านค้า (Vendor)</strong>
            <div><code>vendor1@canteen.com</code> / <code>password123</code></div>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '5px', fontSize: '0.85em' }}
              onClick={() => setFormData({ email: 'vendor1@canteen.com', password: 'password123' })}
            >
              ใช้บัญชีนี้
            </button>
          </div>
          <div className="demo-account">
            <strong>👨‍💼 แอดมิน (Admin)</strong>
            <div><code>admin@canteen.com</code> / <code>password123</code></div>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '5px', fontSize: '0.85em' }}
              onClick={() => setFormData({ email: 'admin@canteen.com', password: 'password123' })}
            >
              ใช้บัญชีนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
