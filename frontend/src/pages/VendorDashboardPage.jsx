import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Loading from '../components/common/Loading';
import './VendorDashboardPage.css';

const VendorDashboardPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [statsAnimated, setStatsAnimated] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardData) {
      setTimeout(() => setStatsAnimated(true), 100);
    }
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for demo (API not implemented yet)
      const data = {
        todayOrders: 12,
        todayRevenue: 3450,
        pendingOrders: 3,
        vendor: {
          isAcceptingOrders: true
        }
      };
      setDashboardData(data);
      setIsAcceptingOrders(data.vendor?.isAcceptingOrders ?? true);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrderAcceptance = async () => {
    try {
      // Toggle locally (API not implemented yet)
      const newStatus = !isAcceptingOrders;
      setIsAcceptingOrders(newStatus);
      console.log('Order acceptance toggled:', newStatus);
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="dashboard-header">
        <h1>{t('vendor.dashboard.title')}</h1>
        <div className="order-acceptance-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isAcceptingOrders}
              onChange={handleToggleOrderAcceptance}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`toggle-label ${isAcceptingOrders ? 'active' : ''}`}>
            {isAcceptingOrders 
              ? t('vendor.dashboard.acceptingOrders') 
              : t('vendor.dashboard.notAcceptingOrders')}
          </span>
        </div>
      </div>

      <div className={`dashboard-stats ${statsAnimated ? 'animated' : ''}`}>
        <div className="stat-card" style={{ '--delay': '0.1s' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.todayOrders || 0}</h3>
            <p>{t('vendor.dashboard.todayOrders')}</p>
          </div>
          <div className="stat-trend positive">+12%</div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.2s' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-number">฿{dashboardData?.todayRevenue?.toLocaleString() || 0}</h3>
            <p>{t('vendor.dashboard.todayRevenue')}</p>
          </div>
          <div className="stat-trend positive">+8%</div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.3s' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.pendingOrders || 0}</h3>
            <p>{t('vendor.dashboard.pendingOrders')}</p>
          </div>
          <div className="stat-badge urgent">{t('common.urgent')}</div>
        </div>
      </div>

      <div className="dashboard-navigation">
        <Link to="/vendor/orders" className="nav-card" style={{ '--delay': '0.4s' }}>
          <div className="nav-icon">📋</div>
          <div className="nav-content">
            <h3>{t('vendor.dashboard.orderQueue')}</h3>
            <p>{t('vendor.dashboard.orderQueueDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/vendor/menu" className="nav-card" style={{ '--delay': '0.5s' }}>
          <div className="nav-icon">🍽️</div>
          <div className="nav-content">
            <h3>{t('vendor.dashboard.menuManagement')}</h3>
            <p>{t('vendor.dashboard.menuManagementDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/vendor/reports" className="nav-card" style={{ '--delay': '0.6s' }}>
          <div className="nav-icon">📊</div>
          <div className="nav-content">
            <h3>{t('vendor.dashboard.salesReports')}</h3>
            <p>{t('vendor.dashboard.salesReportsDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboardPage;