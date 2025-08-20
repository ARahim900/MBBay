import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
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
  className = ''
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
  `;

  const variantStyles = {
    primary: `
      bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg
      focus:ring-blue-500 active:scale-95
    `,
    secondary: `
      bg-gray-500 hover:bg-gray-600 text-white shadow-md hover:shadow-lg
      focus:ring-gray-500 active:scale-95
    `,
    outline: `
      border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white
      focus:ring-blue-500 active:scale-95
    `,
    ghost: `
      text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 
      dark:hover:text-white dark:hover:bg-gray-700 focus:ring-gray-500
    `,
    danger: `
      bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg
      focus:ring-red-500 active:scale-95
    `
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};