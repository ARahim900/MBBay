import React, { useState } from 'react';
import { 
  Droplets, 
  Zap, 
  Wind, 
  Flame, 
  Settings, 
  User, 
  Bell, 
  Moon, 
  Sun,
  LayoutDashboard,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Sidebar, Button } from './ui';
import { ModernWaterModule } from './ModernWaterModule';
import { EnhancedSTPModule } from './EnhancedSTPModule';
import { theme } from '../lib/theme';

// Import other modules (you'll need to create modern versions of these)
// import { ModernElectricityModule } from './ModernElectricityModule';
// import { ModernHVACModule } from './ModernHVACModule';

interface AppState {
  activeModule: string;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
}

export const ModernApp: React.FC = () => {
  const [state, setState] = useState<AppState>({
    activeModule: 'water',
    isSidebarOpen: false,
    isDarkMode: false
  });

  const toggleSidebar = () => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark');
  };

  const setActiveModule = (module: string) => {
    setState(prev => ({ ...prev, activeModule: module }));
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'New'
    },
    {
      id: 'water',
      label: 'Water Management',
      icon: Droplets,
      badge: '4'
    },
    {
      id: 'electricity',
      label: 'Electricity',
      icon: Zap,
      badge: '2'
    },
    {
      id: 'hvac',
      label: 'HVAC System',
      icon: Wind
    },
    {
      id: 'stp',
      label: 'STP Operations',
      icon: Flame,
      badge: '1'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      subItems: [
        { id: 'reports', label: 'Reports', icon: TrendingUp },
        { id: 'insights', label: 'AI Insights', icon: TrendingUp }
      ]
    }
  ];

  const renderModule = () => {
    switch (state.activeModule) {
      case 'water':
        return <ModernWaterModule />;
      case 'stp':
        return <EnhancedSTPModule />;
      // case 'electricity':
      //   return <ModernElectricityModule />;
      // case 'hvac':
      //   return <ModernHVACModule />;
      default:
        return <ModernWaterModule />;
    }
  };

  const sidebarFooter = (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            Admin User
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            admin@utilities.com
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={state.isDarkMode ? Sun : Moon}
          onClick={toggleDarkMode}
          fullWidth
        >
          {state.isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          icon={Settings}
          onClick={() => console.log('Settings')}
        >
          Settings
        </Button>
      </div>
    </div>
  );

  const logo = (
    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
      <Droplets className="w-5 h-5 text-white" />
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 ${state.isDarkMode ? 'dark' : ''}`}>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          activeItem={state.activeModule}
          onItemClick={setActiveModule}
          isOpen={state.isSidebarOpen}
          onToggle={toggleSidebar}
          title="Utilities Hub"
          logo={logo}
          footer={sidebarFooter}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Navigation Bar */}
          <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {sidebarItems.find(item => item.id === state.activeModule)?.label || 'Dashboard'}
                </h2>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" icon={Bell}>
                  <span className="sr-only">Notifications</span>
                </Button>
                
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Module Content */}
          <main className="flex-1">
            {renderModule()}
          </main>
        </div>
      </div>
    </div>
  );
};