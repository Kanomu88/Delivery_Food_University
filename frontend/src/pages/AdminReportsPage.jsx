import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/common/Loading';
import ReportGeneratorModal from '../components/admin/ReportGeneratorModal';
import ReportEditorModal from '../components/admin/ReportEditorModal';
import './AdminReportsPage.css';

const AdminReportsPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [reportRequests, setReportRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReportRequests();
  }, [filter]);

  const fetchReportRequests = async () => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/reports/requests${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setReportRequests(data.data.reportRequests);
      }
    } catch (error) {
      console.error('Error fetching report requests:', error);
      showNotification('ไม่สามารถโหลดคำขอรายงานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (request) => {
    setSelectedRequest(request);
    setShowGeneratorModal(true);
  };

  const handleEditReport = (request) => {
    setSelectedRequest(request);
    setShowEditorModal(true);
  };

  const handleReportGenerated = () => {
    setShowGeneratorModal(false);
    setSelectedRequest(null);
    fetchReportRequests();
    showNotification('สร้างรายงานสำเร็จ', 'success');
  };

  const handleReportUpdated = () => {
    setShowEditorModal(false);
    setSelectedRequest(null);
    fetchReportRequests();
    showNotification('อัปเดตรายงานสำเร็จ', 'success');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'รอดำเนินการ', className: 'status-pending' },
      processing: { label: 'กำลังดำเนินการ', className: 'status-processing' },
      completed: { label: 'เสร็จสิ้น', className: 'status-completed' },
      rejected: { label: 'ปฏิเสธ', className: 'status-rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-reports-page">
      <div className="reports-header">
        <h1>📊 จัดการรายงาน</h1>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          ทั้งหมด ({reportRequests.length})
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          รอดำเนินการ
        </button>
        <button
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          เสร็จสิ้น
        </button>
      </div>

      <div className="requests-list">
        {reportRequests.length === 0 ? (
          <div className="no-requests">
            <p>ไม่มีคำขอรายงาน</p>
          </div>
        ) : (
          reportRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-info">
                <div className="request-vendor">
                  <h3>🏪 {request.vendorId?.name || 'ไม่ระบุร้านค้า'}</h3>
                  {getStatusBadge(request.status)}
                </div>
                <div className="request-details">
                  <p>
                    <strong>ขอโดย:</strong> {request.requestedBy?.name || 'ไม่ระบุ'}
                  </p>
                  <p>
                    <strong>วันที่ขอ:</strong>{' '}
                    {new Date(request.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {request.processedBy && (
                    <p>
                      <strong>ดำเนินการโดย:</strong> {request.processedBy.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="request-actions">
                {request.status === 'pending' && (
                  <button
                    className="btn-generate"
                    onClick={() => handleGenerateReport(request)}
                  >
                    📝 สร้างรายงาน
                  </button>
                )}
                {request.status === 'completed' && (
                  <button
                    className="btn-edit"
                    onClick={() => handleEditReport(request)}
                  >
                    ✏️ แก้ไข/ดูรายงาน
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showGeneratorModal && (
        <ReportGeneratorModal
          request={selectedRequest}
          onClose={() => {
            setShowGeneratorModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleReportGenerated}
        />
      )}

      {showEditorModal && (
        <ReportEditorModal
          request={selectedRequest}
          onClose={() => {
            setShowEditorModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={handleReportUpdated}
        />
      )}
    </div>
  );
};

export default AdminReportsPage;
