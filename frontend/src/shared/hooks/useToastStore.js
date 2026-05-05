import { create } from 'zustand';

/**
 * Toast Store Hook
 * Manages toast notifications globally
 * Usage: const { addToast, removeToast, toasts } = useToastStore();
 */
export const useToastStore = create((set) => ({
  toasts: [],

  addToast: ({ message, type = 'success', duration = 4000, action = null }) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message,
          type,
          duration,
          action,
        },
      ],
    }));

    // Auto-remove after duration
    if (duration) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

/**
 * Toast Hook Helpers
 * Convenient shortcuts for different toast types
 */
export const useToast = () => {
  const { addToast } = useToastStore();

  return {
    success: (message, options = {}) =>
      addToast({ message, type: 'success', ...options }),
    error: (message, options = {}) =>
      addToast({ message, type: 'error', ...options }),
    warning: (message, options = {}) =>
      addToast({ message, type: 'warning', ...options }),
    info: (message, options = {}) =>
      addToast({ message, type: 'info', ...options }),
  };
};

export default useToastStore;
