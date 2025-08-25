import React, { useState, useEffect } from 'react';
import { create } from 'zustand';

// Simple state management
interface AppState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const useAppStore = create<AppState>((set) => ({
  activeModule: 'Water',
  setActiveModule: (module) => set({ activeModule: module }),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

// Simple modules
const WaterModule = () => (
  <div className="p-8 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">💧 Water Module</h2>
    <p className="text-gray-600">Water management module is loading...</p>
    <div className="mt-4 p-4 bg-blue-50 rounded">
      <p className="text-blue-700">This module will show water usage analytics and controls.</p>
    </div>
  </div>
);

const ElectricityModule = () => (
  <div className="p-8 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">⚡ Electricity Module</h2>
    <p className="text-gray-600">Electricity management module is loading...</p>
    <div className="mt-4 p-4 bg-yellow-50 rounded">
      <p className="text-yellow-700">This module will show electricity usage and control systems.</p>
    </div>
  </div>
);

const ContractorModule = () => (
  <div className="p-8 bg-white rounded-lg shadow-md">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">👷 Contractor Tracker</h2>
    <p className="text-gray-600">Contractor management module is loading...</p>
    <div className="mt-4 p-4 bg-green-50 rounded">
      <p className="text-green-700">This module will manage contractor information and contracts.</p>
    </div>
  </div>
);

// Simple sidebar
const Sidebar = () => {
  const { activeModule, setActiveModule } = useAppStore();
  
  const modules = [
    { name: 'Water', icon: '💧' },
    { name: 'Electricity', icon: '⚡' },
    { name: 'Contractor Tracker', icon: '👷' },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Muscat Bay</h1>
        <p className="text-sm text-gray-300">Utilities Management</p>
      </div>
      <nav>
        <ul className="space-y-2">
          {modules.map(({ name, icon }) => (
            <li key={name}>
              <button
                onClick={() => setActiveModule(name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeModule === name
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

// Simple header
const Header = () => {
  const { activeModule, isDarkMode, toggleDarkMode } = useAppStore();
  
  return (
    <header className="fixed top-0 left-64 right-0 bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{activeModule}</h2>
          <p className="text-sm text-gray-500">Current Module</p>
        </div>
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
        >
          {isDarkMode ? '🌞' : '🌙'}
        </button>
      </div>
    </header>
  );
};

export default function MinimalApp() {
  const { activeModule, isDarkMode } = useAppStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const renderModule = () => {
    switch (activeModule) {
      case 'Water':
        return <WaterModule />;
      case 'Electricity':
        return <ElectricityModule />;
      case 'Contractor Tracker':
        return <ContractorModule />;
      default:
        return <WaterModule />;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar />
      <Header />
      <main className="ml-64 pt-20 p-6">
        {renderModule()}
      </main>
    </div>
  );
}