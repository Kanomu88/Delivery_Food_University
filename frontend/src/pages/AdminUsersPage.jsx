import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminService } from '../services/adminService';
import { useNotification } from '../contexts/NotificationContext';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await adminService.getAllUsers(params);
      
      // รองรับทั้ง 2 format: { data: { users: [...] } } และ { data: [...] }
      const usersData = response.data?.users || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      showNotification(t('admin.users.loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const handleBanConfirm = async () => {
    try {
      await adminService.toggleUserBan(selectedUser._id);
      showNotification(
        selectedUser.status === 'banned'
          ? t('admin.users.unbanSuccess')
          : t('admin.users.banSuccess'),
        'success'
      );
      setShowBanModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      showNotification(t('admin.users.banError'), 'error');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'suspended':
        return 'status-badge status-suspended';
      case 'banned':
        return 'status-badge status-banned';
      default:
        return 'status-badge';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'role-badge role-admin';
      case 'vendor':
        return 'role-badge role-vendor';
      case 'customer':
        return 'role-badge role-customer';
      default:
        return 'role-badge';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>{t('admin.users.title')}</h1>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('admin.users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('admin.users.allRoles')}</option>
            <option value="customer">{t('auth.customer')}</option>
            <option value="vendor">{t('auth.vendor')}</option>
            <option value="admin">{t('admin.users.admin')}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{t('admin.users.allStatuses')}</option>
            <option value="active">{t('admin.users.active')}</option>
            <option value="suspended">{t('admin.users.suspended')}</option>
            <option value="banned">{t('admin.users.banned')}</option>
          </select>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-users">
          <p>{t('admin.users.noUsers')}</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('admin.users.username')}</th>
                <th>{t('admin.users.email')}</th>
                <th>{t('admin.users.name')}</th>
                <th>{t('admin.users.role')}</th>
                <th>{t('admin.users.status')}</th>
                <th>{t('admin.users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : '-'}
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(user.role)}>
                      {t(`auth.${user.role}`)}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(user.status)}>
                      {t(`admin.users.${user.status}`)}
                    </span>
                  </td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleBanClick(user)}
                        className={
                          user.status === 'banned'
                            ? 'action-btn unban-btn'
                            : 'action-btn ban-btn'
                        }
                      >
                        {user.status === 'banned'
                          ? t('admin.users.unban')
                          : t('admin.users.ban')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showBanModal && selectedUser && (
        <Modal
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false);
            setSelectedUser(null);
          }}
          title={
            selectedUser.status === 'banned'
              ? t('admin.users.unbanUser')
              : t('admin.users.banUser')
          }
        >
          <div className="ban-modal-content">
            <p>
              {selectedUser.status === 'banned'
                ? t('admin.users.confirmUnban', { username: selectedUser.username })
                : t('admin.users.confirmBan', { username: selectedUser.username })}
            </p>
            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
                className="btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleBanConfirm}
                className={
                  selectedUser.status === 'banned' ? 'btn-primary' : 'btn-danger'
                }
              >
                {selectedUser.status === 'banned'
                  ? t('admin.users.unban')
                  : t('admin.users.ban')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;
