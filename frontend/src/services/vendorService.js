import api from './api';

export const vendorService = {
  createVendor: async (vendorData) => {
    const response = await api.post('/vendors', vendorData);
    return response.data;
  },

  getVendorById: async (id) => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  updateVendor: async (id, vendorData) => {
    const response = await api.put(`/vendors/${id}`, vendorData);
    return response.data;
  },

  toggleOrderAcceptance: async () => {
    const response = await api.put('/vendors/status/toggle');
    return response.data;
  },

  getVendorDashboard: async () => {
    const response = await api.get('/vendors/dashboard');
    return response.data;
  },

  getSalesReport: async (params = {}) => {
    const response = await api.get('/vendors/reports/sales', { params });
    return response.data;
  },

  getPopularMenus: async (params = {}) => {
    const response = await api.get('/vendors/reports/popular-menus', { params });
    return response.data;
  },

  requestReport: async () => {
    const response = await api.post('/reports/request');
    return response.data;
  },
};
