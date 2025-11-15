import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { vendorService } from '../services/vendorService';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/common/Loading';
import './VendorReportsPage.css';

const VendorReportsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [popularMenus, setPopularMenus] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [sales, popular] = await Promise.all([
        vendorService.getSalesReport(dateRange),
        vendorService.getPopularMenus(dateRange),
      ]);
      setSalesData(sales);
      setPopularMenus(popular.popularMenus || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      showNotification(error.response?.data?.error?.message || t('vendor.reports.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilter = () => {
    fetchReports();
  };

  const formatCurrency = (amount) => {
    return `฿${amount.toLocaleString()}`;
  };

  if (loading) {
    return <Loading />;
  }

  const handleRequestReport = async () => {
    // Temporary: Show message instead of API call
    showNotification('ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา กรุณาติดต่อแอดมินโดยตรง', 'info');
    
    /* TODO: Enable when backend is ready
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showNotification('ส่งคำขอรายงานสำเร็จ แอดมินจะดำเนินการให้เร็วที่สุด', 'success');
      } else {
        throw new Error(data.error?.message || 'Failed to request report');
      }
    } catch (error) {
      console.error('Request report error:', error);
      showNotification('ไม่สามารถส่งคำขอรายงานได้', 'error');
    }
    */
  };

  return (
    <div className="vendor-reports-page">
      <div className="reports-header">
        <h1>{t('vendor.reports.title')}</h1>
        <button className="request-report-btn" onClick={handleRequestReport}>
          📊 ขอรายงานจากแอดมิน
        </button>
      </div>

      <div className="date-filter">
        <div className="filter-group">
          <label htmlFor="startDate">{t('vendor.reports.startDate')}</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">{t('vendor.reports.endDate')}</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </div>
        <button className="apply-btn" onClick={handleApplyFilter}>
          {t('vendor.reports.apply')}
        </button>
      </div>

      {salesData && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>{formatCurrency(salesData.totalRevenue || 0)}</h3>
                <p>{t('vendor.reports.totalRevenue')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{salesData.totalOrders || 0}</h3>
                <p>{t('vendor.reports.totalOrders')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{formatCurrency(salesData.averageOrderValue || 0)}</h3>
                <p>{t('vendor.reports.averageOrder')}</p>
              </div>
            </div>
          </div>

          {salesData.dailySales && salesData.dailySales.length > 0 && (
            <div className="sales-chart-section">
              <h2>{t('vendor.reports.salesTrend')}</h2>
              <div className="sales-chart">
                {salesData.dailySales.map((day, index) => {
                  const maxRevenue = Math.max(...salesData.dailySales.map(d => d.revenue));
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="chart-bar-container">
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                          title={`${formatCurrency(day.revenue)}`}
                        >
                          <span className="bar-value">{formatCurrency(day.revenue)}</span>
                        </div>
                      </div>
                      <div className="chart-label">
                        {new Date(day.date).toLocaleDateString('th-TH', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="popular-menus-section">
        <h2>{t('vendor.reports.popularMenus')}</h2>
        {popularMenus.length === 0 ? (
          <div className="no-data">
            <p>{t('vendor.reports.noData')}</p>
          </div>
        ) : (
          <div className="popular-menus-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('vendor.reports.menuName')}</th>
                  <th>{t('vendor.reports.quantity')}</th>
                  <th>{t('vendor.reports.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {popularMenus.map((menu, index) => (
                  <tr key={menu._id || index}>
                    <td className="rank">{index + 1}</td>
                    <td className="menu-name">{menu.name}</td>
                    <td className="quantity">{menu.totalQuantity}</td>
                    <td className="revenue">{formatCurrency(menu.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorReportsPage;
