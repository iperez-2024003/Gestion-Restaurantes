import api from './axios';

export const getOrders = (params = {}) => api.get('/orders', { params });

