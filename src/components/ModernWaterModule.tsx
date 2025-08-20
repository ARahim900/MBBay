import React, { useState } from 'react';
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Home, 
  User, 
  ChevronsRight,
  RefreshCw,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { 
  Card, 
  KpiCard, 
  Button, 
  Navigation, 
  Table, 
  ModernAreaChart, 
  ModernBarChart,
  DonutChart 
} from './ui';
import { theme } from '../lib/theme';

// Mock data - replace with your actual data
const mockData = {
  overview: {
    kpis: [
      {
        title: "Total Consumption",
        value: "2112.7",
        unit: "MWh",
        subtitle: "-10% vs last month",
        trend: { value: -10, isPositive: false, period: "vs last month" },
        color: "blue" as const,
        icon: Droplets
      },
      {
        title: "Total Cost",
        value: "52818.31",
        unit: "OMR",
        subtitle: "Total consumption × 0.025",
        trend: { value: 5.2, isPositive: true, period: "vs last month" },
        color: "green" as const,
        icon: TrendingUp
      },
      {
        title: "Total Meters",
        value: "57",
        unit: "meters",
        subtitle: "All meter types",
        color: "yellow" as const,
        icon: Home
      },
      {
        title: "Highest Consumer",
        value: "Beachwell",
        subtitle: "392,489 kWh / 9812.23 OMR",
        color: "orange" as const,
        icon: User
      }
    ],
    distributionLevels: [
      { 
        title: "A1 - MAIN SOURCE (L1)", 
        value: "251,842", 
        unit: "m³", 
        subtitle: "Main Bulk (NAMA)",
        icon: Droplets,
        color: "purple" as const
      },
      { 
        title: "A2 - ZONE DISTRIBUTION", 
        value: "244,230", 
        unit: "m³", 
        subtitle: "L2 Zone Bulk + Direct",
        icon: ChevronsRight,
        color: "blue" as const
      },
      { 
        title: "A3 - BUILDING LEVEL", 
        value: "201,857", 
        unit: "m³", 
        subtitle: "L3 Buildings + Villas",
        icon: Home,
        color: "green" as const
      },
      { 
        title: "A4 - END USERS", 
        value: "201,266", 
        unit: "m³", 
        subtitle: "L4 Apartments + L3 End",
        icon: User,
        color: "teal" as const
      }
    ],
    chartData: [
      { name: 'Jan-25', 'L1-Main Source': 450000, 'L2-Zone Bulk Meters': 420000, 'L3-Building/Villa Meters': 380000 },
      { name: 'Feb-25', 'L1-Main Source': 480000, 'L2-Zone Bulk Meters': 450000, 'L3-Building/Villa Meters': 410000 },
      { name: 'Mar-25', 'L1-Main Source': 520000, 'L2-Zone Bulk Meters': 480000, 'L3-Building/Villa Meters': 440000 },
      { name: 'Apr-25', 'L1-Main Source': 550000, 'L2-Zone Bulk Meters': 510000, 'L3-Building/Villa Meters': 470000 },
      { name: 'May-25', 'L1-Main Source': 580000, 'L2-Zone Bulk Meters': 540000, 'L3-Building/Villa Meters': 500000 },
      { name: 'Jun-25', 'L1-Main Source': 620000, 'L2-Zone Bulk Meters': 580000, 'L3-Building/Villa Meters': 530000 },
      { name: 'Jul-25', 'L1-Main Source': 650000, 'L2-Zone Bulk Meters': 600000, 'L3-Building/Villa Meters': 550000 },
    ]
  },
  zones: {
    kpis: [
      {
        title: "Zone Bulk Meter",
        value: "3,203",
        unit: "m³",
        subtitle: "Zone 08",
        color: "blue" as const
      },
      {
        title: "Individual Meters Total",
        value: "1,053",
        unit: "m³",
        subtitle: "22 meters",
        color: "green" as const
      },
      {
        title: "Water Loss/Variance",
        value: "2,150",
        unit: "m³",
        subtitle: "67.1% variance",
        color: "red" as const
      },
      {
        title: "Zone Efficiency",
        value: "32.9",
        unit: "%",
        subtitle: "Meter coverage",
        color: "yellow" as const
      }
    ],
    tableData: [
      { 
        meter: 'Z8-11', 
        account: '4300023', 
        type: 'Residential (Villa)', 
        jan: 0, 
        feb: 1, 
        mar: 0, 
        apr: 0, 
        may: 0, 
        jun: 0, 
        total: 1, 
        status: 'No Usage' 
      },
      { 
        meter: 'Z8-13', 
        account: '4300024', 
        type: 'Residential (Villa)', 
        jan: 0, 
        feb: 0, 
        mar: 0, 
        may: 0, 
        apr: 0, 
        jun: 1, 
        total: 1, 
        status: 'No Usage' 
      },
      { 
        meter: 'Z8-1', 
        account: '4300188', 
        type: 'Residential (Villa)', 
        jan: 1, 
        feb: 2, 
        mar: 3, 
        apr: 16, 
        may: 7, 
        jun: 0, 
        total: 29, 
        status: 'Normal' 
      }
    ]
  }
};

