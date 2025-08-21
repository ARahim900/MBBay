import React, { useState } from 'react'
import { LayoutDashboard, MapPin, PieChart as PieIcon, Database } from 'lucide-react'
import { OverviewTab } from './OverviewTab'
import { ZoneAnalysisTab } from './ZoneAnalysisTab'
import { ConsumptionByTypeTab } from './ConsumptionByTypeTab'
import { MainDatabaseTab } from './MainDatabaseTab'
import { MenuBar } from './ui/glow-menu'

const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${className}`}>
    {children}
  </div>
)

export const EnhancedWaterModule = () => {
  const [activeSubModule, setActiveSubModule] = useState('Overview')
  
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Overview', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(45,156,219,0.15) 0%, rgba(45,156,219,0.06) 50%, rgba(45,156,219,0) 100%)",
      iconColor: "text-blue-500"
    },
    { 
      icon: MapPin, 
      label: 'Zone Analysis', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.06) 50%, rgba(34,197,94,0) 100%)",
      iconColor: "text-green-500"
    },
    { 
      icon: PieIcon, 
      label: 'Consumption by Type', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(247,198,4,0.15) 0%, rgba(247,198,4,0.06) 50%, rgba(247,198,4,0) 100%)",
      iconColor: "text-yellow-500"
    },
    { 
      icon: Database, 
      label: 'Main Database', 
      href: '#',
      gradient: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.06) 50%, rgba(139,92,246,0) 100%)",
      iconColor: "text-purple-500"
    },
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
      
      <div className="mb-6 flex justify-center">
        <MenuBar
          items={menuItems}
          activeItem={activeSubModule}
          onItemClick={(label) => setActiveSubModule(label)}
          className="w-fit"
        />
      </div>
      
      {renderSubModule()}
    </div>
  )
}