import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/uiConstants';

/**
 * Unified Toast/Success Notification Component
 */
const Toast = ({
  id,
  message,
  type = 'success',
  duration = 4000,
  onClose = null,
  action = null,
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      icon: Check,
      iconColor: colors.success,
    },
    error: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#7f1d1d',
      icon: X,
      iconColor: colors.error,
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#78350f',
      icon: AlertCircle,
      iconColor: colors.warning,
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1e40af',
      icon: Info,
      iconColor: colors.info,
    },
  };

  const config = typeConfig[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 100 }}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        borderLeft: `4px solid ${config.iconColor}`,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        boxShadow: shadows.md,
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        maxWidth: '90vw',
        minWidth: '300px',
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <IconComponent size={20} color={config.iconColor} />
      </div>

      {/* Content */}
      <div className="flex-grow">
        <p
          style={{
            ...typography.bodySmall,
            color: config.text,
            margin: 0,
          }}
        >
          {message}
        </p>
      </div>

      {/* Action Button */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          style={{
            ...typography.caption,
            backgroundColor: 'transparent',
            color: config.text,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          {action.label}
        </motion.button>
      )}

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: config.text,
          opacity: 0.6,
        }}
        className="hover:opacity-100 transition-opacity"
      >
        ✕
      </motion.button>
    </motion.div>
  );
};

/**
 * Toast Container Component
 * Place this at the root of your app to show multiple toasts
 */
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.md,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast
              {...toast}
              onClose={() => onRemoveToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Toast;
