import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { useToast } from '../hooks/useToast';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import './AdminVendorsPage.css';

const AdminVendorsPage = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await adminService.getAllVendors(params);
      setVendors(response.data?.vendors || []);
    } catch (error) {
      showToast(t('admin.vendors.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (vendor, action) => {
    setSelectedVendor(vendor);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleActionConfirm = async () => {
    try {
      if (actionType === 'approve') {
        await adminService.approveVendor(selectedVendor._id);
        showToast(t('admin.vendors.approveSuccess'), 'success');
      } else if (actionType === 'suspend') {
        await adminService.suspendVendor(selectedVendor._id);
        showToast(t('admin.vendors.suspendSuccess'), 'success');
      } else if (actionType === 'unsuspend') {
        await adminService.suspendVendor(selectedVendor._id);
        showToast(t('admin.vendors.unsuspendSuccess'), 'success');
      }
      setShowActionModal(false);
      setSelectedVendor(null);
      setActionType(null);
      fetchVendors();
    } catch (error) {
      showToast(t('admin.vendors.actionError'), 'error');
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowDetailsModal(true);
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-badge status-pending';
      case 'approved':
        return 'status-badge status-approved';
      case 'suspended':
        return 'status-badge status-suspended';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-vendors-page">
      <div className="page-header">
        <h1>{t('admin.vendors.title')}</h1>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('admin.vendors.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('admin.vendors.allStatuses')}</option>
            <option value="pending">{t('admin.vendors.pending')}</option>
            <option value="approved">{t('admin.vendors.approved')}</option>
            <option value="suspended">{t('admin.vendors.suspended')}</option>
          </select>
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <div className="no-vendors">
          <p>{t('admin.vendors.noVendors')}</p>
        </div>
      ) : (
        <div className="vendors-table-container">
          <table className="vendors-table">
            <thead>
              <tr>
                <th>{t('admin.vendors.shopName')}</th>
                <th>{t('admin.vendors.owner')}</th>
                <th>{t('admin.vendors.email')}</th>
                <th>{t('admin.vendors.status')}</th>
                <th>{t('admin.vendors.orders')}</th>
                <th>{t('admin.vendors.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>
                    <strong>{vendor.shopName}</strong>
                  </td>
                  <td>{vendor.userId?.username || '-'}</td>
                  <td>{vendor.userId?.email || '-'}</td>
                  <td>
                    <span className={getStatusBadgeClass(vendor.status)}>
                      {t(`admin.vendors.${vendor.status}`)}
                    </span>
                  </td>
                  <td>{vendor.totalOrders || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetails(vendor)}
                        className="action-btn view-btn"
                      >
                        {t('admin.vendors.viewDetails')}
                      </button>
                      {vendor.status === 'pending' && (
                        <button
                          onClick={() => handleActionClick(vendor, 'approve')}
                          className="action-btn approve-btn"
                        >
                          {t('admin.vendors.approve')}
                        </button>
                      )}
                      {vendor.status === 'approved' && (
                        <button
                          onClick={() => handleActionClick(vendor, 'suspend')}
                          className="action-btn suspend-btn"
                        >
                          {t('admin.vendors.suspend')}
                        </button>
                      )}
                      {vendor.status === 'suspended' && (
                        <button
                          onClick={() => handleActionClick(vendor, 'unsuspend')}
                          className="action-btn approve-btn"
                        >
                          {t('admin.vendors.unsuspend')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showActionModal && selectedVendor && (
        <Modal
          isOpen={showActionModal}
          onClose={() => {
            setShowActionModal(false);
            setSelectedVendor(null);
            setActionType(null);
          }}
          title={t(`admin.vendors.${actionType}Vendor`)}
        >
          <div className="action-modal-content">
            <p>
              {t(`admin.vendors.confirm${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`, {
                shopName: selectedVendor.shopName,
              })}
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedVendor(null);
                  setActionType(null);
                }}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleActionConfirm}
                className={
                  actionType === 'suspend' ? 'btn-danger' : 'btn-primary'
                }
              >
                {t(`admin.vendors.${actionType}`)}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showDetailsModal && selectedVendor && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVendor(null);
          }}
          title={t('admin.vendors.vendorDetails')}
        >
          <div className="vendor-details-content">
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.shopName')}:</span>
              <span className="detail-value">{selectedVendor.shopName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.owner')}:</span>
              <span className="detail-value">{selectedVendor.userId?.username || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.email')}:</span>
              <span className="detail-value">{selectedVendor.userId?.email || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.status')}:</span>
              <span className={getStatusBadgeClass(selectedVendor.status)}>
                {t(`admin.vendors.${selectedVendor.status}`)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.description')}:</span>
              <span className="detail-value">{selectedVendor.description || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.totalOrders')}:</span>
              <span className="detail-value">{selectedVendor.totalOrders || 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.totalRevenue')}:</span>
              <span className="detail-value">
                ฿{selectedVendor.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">{t('admin.vendors.joinedDate')}:</span>
              <span className="detail-value">
                {new Date(selectedVendor.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminVendorsPage;
