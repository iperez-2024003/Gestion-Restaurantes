/**
 * Unified UI Constants
 * Centralized design system for consistent styling across the application
 * Aligns with BuenProvecho brand: cream/white/amber palette
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================
export const colors = {
  // Primary Brand Colors
  cream: {
    50: '#fef9f3',
    100: '#fdf1e6',
    200: '#fae5d3',
    300: '#f5d4bb',
    400: '#f0c9a8',
    500: '#ead4b8', // Primary cream
    600: '#d4b8a0',
    700: '#be9d88',
    800: '#a88670',
    900: '#925a48',
  },

  // Accent Colors (Amber)
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Primary accent
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Neutral Grayscale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // White & Black
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// SHADOW SYSTEM
// ============================================================================
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: '0',
  sm: '0.375rem', // 6px
  base: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2.5rem', // 40px (buttons, cards)
  full: '9999px', // Pills, circles
};

// ============================================================================
// SPACING SCALE (4px base)
// ============================================================================
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
};

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================
export const typography = {
  // Headings
  h1: {
    fontSize: '2.25rem', // 36px
    fontWeight: 700,
    lineHeight: '2.5rem',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.875rem', // 30px
    fontWeight: 700,
    lineHeight: '2.25rem',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: '1.875rem',
    letterSpacing: '-0.005em',
  },
  h4: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: '1.5rem',
  },

  // Body Text
  body: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: '1.5rem',
  },
  bodySmall: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: '1.25rem',
  },
  bodyXSmall: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: '1rem',
  },

  // Labels & Captions
  label: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: '1.25rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    lineHeight: '1rem',
  },
};

// ============================================================================
// BUTTON STYLES
// ============================================================================
export const buttonStyles = {
  // Size variants
  sizes: {
    xs: {
      padding: '0.375rem 0.75rem', // 6px 12px
      fontSize: '0.75rem',
      borderRadius: '0.375rem',
    },
    sm: {
      padding: '0.5rem 1rem', // 8px 16px
      fontSize: '0.875rem',
      borderRadius: '0.5rem',
    },
    md: {
      padding: '0.75rem 1.5rem', // 12px 24px
      fontSize: '1rem',
      borderRadius: '0.75rem',
    },
    lg: {
      padding: '1rem 2rem', // 16px 32px
      fontSize: '1.125rem',
      borderRadius: '1rem',
    },
  },

  // Color variants
  variants: {
    primary: {
      bg: colors.amber[500],
      text: colors.white,
      hover: colors.amber[600],
      active: colors.amber[700],
      disabled: colors.gray[300],
    },
    secondary: {
      bg: colors.gray[100],
      text: colors.gray[900],
      hover: colors.gray[200],
      active: colors.gray[300],
      disabled: colors.gray[200],
    },
    outline: {
      bg: colors.transparent,
      border: colors.amber[500],
      text: colors.amber[500],
      hover: colors.amber[50],
      active: colors.amber[100],
      disabled: colors.gray[300],
    },
    danger: {
      bg: colors.error,
      text: colors.white,
      hover: '#dc2626',
      active: '#991b1b',
      disabled: colors.gray[300],
    },
    ghost: {
      bg: colors.transparent,
      text: colors.gray[700],
      hover: colors.gray[100],
      active: colors.gray[200],
      disabled: colors.gray[300],
    },
  },
};

// ============================================================================
// TRANSITIONS & ANIMATIONS
// ============================================================================
export const transitions = {
  fast: '0.15s ease-out',
  base: '0.3s ease-out',
  slow: '0.5s ease-out',
  slower: '0.75s ease-out',
};

// ============================================================================
// Z-INDEX LEVELS
// ============================================================================
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};

// ============================================================================
// LAYOUT BREAKPOINTS
// ============================================================================
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============================================================================
// UTILITY FUNCTION: Generate Tailwind-compatible color classes
// ============================================================================
export const getTailwindColor = (colorFamily, shade) => {
  const colors_map = {
    cream: colors.cream,
    amber: colors.amber,
    gray: colors.gray,
  };
  return colors_map[colorFamily]?.[shade] || colors.gray[500];
};

export default {
  colors,
  shadows,
  borderRadius,
  spacing,
  typography,
  buttonStyles,
  transitions,
  zIndex,
  breakpoints,
};
