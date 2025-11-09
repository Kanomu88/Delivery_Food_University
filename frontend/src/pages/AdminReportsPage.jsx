import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/common/Loading';
import './AdminReportsPage.css';

const AdminReportsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    
    fetchReports(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  }, []);

  const fetchReports = async (start, end) => {
    try {
      setLoading(true);
      const params = {};
      if (start) params.startDate = start;
      if (end) params.endDate = end;
      
      const response = await adminService.getSystemReports(params);
      setReportData(response.data || {});
    } catch (error) {
      showNotification(t('admin.reports.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        showNotification('Start date must be before end date', 'error');
        return;
      }
      fetchReports(startDate, endDate);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-reports-page">
      <div className="page-header">
        <h1>{t('admin.reports.title')}</h1>
      </div>

      <div className="date-filter-section">
        <div className="date-filter-group">
          <div className="date-input-group">
            <label>{t('admin.reports.startDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label>{t('admin.reports.endDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button onClick={handleApplyFilter} className="apply-btn">
            {t('admin.reports.apply')}
          </button>
        </div>
      </div>

      <div className="reports-content">
        <section className="overview-section">
          <h2>{t('admin.reports.systemOverview')}</h2>
          <div className="overview-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{reportData?.users?.total || 0}</h3>
                <p>{t('admin.reports.totalUsers')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <h3>{reportData?.vendors?.total || 0}</h3>
                <p>{t('admin.reports.totalVendors')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{reportData?.orders?.total || 0}</h3>
                <p>{t('admin.reports.totalOrders')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>฿{reportData?.revenue?.total?.toLocaleString() || 0}</h3>
                <p>{t('admin.reports.totalRevenue')}</p>
              </div>
            </div>
          </div>
        </section>

        {reportData?.topVendors && reportData.topVendors.length > 0 && (
          <section className="vendor-stats-section">
            <h2>{t('admin.reports.ordersByVendor')}</h2>
            <div className="vendor-stats-table-container">
              <table className="vendor-stats-table">
                <thead>
                  <tr>
                    <th>{t('admin.reports.vendorName')}</th>
                    <th>{t('admin.reports.orders')}</th>
                    <th>{t('admin.reports.revenue')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topVendors.map((vendor, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{vendor.vendorName || '-'}</strong>
                      </td>
                      <td>{vendor.totalOrders || 0}</td>
                      <td>฿{vendor.totalRevenue?.toLocaleString() || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {reportData?.dailyStats && reportData.dailyStats.length > 0 && (
          <section className="daily-stats-section">
            <h2>{t('admin.reports.dailyOrders')}</h2>
            <div className="chart-container">
              <div className="bar-chart">
                {reportData.dailyStats.map((day, index) => {
                  const maxOrders = Math.max(...reportData.dailyStats.map(d => d.orders || 0));
                  const height = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
                  
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar" 
                          style={{ height: `${height}%` }}
                          title={`${day.orders} orders`}
                        >
                          <span className="bar-value">{day.orders}</span>
                        </div>
                      </div>
                      <div className="bar-label">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {reportData?.dailyStats && reportData.dailyStats.length > 0 && (
          <section className="daily-revenue-section">
            <h2>{t('admin.reports.dailyRevenue')}</h2>
            <div className="chart-container">
              <div className="bar-chart">
                {reportData.dailyStats.map((day, index) => {
                  const maxRevenue = Math.max(...reportData.dailyStats.map(d => d.revenue || 0));
                  const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar bar-revenue" 
                          style={{ height: `${height}%` }}
                          title={`฿${day.revenue?.toLocaleString()}`}
                        >
                          <span className="bar-value">฿{day.revenue?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="bar-label">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {(!reportData?.topVendors || reportData.topVendors.length === 0) &&
         (!reportData?.dailyStats || reportData.dailyStats.length === 0) && (
          <div className="no-data">
            <p>{t('admin.reports.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
