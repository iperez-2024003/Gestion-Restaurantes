import { eventosApi as api } from './axios';

export const getEvents = (params = {}) => api.get('/events', { params });

export const createEvent = (data) => api.post('/events', data);

export const updateEvent = (eventId, data) => api.put(`/events/${eventId}`, data);

export const cancelEvent = (eventId) => api.patch(`/events/${eventId}/cancel`);

export const deleteEvent = (eventId) => api.delete(`/events/${eventId}`);

export const registerToEvent = (eventId, data) => api.post(`/events/${eventId}/register`, data);


