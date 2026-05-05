import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, typography, borderRadius } from '../../constants/uiConstants';

/**
 * Unified Empty State Component
 * Used when no data is available
 */
const EmptyState = ({ 
  icon: Icon,
  title = 'Sin resultados',
  description = 'No hay datos disponibles en este momento',
  action = null,
  variant = 'neutral'
}) => {
  const iconColorMap = {
    neutral: colors.gray[400],
    info: colors.amber[400],
    warning: colors.amber[500],
    error: colors.error,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="flex flex-col items-center justify-center py-12 px-4"
    >
      {/* Icon */}
      {Icon && (
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-4"
        >
          <Icon 
            size={56} 
            style={{ color: iconColorMap[variant] }}
            strokeWidth={1.5}
          />
        </motion.div>
      )}

      {/* Title */}
      <h3
        style={typography.h4}
        className="text-gray-800 mb-2 text-center"
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={typography.bodySmall}
        className="text-gray-500 text-center mb-6 max-w-xs"
      >
        {description}
      </p>

      {/* Action Button */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          style={{
            ...typography.label,
            padding: `${spacing.sm} ${spacing.md}`,
            borderRadius: borderRadius.md,
            backgroundColor: colors.amber[500],
            color: colors.white,
            border: 'none',
            cursor: 'pointer',
          }}
          className="transition-colors hover:bg-amber-600"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
