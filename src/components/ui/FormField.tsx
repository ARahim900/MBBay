/**
 * Enhanced Form Field Component with Validation Feedback
 * 
 * Provides consistent form field styling with real-time validation
 * feedback and proper error states.
 * 
 * Requirements: 6.4, 10.4
 */

import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getThemeValue } from '../../lib/theme';

export interface FormFieldProps {
  // Field identification
  id?: string;
  name: string;
  label: string;
  
  // Field type and behavior
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  
  // Validation state
  error?: string | null;
  touched?: boolean;
  validationStatus?: 'valid' | 'invalid' | 'neutral';
  
  // Value and change handling
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  
  // Styling and layout
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  
  // Additional props for specific input types
  min?: number | string;
  max?: number | string;
  step?: number | string;
  rows?: number;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  
  // Help text and descriptions
  helpText?: string;
  description?: string;
  
  // Icons and visual elements
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  FormFieldProps
>(({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  touched = false,
  validationStatus = 'neutral',
  value,
  onChange,
  onBlur,
  onFocus,
  className = '',
  containerClassName = '',
  labelClassName = '',
  min,
  max,
  step,
  rows = 3,
  options = [],
  helpText,
  description,
  icon,
  suffix,
  prefix,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}, ref) => {
  const fieldId = id || name;
  const hasError = touched && error;
  const isValid = touched && validationStatus === 'valid' && !error;
  
  // Generate IDs for accessibility
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  const descriptionId = `${fieldId}-description`;
  
  // Build aria-describedby
  const describedByIds = [
    ariaDescribedBy,
    hasError ? errorId : null,
    helpText ? helpId : null,
    description ? descriptionId : null
  ].filter(Boolean).join(' ');

  // Get validation colors
  const getValidationColors = () => {
    if (hasError) {
      return {
        border: getThemeValue('colors.status.error', '#ef4444'),
        background: `${getThemeValue('colors.status.error', '#ef4444')}08`,
        text: getThemeValue('colors.status.error', '#ef4444'),
        icon: getThemeValue('colors.status.error', '#ef4444')
      };
    }
    
    if (isValid) {
      return {
        border: getThemeValue('colors.status.success', '#10b981'),
        background: `${getThemeValue('colors.status.success', '#10b981')}08`,
        text: getThemeValue('colors.status.success', '#10b981'),
        icon: getThemeValue('colors.status.success', '#10b981')
      };
    }
    
    return {
      border: getThemeValue('colors.gray.300', '#d1d5db'),
      background: 'transparent',
      text: getThemeValue('colors.gray.600', '#4b5563'),
      icon: getThemeValue('colors.gray.400', '#9ca3af')
    };
  };

  const colors = getValidationColors();

  // Base input styles
  const baseInputStyles = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
    fontSize: getThemeValue('typography.labelSize', '0.875rem'),
    fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
    backgroundColor: colors.background,
    transition: 'all 0.2s ease-in-out',
    minHeight: '44px', // Accessibility: minimum touch target
    outline: 'none'
  };

  // Focus styles
  const focusStyles = {
    borderColor: getThemeValue('colors.primary', '#2D9CDB'),
    boxShadow: `0 0 0 3px ${getThemeValue('colors.primary', '#2D9CDB')}20`,
    backgroundColor: 'transparent'
  };

  // Render validation icon
  const renderValidationIcon = () => {
    if (hasError) {
      return <AlertCircle className="h-4 w-4" style={{ color: colors.icon }} />;
    }
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4" style={{ color: colors.icon }} />;
    }
    
    return null;
  };

  // Render input based on type
  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      value: value || '',
      onChange,
      onBlur,
      onFocus,
      disabled,
      readOnly,
      placeholder,
      required,
      'aria-label': ariaLabel || label,
      'aria-describedby': describedByIds || undefined,
      'aria-invalid': ariaInvalid || hasError || undefined,
      style: baseInputStyles,
      className: `form-input ${className}`,
      ...props
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            style={{
              ...baseInputStyles,
              resize: 'vertical',
              minHeight: `${Math.max(rows * 1.5, 3)}rem`
            }}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            ref={ref as React.Ref<HTMLSelectElement>}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );

      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            min={min}
            max={max}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );

      default:
        return (
          <input
            {...commonProps}
            type={type}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );
    }
  };

  return (
    <div className={`form-field-container ${containerClassName}`}>
      {/* Label */}
      <label
        htmlFor={fieldId}
        className={`block text-sm font-medium mb-2 ${labelClassName}`}
        style={{
          fontSize: getThemeValue('typography.labelSize', '0.875rem'),
          fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
          color: getThemeValue('colors.textPrimary', '#111827')
        }}
      >
        {label}
        {required && (
          <span
            className="ml-1"
            style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
            aria-label="required"
          >
            *
          </span>
        )}
      </label>

      {/* Description */}
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600 dark:text-gray-400 mb-2"
          style={{
            fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
            fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
          }}
        >
          {description}
        </p>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {prefix}
          </div>
        )}

        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <div
          className="relative"
          style={{
            paddingLeft: (prefix || icon) ? '2.5rem' : undefined,
            paddingRight: (suffix || renderValidationIcon()) ? '2.5rem' : undefined
          }}
        >
          {renderInput()}
        </div>

        {/* Validation Icon */}
        {renderValidationIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {renderValidationIcon()}
          </div>
        )}

        {/* Suffix */}
        {suffix && !renderValidationIcon() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {suffix}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div
          id={errorId}
          className="flex items-center gap-1 mt-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" style={{ color: colors.text }} />
          <span
            className="text-xs"
            style={{
              color: colors.text,
              fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            {error}
          </span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <div
          id={helpId}
          className="flex items-center gap-1 mt-1"
        >
          <Info className="h-3 w-3 flex-shrink-0" style={{ color: colors.icon }} />
          <span
            className="text-xs"
            style={{
              color: getThemeValue('colors.gray.500', '#6b7280'),
              fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            {helpText}
          </span>
        </div>
      )}

      {/* Success Message */}
      {isValid && !helpText && (
        <div className="flex items-center gap-1 mt-1">
          <CheckCircle className="h-3 w-3 flex-shrink-0" style={{ color: colors.text }} />
          <span
            className="text-xs"
            style={{
              color: colors.text,
              fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Valid
          </span>
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;