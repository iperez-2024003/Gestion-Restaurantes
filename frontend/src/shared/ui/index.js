/**
 * UI System Exports
 * Centralized exports for all unified UI components
 */

// States
export { default as LoadingSpinner } from './states/LoadingSpinner';
export { default as EmptyState } from './states/EmptyState';
export { default as ErrorState } from './states/ErrorState';
export { default as Toast, ToastContainer } from './states/Toast';
export { useToastStore, useToast } from '../hooks/useToastStore';

// UI Components
export { default as UnifiedButton } from './ui/UnifiedButton';
export { default as Modal } from './ui/Modal';
export { default as Card } from './ui/Card';
export { BrandLogo } from './ui/BrandLogo';

// Form Components
export { default as FormInput, FormTextarea, FormSelect } from './forms/FormInput';

// Constants
export { default as uiConstants, colors, shadows, borderRadius, spacing, typography, buttonStyles, transitions, zIndex, breakpoints } from '../constants/uiConstants';

/**
 * Quick import example:
 * import { LoadingSpinner, UnifiedButton, Card, useToast } from '@/shared/ui';
 */
