import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import Loading from '../components/common/Loading';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
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
      const response = await adminService.getSystemReports();
      setDashboardData(response.data || {});
    } catch (error) {
      showToast(t('admin.dashboard.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="dashboard-header">
        <h1>{t('admin.dashboard.title')}</h1>
      </div>

      <div className={`dashboard-stats ${statsAnimated ? 'animated' : ''}`}>
        <div className="stat-card" style={{ '--delay': '0.1s' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.users?.total || 0}</h3>
            <p>{t('admin.dashboard.totalUsers')}</p>
          </div>
          <div className="stat-badge info">Active</div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.2s' }}>
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.vendors?.total || 0}</h3>
            <p>{t('admin.dashboard.totalVendors')}</p>
          </div>
          <div className="stat-trend positive">+{dashboardData?.vendors?.pending || 0} pending</div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.3s' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.orders?.total || 0}</h3>
            <p>{t('admin.dashboard.totalOrders')}</p>
          </div>
          <div className="stat-trend positive">+15%</div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.4s' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-number">฿{dashboardData?.revenue?.total?.toLocaleString() || 0}</h3>
            <p>{t('admin.dashboard.totalRevenue')}</p>
          </div>
          <div className="stat-trend positive">+22%</div>
        </div>
      </div>

      <div className="dashboard-navigation">
        <Link to="/admin/users" className="nav-card" style={{ '--delay': '0.5s' }}>
          <div className="nav-icon">👥</div>
          <div className="nav-content">
            <h3>{t('admin.dashboard.userManagement')}</h3>
            <p>{t('admin.dashboard.userManagementDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/admin/vendors" className="nav-card" style={{ '--delay': '0.6s' }}>
          <div className="nav-icon">🏪</div>
          <div className="nav-content">
            <h3>{t('admin.dashboard.vendorManagement')}</h3>
            <p>{t('admin.dashboard.vendorManagementDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/admin/reports" className="nav-card" style={{ '--delay': '0.7s' }}>
          <div className="nav-icon">📊</div>
          <div className="nav-content">
            <h3>{t('admin.dashboard.systemReports')}</h3>
            <p>{t('admin.dashboard.systemReportsDesc')}</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
