import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import './RegisterPage.css';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    firstName: '',
    lastName: '',
    phone: '',
  });
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
      await authService.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error?.message || t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <h2>📝 {t('auth.register')}</h2>
        {error && <div className="error-message">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 {t('auth.username')}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="กรอกชื่อผู้ใช้"
              required
            />
          </div>

          <div className="form-group">
            <label>📧 {t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>🔒 {t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label>🎭 {t('auth.role')}</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="customer">🛒 {t('auth.customer')}</option>
              <option value="vendor">🏪 {t('auth.vendor')}</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>✏️ {t('auth.firstName')}</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="ชื่อ"
              />
            </div>
            <div className="form-group">
              <label>✏️ {t('auth.lastName')}</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="นามสกุล"
              />
            </div>
          </div>

          ท

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ กำลังสมัคร...' : '🚀 ' + t('auth.register')}
          </button>
        </form>
        <p className="auth-link">
          {t('auth.hasAccount')} <Link to="/login">👉 {t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
