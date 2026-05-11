import { pedidosApi as api } from './axios';

export const getOrders = (params = {}) => api.get('/orders', { params });


