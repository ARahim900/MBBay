import React from 'react';
import { LucideIcon, X, Menu } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  subItems?: Omit<SidebarItem, 'subItems'>[];
}

interface SidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemClick: (itemId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeItem,
  onItemClick,
  isOpen,
  onToggle,
  title = "Dashboard",
  logo,
  footer
}) => {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = item.id === activeItem;
    const isExpanded = expandedItems.includes(item.id);
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const IconComponent = item.icon;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleExpanded(item.id);
            } else {
              onItemClick(item.id);
            }
          }}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200
            ${level > 0 ? 'ml-6 pl-8' : ''}
            ${isActive 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
            }
          `}
        >
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 font-medium">{item.label}</span>
          
          {item.badge && (
            <span className={`
              px-2 py-0.5 text-xs rounded-full font-medium
              ${isActive 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200' 
                : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }
            `}>
              {item.badge}
            </span>
          )}
          
          {hasSubItems && (
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </button>
        
        {hasSubItems && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.subItems!.map(subItem => renderSidebarItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-72 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {logo}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {items.map(item => renderSidebarItem(item))}
        </nav>
        
        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
      
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
};