import React, { useState } from 'react'
import { LayoutDashboard, MapPin, PieChart as PieIcon, Database } from 'lucide-react'
import { OverviewTab } from './OverviewTab'
import { ZoneAnalysisTab } from './ZoneAnalysisTab'
import { ConsumptionByTypeTab } from './ConsumptionByTypeTab'
import { MainDatabaseTab } from './MainDatabaseTab'

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
)

export const EnhancedWaterModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('Overview')
  
  const subNavItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Zone Analysis', icon: MapPin },
    { name: 'Consumption by Type', icon: PieIcon },
    { name: 'Main Database', icon: Database },
  ]

  const renderSubModule = () => {
    switch (activeSubModule) {
      case 'Overview': 
        return <OverviewTab />
      case 'Zone Analysis': 
        return <ZoneAnalysisTab />
      case 'Consumption by Type': 
        return <ConsumptionByTypeTab />
      case 'Main Database': 
        return <MainDatabaseTab />
      default: 
        return <div className="text-center p-8 bg-gray-100 dark:bg-white/5 rounded-lg">Component for "{activeSubModule}" is under construction.</div>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4E4456] dark:text-white">Water System Analysis</h2>
        <p className="text-sm text-gray-500">Muscat Bay Resource Management</p>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-start gap-x-2 gap-y-2">
          {subNavItems.map(({ name, icon: Icon }) => (
            <button 
              key={name} 
              onClick={() => setActiveSubModule(name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:bg-gray-100 dark:hover:bg-white/10 ${
                activeSubModule === name 
                  ? 'bg-gray-200 dark:bg-white/20 text-[#4E4456] dark:text-white shadow-inner' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <Icon className="h-5 w-5" /> {name}
            </button>
          ))}
        </div>
      </Card>
      
      {renderSubModule()}
    </div>
  )
}