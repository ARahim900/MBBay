

import React, { useState, useEffect } from 'react';
import { create } from 'zustand';
import { Bell, Droplets, HardHat, Home, Menu, Power, Settings, User, Wind, X, TrendingUp, Filter, Download, PieChart as PieIcon, Database, LayoutGrid, TrendingDown, RefreshCw, Calendar, ChevronDown, ChevronRight, ChevronsRight, Search, LayoutDashboard, MapPin, CheckCircle, BarChart2, AlertTriangle, XCircle, Flame } from 'lucide-react';
import { EnhancedWaterModule } from './src/components/EnhancedWaterModule';
import { EnhancedElectricityModule } from './src/components/EnhancedElectricityModule';
import { EnhancedHVACModule } from './src/components/EnhancedHVACModule';
import { EnhancedSTPModule } from './src/components/EnhancedSTPModule';
import { FirefightingDashboard } from './src/components/FirefightingDashboard';
import { ContractorTrackerDashboard } from './src/components/ContractorTrackerDashboard';
import { ToastProvider } from './src/components/contractor/ErrorToast';
import { SimpleSTPModuleBackup } from './src/components/SimpleSTPModuleBackup';
import { STPErrorBoundary } from './src/components/STPErrorBoundary';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { theme } from './src/lib/theme';


