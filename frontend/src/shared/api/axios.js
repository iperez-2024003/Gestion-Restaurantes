import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { translateApiMessage } from '../utils/i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3005/api/v1',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token || localStorage.getItem('token');
  
  // Validar que el token sea un string real y no "undefined" / "null"
  const isValidToken = token && token !== 'undefined' && token !== 'null';

  if (isValidToken) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Solo añadir Content-Type si hay un body, no es FormData y es un método que lo permite
  const methodsWithBody = ['post', 'put', 'patch'];
  if (config.data && !(config.data instanceof FormData) && methodsWithBody.includes(config.method?.toLowerCase())) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido, cerrar sesión automáticamente
    if (error?.response?.status === 401) {
      const currentPath = window.location.pathname;
      // No redirigir si ya estamos en login/register para evitar bucle
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        useAuthStore.getState().logout?.();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    const backendMessage = error?.response?.data?.message;
    if (backendMessage && error.response?.data) {
      error.response.data.message = translateApiMessage(backendMessage);
    }
    if (Array.isArray(error?.response?.data?.errors)) {
      error.response.data.errors = error.response.data.errors.map((item) => ({
        ...item,
        message: translateApiMessage(item?.message || ''),
      }));
    }
    return Promise.reject(error);
  }
);

export default api;
