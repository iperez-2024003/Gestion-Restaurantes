import React from 'react';
import { motion } from 'framer-motion';
import { colors, spacing, typography, borderRadius } from '../../constants/uiConstants';

/**
 * Unified Form Input Component
 * Proporciona consistencia en todos los inputs de formularios
 */
const FormInput = ({
  label = '',
  placeholder = '',
  type = 'text',
  value = '',
  onChange = null,
  error = '',
  disabled = false,
  required = false,
  icon: Icon = null,
  helpText = '',
  className = '',
  ...props
}) => {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {/* Label */}
      {label && (
        <label
          style={{
            ...typography.label,
            color: colors.gray[700],
            display: 'block',
            marginBottom: spacing.sm,
          }}
        >
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}

      {/* Input Container */}
      <div style={{ position: 'relative' }}>
        {/* Icon */}
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: spacing.md,
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.gray[400],
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}

        {/* Input */}
        <motion.input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          whileFocus={{
            scale: 1.02,
          }}
          style={{
            width: '100%',
            padding: `${spacing.md} ${Icon ? '2.5rem' : spacing.md}`,
            borderRadius: borderRadius.md,
            border: `2px solid ${
              error
                ? colors.error
                : disabled
                ? colors.gray[200]
                : colors.gray[200]
            }`,
            fontSize: typography.body.fontSize,
            fontFamily: 'inherit',
            color: colors.gray[900],
            backgroundColor: disabled ? colors.gray[100] : colors.white,
            transition: 'all 0.3s ease-out',
            boxSizing: 'border-box',
          }}
          className={`focus:outline-none focus:border-amber-500 focus:shadow-lg ${className}`}
          onFocus={(e) => {
            e.target.style.borderColor = colors.amber[500];
            e.target.style.boxShadow = `0 0 0 3px ${colors.amber[50]}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? colors.error : colors.gray[200];
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...typography.caption,
            color: colors.error,
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {error}
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p
          style={{
            ...typography.caption,
            color: colors.gray[500],
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Unified Textarea Component
 */
export const FormTextarea = ({
  label = '',
  placeholder = '',
  value = '',
  onChange = null,
  error = '',
  disabled = false,
  required = false,
  rows = 4,
  helpText = '',
  className = '',
  ...props
}) => {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {/* Label */}
      {label && (
        <label
          style={{
            ...typography.label,
            color: colors.gray[700],
            display: 'block',
            marginBottom: spacing.sm,
          }}
        >
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}

      {/* Textarea */}
      <motion.textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        whileFocus={{
          scale: 1.02,
        }}
        style={{
          width: '100%',
          padding: spacing.md,
          borderRadius: borderRadius.md,
          border: `2px solid ${
            error
              ? colors.error
              : disabled
              ? colors.gray[200]
              : colors.gray[200]
          }`,
          fontSize: typography.body.fontSize,
          fontFamily: 'inherit',
          color: colors.gray[900],
          backgroundColor: disabled ? colors.gray[100] : colors.white,
          transition: 'all 0.3s ease-out',
          boxSizing: 'border-box',
          resize: 'vertical',
        }}
        className={`focus:outline-none focus:border-amber-500 focus:shadow-lg ${className}`}
        onFocus={(e) => {
          e.target.style.borderColor = colors.amber[500];
          e.target.style.boxShadow = `0 0 0 3px ${colors.amber[50]}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? colors.error : colors.gray[200];
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...typography.caption,
            color: colors.error,
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {error}
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p
          style={{
            ...typography.caption,
            color: colors.gray[500],
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

/**
 * Unified Select Component
 */
export const FormSelect = ({
  label = '',
  placeholder = '',
  options = [],
  value = '',
  onChange = null,
  error = '',
  disabled = false,
  required = false,
  helpText = '',
  className = '',
  ...props
}) => {
  return (
    <div style={{ marginBottom: spacing.lg }}>
      {/* Label */}
      {label && (
        <label
          style={{
            ...typography.label,
            color: colors.gray[700],
            display: 'block',
            marginBottom: spacing.sm,
          }}
        >
          {label}
          {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}

      {/* Select */}
      <motion.select
        value={value}
        onChange={onChange}
        disabled={disabled}
        whileFocus={{
          scale: 1.02,
        }}
        style={{
          width: '100%',
          padding: `${spacing.md} ${spacing.md}`,
          borderRadius: borderRadius.md,
          border: `2px solid ${
            error
              ? colors.error
              : disabled
              ? colors.gray[200]
              : colors.gray[200]
          }`,
          fontSize: typography.body.fontSize,
          fontFamily: 'inherit',
          color: colors.gray[900],
          backgroundColor: disabled ? colors.gray[100] : colors.white,
          transition: 'all 0.3s ease-out',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        className={`focus:outline-none focus:border-amber-500 focus:shadow-lg ${className}`}
        onFocus={(e) => {
          e.target.style.borderColor = colors.amber[500];
          e.target.style.boxShadow = `0 0 0 3px ${colors.amber[50]}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? colors.error : colors.gray[200];
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </motion.select>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...typography.caption,
            color: colors.error,
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {error}
        </motion.p>
      )}

      {/* Help Text */}
      {helpText && !error && (
        <p
          style={{
            ...typography.caption,
            color: colors.gray[500],
            marginTop: spacing.xs,
            margin: 0,
          }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormInput;
