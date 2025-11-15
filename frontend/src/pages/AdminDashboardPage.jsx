import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/common/Loading';
import './AdminDashboardPage.css';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
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
      const response = await adminService.getDashboardStats();
      console.log('Admin dashboard data:', response);
      setDashboardData(response.data || {});
    } catch (error) {
      console.error('Dashboard error:', error);
      showNotification('ไม่สามารถโหลดข้อมูลได้', 'error');
      // Set default data
      setDashboardData({
        totalUsers: 0,
        totalVendors: 0,
        totalMenus: 0,
        totalOrders: 0,
        totalRevenue: 0
      });
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
        <h1>แดชบอร์ดผู้ดูแลระบบ</h1>
      </div>

      <div className={`dashboard-stats ${statsAnimated ? 'animated' : ''}`}>
        <div className="stat-card" style={{ '--delay': '0.1s' }}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalUsers || 0}</h3>
            <p>ผู้ใช้ทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.2s' }}>
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalVendors || 0}</h3>
            <p>ร้านค้าทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.3s' }}>
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalMenus || 0}</h3>
            <p>เมนูทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.4s' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalOrders || 0}</h3>
            <p>คำสั่งซื้อทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.5s' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-number">฿{dashboardData?.totalRevenue?.toLocaleString() || 0}</h3>
            <p>รายได้ทั้งหมด</p>
          </div>
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
