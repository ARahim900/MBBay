import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  type = 'button',
  ...rest
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
    touch-manipulation select-none
  `;

  const variantStyles = {
    primary: `
      bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg
      focus:ring-blue-500 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700
    `,
    secondary: `
      bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg
      focus:ring-gray-500 active:scale-95 dark:bg-gray-600 dark:hover:bg-gray-700
    `,
    outline: `
      border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white
      focus:ring-blue-500 active:scale-95 dark:border-blue-400 dark:text-blue-400
      dark:hover:bg-blue-400 dark:hover:text-gray-900
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 
      dark:hover:text-white dark:hover:bg-gray-700 focus:ring-gray-500
    `,
    danger: `
      bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg
      focus:ring-red-500 active:scale-95 dark:bg-red-600 dark:hover:bg-red-700
    `
  };

  // Enhanced touch targets for mobile - minimum 44px height
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  // Generate accessible label
  const getAccessibleLabel = () => {
    if (ariaLabel) return ariaLabel;
    if (typeof children === 'string') return children;
    if (loading) return 'Loading';
    return undefined;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      aria-label={getAccessibleLabel()}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-disabled={disabled || loading}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...rest}
    >
      {loading ? (
        <>
          <div 
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" 
            aria-hidden="true"
          />
          <span className="sr-only">Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" aria-hidden="true" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" aria-hidden="true" />}
        </>
      )}
    </button>
  );
};