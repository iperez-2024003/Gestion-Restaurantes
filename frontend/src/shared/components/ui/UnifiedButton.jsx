import React from 'react';
import { motion } from 'framer-motion';
import { buttonStyles, transitions } from '../../constants/uiConstants';

/**
 * Unified Button Component
 * Ensures consistent button styling across the application
 */
const UnifiedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon = null,
  onClick = null,
  type = 'button',
  className = '',
  ...props
}) => {
  const variantStyles = buttonStyles.variants[variant];
  const sizeStyles = buttonStyles.sizes[size];

  if (!variantStyles) {
    console.warn(`Unknown button variant: ${variant}`);
    return null;
  }

  // Build inline styles
  const baseStyle = {
    padding: sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    borderRadius: sizeStyles.borderRadius,
    backgroundColor: disabled ? variantStyles.disabled : variantStyles.bg,
    color: variantStyles.text,
    border: variant === 'outline' ? `2px solid ${variantStyles.border}` : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: `all ${transitions.base}`,
    ...props.style,
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = variantStyles.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.target.style.backgroundColor = variantStyles.bg;
        }
      }}
      className={className}
    >
      {/* Icon */}
      {Icon && (
        <Icon size={size === 'xs' ? 14 : size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
      )}

      {/* Loading State */}
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          ⟳
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default UnifiedButton;
