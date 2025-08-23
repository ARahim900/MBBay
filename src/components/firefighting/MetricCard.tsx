import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  subtext?: string;
  color: 'green' | 'amber' | 'red' | 'blue';
  icon: LucideIcon;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  subtext,
  color,
  icon: Icon
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          icon: 'text-green-600 dark:text-green-400',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          icon: 'text-amber-600 dark:text-amber-400',
          text: 'text-amber-800 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800'
        };
      case 'red':
        return {
          bg: 'bg-red-100 dark:bg-red-900/20',
          icon: 'text-red-600 dark:text-red-400',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          icon: 'text-blue-600 dark:text-blue-400',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          icon: 'text-gray-600 dark:text-gray-400',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const colors = getColorClasses(color);
  const isTrendPositive = trend && trend.startsWith('+');
  const isTrendNegative = trend && trend.startsWith('-');

  return (
    <div className={`p-6 rounded-lg border ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {title}
              </p>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${colors.text}`}>
              {value}
            </p>
            
            <div className="flex items-center gap-2 text-xs">
              {trend && (
                <div className={`flex items-center gap-1 ${
                  isTrendPositive ? 'text-green-600 dark:text-green-400' :
                  isTrendNegative ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {isTrendPositive && <TrendingUp className="h-3 w-3" />}
                  {isTrendNegative && <TrendingDown className="h-3 w-3" />}
                  <span className="font-medium">{trend}</span>
                </div>
              )}
              
              {subtext && (
                <span className="text-gray-500 dark:text-gray-400">
                  {subtext}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Optional pulse animation for critical metrics */}
      {color === 'red' && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};