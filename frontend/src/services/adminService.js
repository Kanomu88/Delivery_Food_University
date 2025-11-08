import api from './api';

export const adminService = {
  // User management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  toggleUserBan: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/ban`);
    return response.data;
  },

  // Vendor management
  getAllVendors: async (params = {}) => {
    const response = await api.get('/admin/vendors', { params });
    return response.data;
  },

  approveVendor: async (vendorId) => {
    const response = await api.put(`/admin/vendors/${vendorId}/approve`);
    return response.data;
  },

  suspendVendor: async (vendorId) => {
    const response = await api.put(`/admin/vendors/${vendorId}/suspend`);
    return response.data;
  },

  // Order management
  getAllOrders: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  // Reports
  getSystemReports: async (params = {}) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },
};
