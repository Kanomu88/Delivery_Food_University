import api from './api';

export const paymentService = {
  initiatePayment: async (paymentData) => {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await api.post('/payments/verify', verificationData);
    return response.data;
  },

  getPaymentByOrderId: async (orderId) => {
    const response = await api.get(`/payments/${orderId}`);
    return response.data;
  },

  retryPayment: async (paymentId) => {
    const response = await api.post(`/payments/retry/${paymentId}`);
    return response.data;
  },

  mockPaymentSuccess: async (orderId) => {
    const response = await api.post('/payments/mock-success', { orderId });
    return response.data;
  },
};
