import api from './api';

export const menuService = {
  getMenuItems: async (params = {}) => {
    const response = await api.get('/menus', { params });
    return response.data;
  },

  getMenuItemById: async (id) => {
    const response = await api.get(`/menus/${id}`);
    return response.data;
  },

  getVendorMenus: async (params = {}) => {
    const response = await api.get('/menus/vendor/my-menus', { params });
    return response.data;
  },

  createMenuItem: async (menuData) => {
    const response = await api.post('/menus', menuData);
    return response.data;
  },

  updateMenuItem: async (id, menuData) => {
    const response = await api.put(`/menus/${id}`, menuData);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menus/${id}`);
    return response.data;
  },

  uploadMenuImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/upload/menu-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteMenuImage: async (filename) => {
    const response = await api.delete(`/upload/menu-image/${filename}`);
    return response.data;
  },
};
