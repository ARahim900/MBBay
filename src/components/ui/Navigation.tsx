import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface NavigationProps {
  items: NavigationItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  variant?: 'tabs' | 'pills' | 'sidebar';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItem,
  onItemClick,
  variant = 'tabs',
  orientation = 'horizontal',
  className = ''
}) => {
  const getBaseStyles = () => {
    const base = 'flex gap-1';
    return orientation === 'horizontal' ? `${base} flex-row` : `${base} flex-col`;
  };

  const getItemStyles = (isActive: boolean) => {
    const baseItem = `
      flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    `;

    switch (variant) {
      case 'pills':
        return `${baseItem} rounded-lg ${
          isActive
            ? 'bg-blue-500 text-white shadow-md'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
        }`;
      
      case 'sidebar':
        return `${baseItem} rounded-lg w-full justify-start ${
          isActive
            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
        }`;
      
      default: // tabs
        return `${baseItem} border-b-2 ${
          isActive
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
        }`;
    }
  };

  return (
    <nav className={`${getBaseStyles()} ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeItem;
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={getItemStyles(isActive)}
          >
            <IconComponent className="w-4 h-4" />
            <span>{item.label}</span>
            {item.badge && (
              <span className={`
                ml-auto px-2 py-0.5 text-xs rounded-full
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }
              `}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

// Breadcrumb Component
interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = ''
}) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-500">{separator}</span>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className={`
                transition-colors duration-200
                ${index === items.length - 1
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
            >
              {item.label}
            </button>
          ) : (
            <span
              className={
                index === items.length - 1
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};