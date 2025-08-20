import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { theme } from '../../lib/theme';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: LucideIcon | React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'teal' | 'yellow' | 'indigo' | 'gray';
  variant?: 'default' | 'gradient' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  color = 'blue',
  variant = 'default',
  size = 'md',
  loading = false
}) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500', accent: 'border-blue-200' },
    green: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-500', accent: 'border-green-200' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-500', accent: 'border-purple-200' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-500', accent: 'border-orange-200' },
    pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', icon: 'text-pink-500', accent: 'border-pink-200' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-900/20', icon: 'text-teal-500', accent: 'border-teal-200' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: 'text-yellow-500', accent: 'border-yellow-200' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', icon: 'text-indigo-500', accent: 'border-indigo-200' },
    gray: { bg: 'bg-gray-50 dark:bg-gray-900/20', icon: 'text-gray-500', accent: 'border-gray-200' },
  };

  const sizeMap = {
    sm: { padding: 'sm', iconSize: 'w-8 h-8', valueSize: 'text-xl', titleSize: 'text-xs' },
    md: { padding: 'md', iconSize: 'w-10 h-10', valueSize: 'text-2xl', titleSize: 'text-sm' },
    lg: { padding: 'lg', iconSize: 'w-12 h-12', valueSize: 'text-3xl', titleSize: 'text-base' },
  };

  const colors = colorMap[color] || colorMap['blue']; // Fallback to blue if color not found
  const sizes = sizeMap[size] || sizeMap['md']; // Fallback to md if size not found

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    if (React.isValidElement(icon)) {
      return <div className={`${sizes.iconSize} ${colors.icon}`}>{icon}</div>;
    }
    
    const IconComponent = icon as LucideIcon;
    return <IconComponent className={`${sizes.iconSize} ${colors.icon}`} />;
  };

  const getCardVariant = () => {
    switch (variant) {
      case 'gradient':
        return 'glass';
      case 'minimal':
        return 'outlined';
      default:
        return 'default';
    }
  };

  const getCardStyles = () => {
    if (variant === 'gradient') {
      return `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white border-0`;
    }
    if (variant === 'minimal') {
      return `${colors.bg} ${colors.accent}`;
    }
    return colors.bg;
  };

  return (
    <Card 
      variant={getCardVariant()} 
      padding={sizes.padding}
      className={`${getCardStyles()} transition-all duration-300 hover:scale-105`}
      loading={loading}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${sizes.titleSize} font-medium ${variant === 'gradient' ? 'text-white/80' : 'text-gray-600 dark:text-gray-300'} uppercase tracking-wide mb-1`}>
            {title}
          </p>
          
          <div className="flex items-baseline gap-1 mb-2">
            <span className={`${sizes.valueSize} font-bold ${variant === 'gradient' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {formatValue(value)}
            </span>
            {unit && (
              <span className={`text-sm font-medium ${variant === 'gradient' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                {unit}
              </span>
            )}
          </div>
          
          {subtitle && (
            <p className={`text-xs ${variant === 'gradient' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'} mb-2`}>
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-medium ${
                trend.isPositive 
                  ? (variant === 'gradient' ? 'text-green-200' : 'text-green-600') 
                  : (variant === 'gradient' ? 'text-red-200' : 'text-red-600')
              }`}>
                {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
              </span>
              {trend.period && (
                <span className={`text-xs ${variant === 'gradient' ? 'text-white/60' : 'text-gray-400'}`}>
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${variant === 'gradient' ? 'bg-white/20' : colors.bg} p-3 rounded-lg`}>
            {renderIcon()}
          </div>
        )}
      </div>
    </Card>
  );
};