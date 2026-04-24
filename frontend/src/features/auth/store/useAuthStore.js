import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../../../shared/api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: localStorage.getItem('token') || null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

  login: async (emailOrUsername, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { emailOrUsername, password });
      const { token, userDetails } = response.data;
      
      localStorage.setItem('token', token);
      
      const userRole = userDetails?.role || 'CLIENT_ROLE';
      
      set({ 
        token, 
        user: userDetails, 
        role: userRole,
        isAuthenticated: true, 
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario',
        details: error.response?.data?.errors || []
      };
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/verify-email', { token });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al verificar email' };
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/resend-verification', { email });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al reenviar verificación' };
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al solicitar cambio de contraseña' };
    }
  },

  resetPassword: async (token, newPassword) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al cambiar contraseña' };
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      // Actualizamos el estado del usuario en base a la info del server
      set({ user: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al cargar perfil' };
    }
  },

  updateProfile: async (formData) => {
    set({ isLoading: true });
    try {
      const response = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Actualizamos el store con la info fresca
      set({ user: response.data.data, isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al actualizar perfil' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true });
    try {
      const response = await api.put('/auth/profile/change-password', { currentPassword, newPassword });
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error al cambiar contraseña' };
    }
  },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, role: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage', // nombre en localStorage
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        role: state.role, 
        isAuthenticated: state.isAuthenticated 
      }), // solo persistimos esto
    }
  )
);
