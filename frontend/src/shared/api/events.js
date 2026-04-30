import api from './axios';

export const getEvents = (params = {}) => api.get('/events', { params });

export const createEvent = (data) => api.post('/events', data);

export const registerToEvent = (eventId, data) => api.post(`/events/${eventId}/register`, data);