const WaterOverview = () => {
  return (
    <div className="space-y-6">
      {/* Date Range Controls */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                value="Jan-25" 
                readOnly 
                className="p-2 border rounded-md w-28 text-center bg-gray-50 dark:bg-slate-700 dark:border-slate-600" 
              />
              <span className="text-gray-500">to</span>
              <input 
                type="text" 
                value="Jul-25" 
                readOnly 
                className="p-2 border rounded-md w-28 text-center bg-gray-50 dark:bg-slate-700 dark:border-slate-600" 
              />
            </div>
            <Button variant="ghost" size="sm" icon={RefreshCw}>
              Refresh
            </Button>
          </div>
          <Button variant="primary" size="md">
            AI Analysis
          </Button>
        </div>
      </Card>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.overview.kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            subtitle={kpi.subtitle}
            trend={kpi.trend}
            color={kpi.color}
            icon={kpi.icon}
            variant="default"
          />
        ))}
      </div>

      {/* Distribution Levels */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            4-Level Water Distribution
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Totals for Jan-25 to Jul-25
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.overview.distributionLevels.map((level, index) => (
            <KpiCard
              key={index}
              title={level.title}
              value={level.value}
              unit={level.unit}
              subtitle={level.subtitle}
              icon={level.icon}
              color={level.color}
              variant="minimal"
              size="sm"
            />
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModernAreaChart
          title="Monthly Consumption Trend"
          subtitle="Water consumption across distribution levels"
          data={mockData.overview.chartData}
          areas={[
            { dataKey: 'L1-Main Source', name: 'L1 - Main Source', color: theme.colors.primary[500] },
            { dataKey: 'L2-Zone Bulk Meters', name: 'L2 - Zone Bulk Meters', color: theme.colors.secondary[500] },
            { dataKey: 'L3-Building/Villa Meters', name: 'L3 - Building/Villa Meters', color: theme.colors.accent.orange }
          ]}
          height={350}
          actions={
            <Button variant="outline" size="sm" icon={Download}>
              Export
            </Button>
          }
        />
        
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribution Efficiency
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              System performance overview
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <DonutChart
              value={85}
              color={theme.colors.secondary[500]}
              title="85%"
              subtitle="Overall Efficiency"
              size="md"
            />
            <DonutChart
              value={67}
              color={theme.colors.status.warning}
              title="67%"
              subtitle="Loss Variance"
              size="md"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

const ZoneAnalysis = () => {
  const tableColumns = [
    { key: 'meter', label: 'Meter Label', sortable: true },
    { key: 'account', label: 'Account #', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'jan', label: 'Jan-25', sortable: true, align: 'right' as const },
    { key: 'feb', label: 'Feb-25', sortable: true, align: 'right' as const },
    { key: 'mar', label: 'Mar-25', sortable: true, align: 'right' as const },
    { key: 'apr', label: 'Apr-25', sortable: true, align: 'right' as const },
    { key: 'may', label: 'May-25', sortable: true, align: 'right' as const },
    { key: 'total', label: 'Total', sortable: true, align: 'right' as const },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Normal' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Zone Selection */}
      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 mr-2">Select Month</label>
              <select className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option>Apr-25</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 mr-2">Filter by Zone</label>
              <select className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">
                <option>Zone 08</option>
              </select>
            </div>
          </div>
          <Button variant="ghost" size="sm" icon={RefreshCw}>
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* Zone KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockData.zones.kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            subtitle={kpi.subtitle}
            color={kpi.color}
            variant="gradient"
          />
        ))}
      </div>

      {/* Zone Analysis Chart */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Zone 08 Analysis for Apr-25
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Zone bulk vs individual meters consumption analysis
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DonutChart
            value={100}
            color={theme.colors.primary[500]}
            title="3,203"
            subtitle="Zone Bulk Meter"
            size="md"
          />
          <DonutChart
            value={33}
            color={theme.colors.secondary[500]}
            title="1,053"
            subtitle="Individual Meters Total"
            size="md"
          />
          <DonutChart
            value={67}
            color={theme.colors.status.error}
            title="2,150"
            subtitle="Water Loss Distribution"
            size="md"
          />
        </div>
      </Card>

      {/* Individual Meters Table */}
      <Table
        title="Individual Meters - Zone 08"
        subtitle="Detailed consumption data for all meters in the zone"
        data={mockData.zones.tableData}
        columns={tableColumns}
        searchable={true}
        exportable={true}
        pagination={true}
        pageSize={10}
        onExport={() => console.log('Export data')}
      />
    </div>
  );
};

export const ModernWaterModule = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Droplets },
    { id: 'zones', label: 'Zone Analysis', icon: Home },
    { id: 'consumption', label: 'Consumption by Type', icon: TrendingUp },
    { id: 'database', label: 'Main Database', icon: Filter }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WaterOverview />;
      case 'zones':
        return <ZoneAnalysis />;
      default:
        return <WaterOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Droplets className="w-8 h-8 text-blue-500" />
              Water Management System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive water distribution and consumption monitoring
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-2">
        <Navigation
          items={navigationItems}
          activeItem={activeTab}
          onItemClick={setActiveTab}
          variant="tabs"
          orientation="horizontal"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};