import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vendorService } from '../services/vendorService';
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
      
      // Use vendorService which handles auth automatically
      const result = await vendorService.getVendorDashboard();
      console.log('Dashboard data:', result);
      
      if (result.success) {
        setDashboardData(result.data);
        setIsAcceptingOrders(result.data.isAcceptingOrders ?? true);
      } else {
        throw new Error(result.error?.message || 'Failed to load dashboard');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      // Set default data
      setDashboardData({
        totalMenus: 0,
        totalOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrderAcceptance = async () => {
    try {
      const newStatus = !isAcceptingOrders;
      
      // Update locally first for immediate feedback
      setIsAcceptingOrders(newStatus);
      
      // Save to localStorage
      localStorage.setItem('vendorAcceptingOrders', newStatus.toString());
      
      console.log('Order acceptance toggled:', newStatus);
      
      // TODO: Call API to save to backend when endpoint is ready
      // const response = await fetch(import.meta.env.VITE_API_URL + '/vendors/toggle-acceptance', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ isAcceptingOrders: newStatus })
      // });
    } catch (error) {
      console.error('Toggle error:', error);
      // Revert on error
      setIsAcceptingOrders(!isAcceptingOrders);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="vendor-dashboard-page">
      <div className="dashboard-header">
        <h1>แดชบอร์ดร้านค้า</h1>
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
              ? 'เปิดรับคำสั่งซื้อ' 
              : 'ปิดรับคำสั่งซื้อ'}
          </span>
        </div>
      </div>

      <div className={`dashboard-stats ${statsAnimated ? 'animated' : ''}`}>
        <div className="stat-card" style={{ '--delay': '0.1s' }}>
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalMenus || 0}</h3>
            <p>เมนูทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.2s' }}>
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.totalOrders || 0}</h3>
            <p>คำสั่งซื้อทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.3s' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3 className="stat-number">฿{dashboardData?.totalRevenue?.toLocaleString() || 0}</h3>
            <p>รายได้ทั้งหมด</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--delay': '0.4s' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData?.todayOrders || 0}</h3>
            <p>คำสั่งซื้อวันนี้</p>
          </div>
        </div>
      </div>

      <div className="dashboard-navigation">
        <Link to="/vendor/orders" className="nav-card" style={{ '--delay': '0.5s' }}>
          <div className="nav-icon">📋</div>
          <div className="nav-content">
            <h3>คำสั่งซื้อ</h3>
            <p>จัดการคำสั่งซื้อและอัปเดตสถานะ</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/vendor/menu" className="nav-card" style={{ '--delay': '0.6s' }}>
          <div className="nav-icon">🍽️</div>
          <div className="nav-content">
            <h3>จัดการเมนู</h3>
            <p>เพิ่ม แก้ไข หรือลบเมนูอาหาร</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
        <Link to="/vendor/reports" className="nav-card" style={{ '--delay': '0.7s' }}>
          <div className="nav-icon">📊</div>
          <div className="nav-content">
            <h3>รายงาน</h3>
            <p>ดูรายงานยอดขายและสถิติ</p>
          </div>
          <div className="nav-arrow">→</div>
        </Link>
      </div>
    </div>
  );
};

export default VendorDashboardPage;