import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/uiConstants';

/**
 * Unified Card Component
 * Proporciona consistencia visual en todas las tarjetas de la aplicación
 */
const Card = ({
  children,
  title = null,
  subtitle = null,
  footer = null,
  variant = 'default',
  hoverable = false,
  padding = 'md',
  className = '',
  onClick = null,
  ...props
}) => {
  const paddingMap = {
    xs: spacing.sm,
    sm: spacing.md,
    md: spacing.lg,
    lg: spacing.xl,
  };

  const variants = {
    default: {
      bg: colors.white,
      border: colors.gray[200],
      shadow: shadows.sm,
    },
    elevated: {
      bg: colors.white,
      border: colors.gray[100],
      shadow: shadows.lg,
    },
    subtle: {
      bg: colors.gray[50],
      border: colors.gray[100],
      shadow: 'none',
    },
    accent: {
      bg: colors.cream[50],
      border: colors.cream[200],
      shadow: shadows.sm,
    },
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <motion.div
      whileHover={hoverable ? { y: -4, shadow: shadows.lg } : {}}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      onClick={onClick}
      style={{
        backgroundColor: variantStyle.bg,
        border: `1px solid ${variantStyle.border}`,
        borderRadius: borderRadius.lg,
        boxShadow: variantStyle.shadow,
        overflow: 'hidden',
        cursor: hoverable ? 'pointer' : 'default',
      }}
      className={`transition-all ${className}`}
    >
      {/* Header */}
      {title && (
        <div
          style={{
            padding: paddingMap[padding],
            borderBottom: `1px solid ${variantStyle.border}`,
          }}
        >
          <h3
            style={{
              ...typography.h4,
              color: colors.gray[900],
              margin: 0,
              marginBottom: subtitle ? spacing.xs : 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                ...typography.bodySmall,
                color: colors.gray[500],
                margin: 0,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: paddingMap[padding] }}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div
          style={{
            padding: paddingMap[padding],
            borderTop: `1px solid ${variantStyle.border}`,
            backgroundColor: variantStyle.bg === colors.white ? colors.gray[50] : 'inherit',
          }}
        >
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
