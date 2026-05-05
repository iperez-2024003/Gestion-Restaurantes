import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/uiConstants';

/**
 * Unified Error State Component
 * Used when an error occurs
 */
const ErrorState = ({ 
  title = 'Algo salió mal',
  message = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
  actionLabel = 'Reintentar',
  onAction = null,
  variant = 'error',
  showIcon = true,
  fullPage = false
}) => {
  const bgColor = variant === 'warning' ? colors.amber[50] : '#fef2f2';
  const borderColor = variant === 'warning' ? colors.amber[200] : '#fecaca';
  const textColor = variant === 'warning' ? colors.amber[900] : '#7f1d1d';

  const errorContent = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        border: `2px solid ${borderColor}`,
        boxShadow: shadows.sm,
      }}
      className="max-w-md mx-auto"
    >
      {/* Icon */}
      {showIcon && (
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex justify-center mb-4"
        >
          <AlertTriangle 
            size={40} 
            style={{ color: variant === 'warning' ? colors.amber[500] : colors.error }}
            strokeWidth={2}
          />
        </motion.div>
      )}

      {/* Title */}
      <h3
        style={{
          ...typography.h4,
          color: textColor,
        }}
        className="text-center mb-2"
      >
        {title}
      </h3>

      {/* Message */}
      <p
        style={{
          ...typography.bodySmall,
          color: textColor,
        }}
        className="text-center mb-6"
      >
        {message}
      </p>

      {/* Action Button */}
      {onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          style={{
            ...typography.label,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: borderRadius.md,
            backgroundColor: variant === 'warning' ? colors.amber[500] : colors.error,
            color: colors.white,
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
          className={`transition-colors ${
            variant === 'warning'
              ? 'hover:bg-amber-600'
              : 'hover:bg-red-600'
          }`}
        >
          <RotateCcw size={16} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );

  if (fullPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        {errorContent}
      </motion.div>
    );
  }

  return <div className="flex items-center justify-center py-8 px-4">{errorContent}</div>;
};

export default ErrorState;
