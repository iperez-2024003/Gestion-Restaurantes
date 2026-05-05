import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, zIndex } from '../../constants/uiConstants';

/**
 * Unified Modal Wrapper Component
 * Proporciona consistencia en padding, sombras, animaciones para todos los modales
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className = '',
}) => {
  // Tamaños de modal
  const sizeMap = {
    sm: 'max-w-sm',   // 384px
    md: 'max-w-md',   // 448px
    lg: 'max-w-lg',   // 512px
    xl: 'max-w-xl',   // 576px
    '2xl': 'max-w-2xl', // 672px
    '3xl': 'max-w-3xl', // 768px
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: zIndex.modal - 1,
            }}
            className="cursor-auto"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: zIndex.modal,
              boxShadow: shadows.xl,
              borderRadius: borderRadius.lg,
              backgroundColor: colors.white,
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            className={`${sizeMap[size]} ${className} w-[90vw] md:w-auto`}
          >
            {/* Header */}
            {title && (
              <div
                style={{
                  padding: spacing.lg,
                  borderBottom: `1px solid ${colors.gray[200]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: colors.gray[900],
                    margin: 0,
                  }}
                >
                  {title}
                </h2>

                {showCloseButton && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: colors.gray[400],
                      padding: spacing.sm,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="hover:text-gray-600 transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                )}
              </div>
            )}

            {/* Body */}
            <div style={{ padding: spacing.lg }}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                style={{
                  padding: spacing.lg,
                  borderTop: `1px solid ${colors.gray[200]}`,
                  backgroundColor: colors.gray[50],
                  borderBottomLeftRadius: borderRadius.lg,
                  borderBottomRightRadius: borderRadius.lg,
                  display: 'flex',
                  gap: spacing.md,
                  justifyContent: 'flex-end',
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
