import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, typography } from '../../constants/uiConstants';

/**
 * Unified Loading Spinner Component
 * Used across all pages for consistent loading state
 */
const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Cargando...',
  fullPage = false,
  variant = 'default' 
}) => {
  const sizeMap = {
    sm: { spinner: 32, stroke: 3 },
    md: { spinner: 48, stroke: 4 },
    lg: { spinner: 64, stroke: 5 },
  };

  const { spinner, stroke } = sizeMap[size];

  if (fullPage) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <LoadingSpinnerContent 
          spinner={spinner} 
          stroke={stroke} 
          text={text}
          variant={variant}
        />
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinnerContent 
        spinner={spinner} 
        stroke={stroke} 
        text={text}
        variant={variant}
      />
    </div>
  );
};

const LoadingSpinnerContent = ({ spinner, stroke, text, variant }) => {
  const spinnerColor = variant === 'light' ? colors.cream[500] : colors.amber[500];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Animated Spinner */}
      <motion.svg
        width={spinner}
        height={spinner}
        viewBox="0 0 50 50"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={spinnerColor}
          strokeWidth={stroke}
          strokeDasharray="31.4 125.6"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* Loading Text */}
      {text && (
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={typography.bodySmall}
          className="text-gray-600"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};

export default LoadingSpinner;
