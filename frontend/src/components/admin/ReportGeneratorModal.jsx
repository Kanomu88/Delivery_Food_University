import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './ReportGeneratorModal.css';

const ReportGeneratorModal = ({ request, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(request?.vendorId?._id || '');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/vendors`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setVendors(data.data.vendors);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showNotification('ไม่สามารถโหลดรายชื่อร้านค้าได้', 'error');
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedVendor) {
      showNotification('กรุณาเลือกร้านค้า', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/generate/${request._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            vendorId: selectedVendor,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setReportData(data.data.reportData);
        showNotification('สร้างรายงานสำเร็จ', 'success');
      } else {
        throw new Error(data.error?.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Generate report error:', error);
      showNotification('ไม่สามารถสร้างรายงานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    onSuccess();
  };

  const formatCurrency = (amount) => {
    return `฿${amount?.toLocaleString() || 0}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content report-generator-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📝 สร้างรายงาน</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {!reportData ? (
            <>
              <div className="form-group">
                <label>เลือกร้านค้า</label>
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  disabled={request?.vendorId?._id}
                >
                  <option value="">-- เลือกร้านค้า --</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="date-range-group">
                <div className="form-group">
                  <label>วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                className="btn-generate-report"
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? 'กำลังสร้างรายงาน...' : '🔍 สร้างรายงาน'}
              </button>
            </>
          ) : (
            <div className="report-preview">
              <div className="report-section">
                <h3>ข้อมูลร้านค้า</h3>
                <p><strong>ชื่อร้าน:</strong> {reportData.vendor.name}</p>
                <p><strong>สถานที่:</strong> {reportData.vendor.location}</p>
              </div>

              <div className="report-section">
                <h3>ช่วงเวลา</h3>
                <p>
                  {new Date(reportData.period.startDate).toLocaleDateString('th-TH')} -{' '}
                  {new Date(reportData.period.endDate).toLocaleDateString('th-TH')}
                </p>
              </div>

              <div className="report-section">
                <h3>สรุปยอดขาย</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">รายได้รวม</span>
                    <span className="summary-value">
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">จำนวนออเดอร์</span>
                    <span className="summary-value">{reportData.summary.totalOrders}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">ค่าเฉลี่ยต่อออเดอร์</span>
                    <span className="summary-value">
                      {formatCurrency(reportData.summary.averageOrderValue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>เมนูขายดี (Top 10)</h3>
                <div className="popular-menus-list">
                  {reportData.popularMenus.map((menu, index) => (
                    <div key={index} className="menu-item">
                      <span className="menu-rank">#{index + 1}</span>
                      <span className="menu-name">{menu.name}</span>
                      <span className="menu-quantity">{menu.quantity} ชิ้น</span>
                      <span className="menu-revenue">{formatCurrency(menu.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-save" onClick={handleSaveAndClose}>
                  ✅ บันทึกและปิด
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorModal;
