import api from './api';

export const canteenService = {
  getAllCanteens: async () => {
    const response = await api.get('/canteens');
    return response.data;
  },

  getCanteenById: async (id) => {
    const response = await api.get(`/canteens/${id}`);
    return response.data;
  },

  getVendorsByCanteen: async (canteenId) => {
    const response = await api.get(`/canteens/${canteenId}/vendors`);
    return response.data;
  },

  getVendorMenus: async (vendorId) => {
    const response = await api.get(`/vendors/${vendorId}/menus`);
    return response.data;
  },
};
