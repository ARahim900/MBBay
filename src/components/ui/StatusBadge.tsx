import React from 'react';
import { getThemeValue } from '../../lib/theme';

interface StatusBadgeProps {
  status: 'Active' | 'Expired' | 'Pending';
  className?: string;
  showIcon?: boolean;
  'aria-label'?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '', 
  showIcon = true,
  'aria-label': ariaLabel
}) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-800 dark:text-green-200',
          border: 'border-green-200 dark:border-green-800',
          dot: getThemeValue('colors.status.success', '#10b981'),
          description: 'Currently providing services'
        };
      case 'Expired':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          text: 'text-red-800 dark:text-red-200',
          border: 'border-red-200 dark:border-red-800',
          dot: getThemeValue('colors.status.error', '#ef4444'),
          description: 'Contract has ended'
        };
      case 'Pending':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/20',
          text: 'text-yellow-800 dark:text-yellow-200',
          border: 'border-yellow-200 dark:border-yellow-800',
          dot: getThemeValue('colors.status.warning', '#f59e0b'),
          description: 'Contract under review'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'text-gray-800 dark:text-gray-200',
          border: 'border-gray-200 dark:border-gray-800',
          dot: getThemeValue('colors.gray.500', '#6b7280'),
          description: 'Unknown status'
        };
    }
  };

  const colors = getStatusColors(status);

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ${className}`}
      style={{ 
        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
        fontSize: getThemeValue('typography.tooltipSize', '0.75rem')
      }}
      role="status"
      aria-label={ariaLabel || `Status: ${status} - ${colors.description}`}
      title={colors.description}
    >
      {showIcon && (
        <span 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.dot }}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
};