// -- STATE MANAGEMENT (ZUSTAND) --
interface AppState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const useAppStore = create<AppState>((set) => ({
  activeModule: 'Water',
  setActiveModule: (module) => set({ activeModule: module }),
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isSidebarCollapsed: false,
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

// Import the new UI components
import { 
  Card, 
  KpiCard, 
  Button, 
  Sidebar as UISidebar,
  ModernAreaChart as UIModernAreaChart,
  ModernBarChart,
  ModernDonutChart,
  ChartConfig 
} from './src/components/ui';

// -- WATER MODULE MOCK DATA (DERIVED FROM SCREENSHOTS) --
const overviewConsumptionData = [
  { name: 'Jan-25', 'L1-Main Source': 450000, 'L2-Zone Bulk Meters': 420000, 'L3-Building/Villa Meters': 380000 },
  { name: 'Feb-25', 'L1-Main Source': 480000, 'L2-Zone Bulk Meters': 450000, 'L3-Building/Villa Meters': 410000 },
  { name: 'Mar-25', 'L1-Main Source': 520000, 'L2-Zone Bulk Meters': 480000, 'L3-Building/Villa Meters': 440000 },
  { name: 'Apr-25', 'L1-Main Source': 550000, 'L2-Zone Bulk Meters': 510000, 'L3-Building/Villa Meters': 470000 },
  { name: 'May-25', 'L1-Main Source': 580000, 'L2-Zone Bulk Meters': 540000, 'L3-Building/Villa Meters': 500000 },
  { name: 'Jun-25', 'L1-Main Source': 620000, 'L2-Zone Bulk Meters': 580000, 'L3-Building/Villa Meters': 530000 },
  { name: 'Jul-25', 'L1-Main Source': 650000, 'L2-Zone Bulk Meters': 600000, 'L3-Building/Villa Meters': 550000 },
];
const overviewWaterLossData = [
    { name: 'Jan-25', 'Stage 1 Loss': 10000, 'Stage 2 Loss': 30000 }, { name: 'Feb-25', 'Stage 1 Loss': 12000, 'Stage 2 Loss': 32000 },
    { name: 'Mar-25', 'Stage 1 Loss': 15000, 'Stage 2 Loss': 35000 }, { name: 'Apr-25', 'Stage 1 Loss': 13000, 'Stage 2 Loss': 33000 },
    { name: 'May-25', 'Stage 1 Loss': 18000, 'Stage 2 Loss': 38000 }, { name: 'Jun-25', 'Stage 1 Loss': 16000, 'Stage 2 Loss': 36000 },
    { name: 'Jul-25', 'Stage 1 Loss': 20000, 'Stage 2 Loss': 40000 },
];
const zone08IndividualMeters = [
    { label: 'Z8-11', account: '4300023', type: 'Residential (Villa)', jan: 0, feb: 1, mar: 0, apr: 0, may: 0, jun: 0, total: 1, status: 'No Usage' },
    { label: 'Z8-13', account: '4300024', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, may: 0, apr: 0, jun: 1, total: 1, status: 'No Usage' },
    { label: 'Z8-1', account: '4300188', type: 'Residential (Villa)', jan: 1, feb: 2, mar: 3, apr: 16, may: 7, jun: 0, total: 29, status: 'Normal' },
    { label: 'Z8-2', account: '4300189', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
    { label: 'Z8-3', account: '4300190', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
    { label: 'Z8-4', account: '4300191', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
    { label: 'Z8-6', account: '4300192', type: 'Residential (Villa)', jan: 1, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 1, status: 'No Usage' },
    { label: 'Z8-7', account: '4300193', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
    { label: 'Z8-8', account: '4300194', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
    { label: 'Z8-10', account: '4300195', type: 'Residential (Villa)', jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, status: 'No Usage' },
];
const zoneConsumptionTrend = [
    { name: 'Jan-25', Individual: 1200, Loss: 1600, ZoneBulk: 2800 }, { name: 'Feb-25', Individual: 1500, Loss: 1700, ZoneBulk: 3200 },
    { name: 'Mar-25', Individual: 1400, Loss: 1700, ZoneBulk: 3100 }, { name: 'Apr-25', Individual: 1053, Loss: 2150, ZoneBulk: 3203 },
    { name: 'May-25', Individual: 1600, Loss: 1900, ZoneBulk: 3500 }, { name: 'Jun-25', Individual: 2000, Loss: 2200, ZoneBulk: 4200 },
    { name: 'Jul-25', Individual: 1900, Loss: 2100, ZoneBulk: 4000 },
];
const consumptionByTypeBreakdown = [ { name: 'Jan-25', consumption: 19580 }, { name: 'Feb-25', consumption: 20970 }, { name: 'Mar-25', consumption: 22151 }, { name: 'Apr-25', consumption: 28676 }, { name: 'May-25', consumption: 27963 }, { name: 'Jun-25', consumption: 18379 }, { name: 'Jul-25', consumption: 15713 }];
const consumptionByTypeTable = [{ type: 'Commercial', jan: 19580, feb: 20970, mar: 22151, apr: 28676, may: 27963, jun: 18379, jul: 15713, total: 153442, ofL1: 52.8 }];
const mainDatabaseMeters = [
    { label: 'Main Bulk (NAMA)', account: 'C43659', zone: 'Main Bulk', type: 'Main BULK', parent: 'NAMA', level: 'L1', jan: 32580, feb: 44043, mar: 34915, apr: 46039, may: 58425, jun: 41840, total: 257842 },
    { label: 'ZONE 8 (Bulk Zone 8)', account: '4300342', zone: 'Zone_08', type: 'Zone Bulk', parent: 'Main Bulk (NAMA)', level: 'L2', jan: 1547, feb: 1498, mar: 2605, apr: 3203, may: 2937, jun: 3142, total: 14932 },
    { label: 'ZONE 3A (BULK Zone 3A)', account: '4300343', zone: 'Zone_03_(A)', type: 'Zone Bulk', parent: 'Main Bulk (NAMA)', level: 'L2', jan: 4235, feb: 4273, mar: 3591, apr: 4041, may: 4898, jun: 6484, total: 27522 },
    { label: 'ZONE 3B (BULK Zone 3B)', account: '4300344', zone: 'Zone_03_(B)', type: 'Zone Bulk', parent: 'Main Bulk (NAMA)', level: 'L2', jan: 3256, feb: 2962, mar: 3331, apr: 2157, may: 3093, jun: 2917, total: 17716 },
    { label: 'ZONE 5 (Bulk Zone 5)', account: '4300345', zone: 'Zone_05', type: 'Zone Bulk', parent: 'Main Bulk (NAMA)', level: 'L2', jan: 4267, feb: 4231, mar: 3862, apr: 3737, may: 3849, jun: 4113, total: 24059 },
];



// -- WATER MODULE SUBSECTIONS --
const WaterOverview = () => {
    const distributionLevels = [
        { icon: Droplets, value: "251,842", unit: "m³", title: "A1 - MAIN SOURCE (L1)", subtitle: "Main Bulk (NAMA)", color: "text-purple-500", bgColor: "bg-purple-50" },
        { icon: ChevronsRight, value: "244,230", unit: "m³", title: "A2 - ZONE DISTRIBUTION", subtitle: "L2 Zone Bulk + Direct", color: "text-blue-500", bgColor: "bg-blue-50" },
        { icon: Home, value: "201,857", unit: "m³", title: "A3 - BUILDING LEVEL", subtitle: "L3 Buildings + Villas", color: "text-green-500", bgColor: "bg-green-50" },
        { icon: User, value: "201,266", unit: "m³", title: "A4 - END USERS", subtitle: "L4 Apartments + L3 End", color: "text-yellow-600", bgColor: "bg-yellow-50" },
    ];

    const lossStats = [
        { title: "STAGE 1 LOSS (A1-A2)", value: "13,612 m³", subValue: "Main distribution: 5.3%", color: "border-red-500" },
        { title: "STAGE 2 LOSS (L2+L3)", value: "42,373 m³", subValue: "Zonal distribution: 44.4%", color: "border-orange-500" },
        { title: "STAGE 3 LOSS", value: "591 m³", subValue: "Building Networks: 0.3%", color: "border-yellow-500" },
        { title: "TOTAL SYSTEM LOSS", value: "56,576 m³", subValue: "Overall: 20.6%", color: "border-pink-500" },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <input type="text" value="Jan-25" readOnly className="p-2 border rounded-md w-28 text-center bg-gray-50 dark:bg-white/10" />
                        <span>to</span>
                        <input type="text" value="Jul-25" readOnly className="p-2 border rounded-md w-28 text-center bg-gray-50 dark:bg-white/10" />
                        <button className="text-gray-500 hover:text-gray-800 transition-transform duration-200 hover:rotate-90"><RefreshCw className="w-5 h-5" /></button>
                    </div>
                    <button className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition-all active:scale-95">AI Analysis</button>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">4-Level Water Distribution</h3>
                <p className="text-sm text-gray-500 mb-4">Totals for Jan-25 to Jul-25</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {distributionLevels.map(item => (
                        <div key={item.title} className={`p-4 rounded-lg ${item.bgColor} dark:bg-white/5`}>
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-8 h-8 ${item.color}`} />
                                <div>
                                    <p className="font-bold text-xl text-[#4E4456] dark:text-white">{item.value} <span className="text-sm font-normal">{item.unit}</span></p>
                                    <p className="text-xs text-gray-500 font-semibold">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
             <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Multi-Stage Water Loss</h3>
                <p className="text-sm text-gray-500 mb-4">Totals for Jan-25 to Jul-25</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {lossStats.map(stat => (
                       <div key={stat.title} className={`p-4 rounded-lg border-l-4 ${stat.color} bg-gray-50 dark:bg-white/5`}>
                           <p className="text-sm font-semibold text-gray-500">{stat.title}</p>
                           <p className="text-2xl font-bold text-[#4E4456] dark:text-white">{stat.value}</p>
                           <p className="text-xs text-gray-400">{stat.subValue}</p>
                       </div>
                   ))}
                </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <UIModernAreaChart 
                    data={overviewConsumptionData}
                    config={{
                        'L1-Main Source': { label: 'L1 - Main Source', color: theme.colors.primary },
                        'L2-Zone Bulk Meters': { label: 'L2 - Zone Bulk Meters', color: theme.colors.secondary },
                        'L3-Building/Villa Meters': { label: 'L3 - Building/Villa Meters', color: theme.colors.accent }
                    }}
                    title="Monthly Consumption Trend"
                    height="h-[300px]"
                    showLegend={true}
                    curved={true}
                />
                <UIModernAreaChart 
                    data={overviewWaterLossData}
                    config={{
                        'Stage 1 Loss': { label: 'Stage 1 Loss', color: theme.colors.secondary },
                        'Stage 2 Loss': { label: 'Stage 2 Loss', color: theme.colors.extended.orange }
                    }}
                    title="Monthly Water Loss Trend"
                    height="h-[300px]"
                    showLegend={true}
                    curved={true}
                />
            </div>
        </div>
    );
}

const ZoneAnalysis = () => {
    const kpis = [
      { title: "ZONE BULK METER", value: "3,203 m³", subValue: "Zone 08", color: "text-blue-500" },
      { title: "INDIVIDUAL METERS TOTAL", value: "1,053 m³", subValue: "22 meters", color: "text-green-500" },
      { title: "WATER LOSS/VARIANCE", value: "2,150 m³", subValue: "67.1% variance", color: "text-red-500" },
      { title: "ZONE EFFICIENCY", value: "32.9%", subValue: "Meter coverage", color: "text-yellow-500" },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500 mr-2">Select Month</label>
                        <select className="p-2 border rounded-md dark:bg-white/10"><option>Apr-25</option></select>
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-500 mr-2">Filter by Zone</label>
                        <select className="p-2 border rounded-md dark:bg-white/10"><option>Zone 08</option></select>
                    </div>
                    <button className="text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-transform duration-200 hover:rotate-90"><RefreshCw className="w-4 h-4" /> Reset Filters</button>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-2">Zone 08 Analysis for Apr-25</h3>
                <p className="text-sm text-gray-500 mb-4">Zone bulk vs individual meters consumption analysis</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModernDonutChart
                        data={[{ name: 'Zone Bulk Meter', value: 100 }]}
                        config={{ value: { label: 'Zone Bulk Meter', color: theme.colors.primary } }}
                        title="3,203"
                        description="Zone Bulk Meter"
                        height="h-[200px]"
                        showLegend={false}
                    />
                    <ModernDonutChart
                        data={[{ name: 'Individual Meters', value: 33 }]}
                        config={{ value: { label: 'Individual Meters Total', color: theme.colors.extended.green } }}
                        title="1,053"
                        description="Individual Meters Total"
                        height="h-[200px]"
                        showLegend={false}
                    />
                    <ModernDonutChart
                        data={[{ name: 'Water Loss', value: 67 }]}
                        config={{ value: { label: 'Water Loss Distribution', color: theme.colors.secondary } }}
                        title="2,150"
                        description="Water Loss Distribution"
                        height="h-[200px]"
                        showLegend={false}
                    />
                </div>
            </Card>

            <UIModernAreaChart
                data={zoneConsumptionTrend}
                config={{
                    Individual: { label: 'Individual Total', color: theme.colors.extended.green },
                    Loss: { label: 'Water Loss', color: theme.colors.secondary },
                    ZoneBulk: { label: 'Zone Bulk', color: theme.colors.primary }
                }}
                title="Zone Consumption Trend"
                height="h-[300px]"
                showLegend={true}
                curved={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map(kpi => (
                    <Card key={kpi.title} className="flex items-center gap-4">
                        <CheckCircle className={`w-8 h-8 ${kpi.color}`} />
                        <div>
                            <p className="text-sm text-gray-500">{kpi.title}</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">{kpi.value}</p>
                            <p className="text-xs text-gray-400">{kpi.subValue}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Individual Meters - Zone 08</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                            <tr>
                                {['Meter Label', 'Account #', 'Type', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Total', 'Status'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-blue-50 dark:bg-blue-500/10 font-semibold">
                                <td className="px-4 py-2">ZONE 8 (Bulk Zone 8)</td><td className="px-4 py-2">4300342</td><td>Zone Bulk</td>
                                <td className="px-4 py-2">1,547</td><td className="px-4 py-2">1,498</td><td className="px-4 py-2">2,605</td><td className="px-4 py-2">3,203</td><td className="px-4 py-2">2,937</td>
                                <td className="px-4 py-2">14,932</td><td className="px-4 py-2 text-blue-600">L2 - Zone Bulk</td>
                            </tr>
                            {zone08IndividualMeters.map(meter => (
                                <tr key={meter.account} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-4 py-2 font-medium">{meter.label}</td><td className="px-4 py-2">{meter.account}</td><td className="px-4 py-2">{meter.type}</td>
                                    <td className="px-4 py-2">{meter.jan}</td><td className="px-4 py-2">{meter.feb}</td><td className="px-4 py-2">{meter.mar}</td><td className="px-4 py-2">{meter.apr}</td><td className="px-4 py-2">{meter.may}</td>
                                    <td className="px-4 py-2 font-semibold">{meter.total}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${meter.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{meter.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <p>Showing 1 to 10 of 22 meters</p>
                    <div><button className="px-3 py-1 border rounded-md hover:bg-gray-100 transition-colors">Previous</button><button className="px-3 py-1 border rounded-md hover:bg-gray-100 ml-2 transition-colors">Next</button></div>
                </div>
            </Card>
        </div>
    );
}

const ConsumptionByType = () => {
    const kpis = [
        { icon: Droplets, title: "TOTAL CONSUMPTION", value: "153,442 m³", subtitle: "for selected period", color: "bg-blue-100", iconColor:"text-blue-500" },
        { icon: Calendar, title: "MONTHLY AVERAGE", value: "21,920 m³", subtitle: "average across 7 months", color: "bg-green-100", iconColor:"text-green-500" },
        { icon: TrendingUp, title: "PEAK MONTH", value: "Apr-25", subtitle: "28,676 m³", color: "bg-red-100", iconColor:"text-red-500" },
        { icon: PieIcon, title: "% OF L1 SUPPLY", value: "52.8%", subtitle: "Commercial share of total", color: "bg-teal-100", iconColor:"text-teal-500" },
    ];
    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-500">Filter by Usage Type</span>
                        <button className="px-4 py-2 rounded-lg bg-green-500 text-white transition-all active:scale-95">Commercial</button>
                        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 transition-all active:scale-95 hover:bg-gray-300">Residential</button>
                        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 transition-all active:scale-95 hover:bg-gray-300">Irrigation</button>
                        <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 transition-all active:scale-95 hover:bg-gray-300">Common</button>
                    </div>
                     <button className="text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-transform duration-200 hover:rotate-90"><RefreshCw className="w-4 h-4" /> Reset Range</button>
                </div>
            </Card>

             <Card>
                 <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Consumption Analysis: <span className="text-green-500">Commercial</span></h3>
                        <p className="text-sm text-gray-500">Jan-25 to Jul-25</p>
                    </div>
                    <button className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95">
                        <Download className="h-4 w-4" /> Export
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                     {kpis.map(kpi => (
                         <div key={kpi.title} className={`p-4 rounded-lg ${kpi.color} dark:bg-white/5`}>
                             <div className="flex items-center gap-4">
                                <div className={`${kpi.iconColor.replace('text-','bg-')}/20 p-2 rounded-lg`}><kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} /></div>
                                 <div>
                                     <p className="text-xs text-gray-500">{kpi.title}</p>
                                     <p className="font-bold text-xl text-[#4E4456] dark:text-white">{kpi.value}</p>
                                     <p className="text-xs text-gray-400">{kpi.subtitle}</p>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </Card>

             <UIModernAreaChart
                data={consumptionByTypeBreakdown}
                config={{
                    consumption: { label: 'Consumption (m³)', color: theme.colors.extended.green }
                }}
                title="Monthly Trend for Commercial"
                height="h-[200px]"
                showLegend={false}
                curved={true}
            />

             <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">Consumption by Type</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                            <tr>{['Type', 'Jan-25 (m³)', 'Feb-25 (m³)', 'Mar-25 (m³)', 'Apr-25 (m³)', 'May-25 (m³)', 'Jun-25 (m³)', 'Jul-25 (m³)', 'Total (m³)', '% of L1'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {consumptionByTypeTable.map(row => (
                                <tr key={row.type} className="border-b dark:border-white/10">
                                    <td className="px-4 py-2 font-medium">{row.type}</td>
                                    {[row.jan, row.feb, row.mar, row.apr, row.may, row.jun, row.jul, row.total].map((val, i) => <td key={i} className="px-4 py-2">{val.toLocaleString()}</td>)}
                                    <td className="px-4 py-2 font-semibold">{row.ofL1}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ModernBarChart
                    data={consumptionByTypeBreakdown}
                    config={{
                        consumption: { label: 'Consumption (m³)', color: theme.colors.extended.teal }
                    }}
                    title="Monthly Consumption Breakdown"
                    height="h-[300px]"
                    showLegend={false}
                />
                <ModernDonutChart
                    data={[{name: 'Commercial', value: 100}]}
                    config={{
                        value: { label: 'Commercial', color: theme.colors.extended.green }
                    }}
                    title="Type Distribution"
                    height="h-[300px]"
                    showLegend={false}
                />
            </div>
        </div>
    );
};

const MainDatabase = () => {
    const kpis = [
        { title: "TOTAL METERS", value: "698", subtitle: "All levels", icon: Database, color: "bg-blue-100", iconColor: "text-blue-500" },
        { title: "L1 METERS", value: "1", subtitle: "Main source", icon: Droplets, color: "bg-gray-100", iconColor: "text-gray-500" },
        { title: "L2 METERS", value: "7", subtitle: "Zone bulk", icon: Droplets, color: "bg-yellow-100", iconColor: "text-yellow-500" },
        { title: "L3 METERS", value: "146", subtitle: "Buildings/Villas", icon: Droplets, color: "bg-green-100", iconColor: "text-green-500" },
        { title: "L4 METERS", value: "183", subtitle: "Apartments", icon: Droplets, color: "bg-purple-100", iconColor: "text-purple-500" },
    ];
    return (
        <div className="space-y-6">
            <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Meter Inventory</h3>
                <p className="text-sm text-gray-500 mb-4">Complete consumption data for all months.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                   {kpis.map(kpi => (
                       <div key={kpi.title} className={`p-4 rounded-lg ${kpi.color} dark:bg-white/5 flex items-center gap-4`}>
                           <div className={`${kpi.iconColor.replace('text-','bg-')}/20 p-2 rounded-full`}><kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} /></div>
                           <div>
                               <p className="font-bold text-xl text-[#4E4456] dark:text-white">{kpi.value}</p>
                               <p className="text-xs text-gray-500">{kpi.title}</p>
                               <p className="text-xs text-gray-400">{kpi.subtitle}</p>
                           </div>
                       </div>
                   ))}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">Water System Main Database</h3>
                    <button className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95">
                        <Download className="h-4 w-4" /> Export to CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                            <tr>{['Meter Label', 'Account #', 'Zone', 'Type', 'Parent Meter', 'Level', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Total'].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {mainDatabaseMeters.map((meter, idx) => (
                                <tr key={idx} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-4 py-2 font-medium">{meter.label}</td>
                                    {[meter.account, meter.zone, meter.parent].map((val, i) => <td key={i} className="px-4 py-2">{val}</td>)}
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                        meter.level === 'L1' ? 'bg-purple-100 text-purple-800' :
                                        meter.level === 'L2' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>{meter.level}</span></td>
                                    {[meter.jan, meter.feb, meter.mar, meter.apr, meter.may, meter.jun].map((val, i) => <td key={i} className="px-4 py-2">{val.toLocaleString()}</td>)}
                                    <td className="px-4 py-2 font-semibold">{meter.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <p>Showing 1 to 10 of 698 meters</p>
                    <div><button className="px-3 py-1 border rounded-md hover:bg-gray-100">Previous</button><span className="mx-2">Page 1 of 70</span><button className="px-3 py-1 border rounded-md hover:bg-gray-100 ml-2">Next</button></div>
                </div>
            </Card>
        </div>
    );
};

// -- WATER MODULE (Enhanced with Supabase) --
const WaterModule = () => {
    return (
        <ErrorBoundary
            fallback={({ error, resetError }) => (
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <h3 className="text-xl font-semibold text-red-600 mb-3">
                            Water Module Error
                        </h3>
                        <p className="text-gray-600 mb-6">
                            The Water Management module encountered an error. This might be due to Supabase connection issues.
                        </p>
                        <button
                            onClick={resetError}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                        >
                            Try Again
                        </button>
                        {error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-gray-500 text-sm">
                                    Technical Details
                                </summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                                    {error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )}
        >
            <EnhancedWaterModule />
        </ErrorBoundary>
    );
};


// -- ELECTRICITY MODULE --
const electricityConsumptionTrendData = [
    { name: 'May-24', kWh: 100000 }, { name: 'Jul-24', kWh: 120000 }, { name: 'Sep-24', kWh: 110000 },
    { name: 'Nov-24', kWh: 150000 }, { name: 'Jan-25', kWh: 180000 }, { name: 'Mar-25', kWh: 200000 },
    { name: 'May-25', kWh: 240000 }, { name: 'Jul-25', kWh: 220000 },
];

const electricityConsumptionByTypeData = [
    { name: 'L1-Building', value: 1000, color: theme.colors.primary },
    { name: 'Retail', value: 800, color: theme.colors.extended.green },
    { name: 'Street Light', value: 400, color: theme.colors.accent },
    { name: 'Others', value: 250, color: theme.colors.gray[400] },
];

const ElectricityModule = () => {
    return (
        <ErrorBoundary>
            <EnhancedElectricityModule />
        </ErrorBoundary>
    );
};


// -- HVAC MODULE --
const HVACModule = () => {
    return (
        <ErrorBoundary>
            <EnhancedHVACModule />
        </ErrorBoundary>
    );
};



// -- CONTRACTOR TRACKER MODULE --
// Now using ContractorTrackerDashboard component with Supabase integration

// -- STP PLANT MODULE --
// -- FIREFIGHTING MODULE --
const FirefightingModule = () => {
    return (
        <ErrorBoundary>
            <FirefightingDashboard />
        </ErrorBoundary>
    );
};

const STPPlantModule = () => {
    const [useBackup, setUseBackup] = useState(false);

    if (useBackup) {
        return <SimpleSTPModuleBackup />;
    }

    return (
        <STPErrorBoundary>
            <React.Suspense fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading STP operations data...</p>
                    </div>
                </div>
            }>
                <EnhancedSTPModule />
            </React.Suspense>
        </STPErrorBoundary>
    );
};


// -- LAYOUT & APP --
const Sidebar = () => {
    const { activeModule, setActiveModule, isSidebarOpen, toggleSidebar, isSidebarCollapsed, toggleSidebarCollapse } = useAppStore();
    const navItems = [ 
        { name: 'Water', icon: Droplets }, 
        { name: 'Electricity', icon: Power }, 
        { name: 'HVAC System', icon: BarChart2 }, 
        { name: 'Firefighting & Alarm', icon: Flame },
        { name: 'Contractor Tracker', icon: HardHat }, 
        { name: 'STP Plant', icon: Settings }, 
    ];
    
    return (
        <aside className={`bg-[#4E4456] text-white fixed top-[73px] left-0 z-30 h-[calc(100vh-73px)] transition-all duration-300 ease-in-out border-r border-white/10 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}>
            {/* Mobile Close Button */}
            <div className="md:hidden flex justify-end p-3">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-white hover:text-[#A2D0C8]"
                    title="Close sidebar"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>
            
            <nav className="p-4 flex-1 flex flex-col">
                <ul className="flex-1">
                    {navItems.map(({ name, icon: Icon }) => {
                        const isActive = activeModule === name;
                        return (
                            <li 
                                key={name} 
                                onClick={() => { 
                                    setActiveModule(name); 
                                    if (isSidebarOpen) toggleSidebar(); 
                                }} 
                                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} p-3 my-1 rounded-lg cursor-pointer transition-all duration-300 group relative ${
                                    isActive 
                                        ? 'bg-[#A2D0C8] text-[#4E4456] shadow-lg' 
                                        : 'text-gray-300 hover:bg-white/5 hover:translate-x-1'
                                }`}
                                title={isSidebarCollapsed ? name : ''}
                            >
                                <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-4'}`} /> 
                                {!isSidebarCollapsed && <span className="font-medium">{name}</span>}
                                
                                {/* Tooltip for collapsed sidebar */}
                                {isSidebarCollapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                        {name}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
                
            </nav>
            
            {/* Collapse Toggle Button - Fixed at bottom of viewport, within sidebar horizontal area */}
            <button 
                onClick={toggleSidebarCollapse}
                className="hidden md:block fixed bottom-4 z-50 p-2 rounded-lg bg-[#2C3E50]/90 hover:bg-[#34495E]/90 backdrop-blur-sm text-gray-300 hover:text-[#A2D0C8] transition-all duration-200 border border-white/10 shadow-lg"
                style={{
                    right: isSidebarCollapsed ? '24px' : '24px', // 24px from right edge of sidebar (same as p-4 padding)
                    left: 'auto' // Override any left positioning from className
                }}
                title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isSidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                ) : (
                    <div className="flex items-center gap-1">
                        <ChevronsRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-2" />
                    </div>
                )}
            </button>
        </aside>
    );
};
const Header = () => {
    const { activeModule, toggleSidebar, isDarkMode, toggleDarkMode } = useAppStore();
    return (
        <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#4E4456] shadow-[0_4px_20px_rgba(0,0,0,0.25),0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_12px_40px_rgba(0,0,0,0.3)] h-[73px]">
            {/* Left side with logo and app name */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden text-white hover:text-[#A2D0C8] transition-colors"> 
                    <Menu className="h-6 w-6" /> 
                </button>
                
                {/* Logo and App Name - Always visible */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img 
                            src="/MB-logo.png" 
                            alt="Muscat Bay Logo" 
                            className="w-12 h-12 rounded-xl shadow-md border-2 border-white/20 transition-transform duration-200 hover:scale-105" 
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#A2D0C8] rounded-full border-2 border-[#4E4456]"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-white tracking-wide">Muscat Bay</h1>
                        <p className="text-xs text-[#A2D0C8] font-medium">Utilities Management</p>
                    </div>
                </div>
                
                {/* Current Module Indicator */}
                <div className="hidden md:flex items-center ml-8">
                    <div className="h-6 w-px bg-white/20 mr-4"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#A2D0C8] rounded-full animate-pulse"></div>
                        <h2 className="text-lg font-semibold text-white">{activeModule}</h2>
                    </div>
                </div>
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center space-x-3">
                <button 
                    onClick={toggleDarkMode} 
                    className="p-2 text-white/80 hover:text-[#A2D0C8] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                > 
                    {isDarkMode ? (
                        <div className="flex items-center gap-1">
                            <span className="text-lg">☀️</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <span className="text-lg">🌙</span>
                        </div>
                    )}
                </button>
                
                <button 
                    className="relative p-2 text-white/80 hover:text-[#A2D0C8] hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110"
                    title="Notifications"
                > 
                    <Bell className="h-6 w-6" /> 
                    <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[#4E4456] animate-pulse"></span> 
                </button>
                
                <div className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <div className="h-9 w-9 bg-gradient-to-br from-[#A2D0C8] to-[#7FB8B3] rounded-full flex items-center justify-center text-[#4E4456] font-bold shadow-md"> 
                        <User className="h-5 w-5" /> 
                    </div>
                    <div className="hidden md:flex flex-col">
                        <span className="text-sm font-medium text-white">Admin</span>
                        <span className="text-xs text-[#A2D0C8]">Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default function App() {
  const { activeModule, isDarkMode, isSidebarCollapsed, toggleSidebarCollapse } = useAppStore();
  
  useEffect(() => { 
    if (isDarkMode) { 
      document.documentElement.classList.add('dark'); 
    } else { 
      document.documentElement.classList.remove('dark'); 
    } 
  }, [isDarkMode]);

  const renderModule = () => {
    try {
      switch (activeModule) {
        case 'Water': return <WaterModule />;
        case 'Electricity': return <ElectricityModule />;
        case 'HVAC System': return <HVACModule />;
        case 'Firefighting & Alarm': return <FirefightingModule />;
        case 'Contractor Tracker': return (
          <ErrorBoundary>
            <ContractorTrackerDashboard />
          </ErrorBoundary>
        );
        case 'STP Plant': return <STPPlantModule />;
        default: return <WaterModule />; // Default to Water
      }
    } catch (error) {
      console.error('Error rendering module:', error);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Module Loading Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              There was an error loading the {activeModule} module.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="bg-[#F7F7F9] dark:bg-[#1A181F] min-h-screen">
          <Sidebar />
          <Header />
          
          {/* Main content area that adapts to sidebar width */}
          <div className={`transition-all duration-300 ease-in-out pt-[73px] ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}>
            <main className="p-6">
              {renderModule()}
            </main>
          </div>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}