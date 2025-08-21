import React, { useState, useEffect } from 'react';
import { 
  ModernAreaChart, 
  ModernBarChart, 
  ModernLineChart, 
  ChartConfig 
} from './ui/ModernChart';
import { ModernDateRangeSlider } from './ui/Slider';
import { TrendingUp, Download, Database, LayoutGrid, Tag, RefreshCw, Calendar, ChevronDown, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Month mapping for electricity data
const monthColumns = ['may_24', 'jun_24', 'jul_24'];
const monthLabels = ['May-24', 'Jun-24', 'Jul-24'];
const monthMapping = [
  { label: 'May-24', value: 0, column: 'may_24' },
  { label: 'Jun-24', value: 1, column: 'jun_24' },
  { label: 'Jul-24', value: 2, column: 'jul_24' }
];

// Card Component
const Card = ({ children, className = '' }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), Math.random() * 200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`bg-white dark:bg-[#2C2834] rounded-xl shadow-md hover:shadow-xl border border-gray-200/80 dark:border-white/10 p-4 md:p-6 transition-all duration-300 hover:-translate-y-1 ${isMounted ? 'fade-in-up' : 'opacity-0 translate-y-4'} ${className}`}>
            {children}
        </div>
    );
};

// Calculation Functions
const calculateTotalConsumption = (meters: any[], startMonth: number, endMonth: number) => {
    if (!meters || meters.length === 0) return 0;
    
    // Get the selected month columns based on indices
    const selectedColumns = monthColumns.slice(startMonth, endMonth + 1);
    
    return meters.reduce((total, meter) => {
        const meterTotal = selectedColumns.reduce((sum, col) => sum + (meter[col] || 0), 0);
        return total + meterTotal;
    }, 0);
};

const calculateCost = (consumption: number) => {
    return consumption * 0.025;
};

const getTopConsumer = (meters: any[], startMonth: number, endMonth: number) => {
    if (!meters || meters.length === 0) return null;
    
    const selectedColumns = monthColumns.slice(startMonth, endMonth + 1);
    
    let topMeter = null;
    let maxConsumption = 0;
    
    meters.forEach(meter => {
        const consumption = selectedColumns.reduce((sum, col) => sum + (meter[col] || 0), 0);
        if (consumption > maxConsumption) {
            maxConsumption = consumption;
            topMeter = { ...meter, totalConsumption: consumption };
        }
    });
    
    return topMeter;
};

const formatNumber = (num: number) => {
    return num.toLocaleString();
};

const formatMWh = (kWh: number) => {
    return (kWh / 1000).toFixed(1);
};

// Tab 1: Analysis by Type Component
const AnalysisByTypeTab = ({ meters, dateRange, onDateRangeChange }: any) => {
    const [selectedType, setSelectedType] = useState('');
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
        if (meters && meters.length > 0) {
            const types = [...new Set(meters.map((m: any) => m.type).filter(Boolean))];
            setAvailableTypes(types);
            if (types.length > 0 && !selectedType) {
                setSelectedType(types[0]);
            }
        }
    }, [meters]);
    
    const filteredMeters = meters?.filter((m: any) => m.type === selectedType) || [];
    const totalConsumption = calculateTotalConsumption(filteredMeters, dateRange.start, dateRange.end);
    const totalCost = calculateCost(totalConsumption);
    const meterCount = filteredMeters.length;
    const topConsumer = getTopConsumer(filteredMeters, dateRange.start, dateRange.end);
    
    // Generate monthly trend data
    const trendData = monthColumns.map((col, idx) => ({
        month: monthLabels[idx],
        consumption: filteredMeters.reduce((sum: number, meter: any) => sum + (meter[col] || 0), 0)
    }));
    
    // Table data with totals
    const tableData = filteredMeters.map((meter: any) => ({
        ...meter,
        totalConsumption: calculateTotalConsumption([meter], dateRange.start, dateRange.end),
        totalCost: calculateCost(calculateTotalConsumption([meter], dateRange.start, dateRange.end))
    }));
    
    // Handle range slider change
    const handleRangeChange = (startMonth: number, endMonth: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            onDateRangeChange({ start: startMonth, end: endMonth });
            setIsAnimating(false);
        }, 300);
    };
    
    return (
        <div className="space-y-6">
            {/* Filter Buttons */}
            <Card>
                <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-500 self-center mr-2">Filter by Type:</span>
                    {availableTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg transition-all ${
                                selectedType === type 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </Card>
            
            {/* Modern Range Slider */}
            <ModernDateRangeSlider 
                onRangeChange={handleRangeChange}
                defaultStart={dateRange.start}
                defaultEnd={dateRange.end}
            />
            
            {/* Analysis Title */}
            <Card className={`transition-all duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">
                    Analysis for {selectedType} from {monthLabels[dateRange.start]} to {monthLabels[dateRange.end]}
                </h3>
            </Card>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-500/10">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOTAL CONSUMPTION</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">
                                {formatMWh(totalConsumption)} MWh
                            </p>
                            <p className="text-xs text-gray-400">{formatNumber(totalConsumption)} kWh</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-green-50 dark:bg-green-500/10">
                    <div className="flex items-center gap-4">
                        <Database className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOTAL COST</p>
                            <p className="font-bold text-xl text-green-500">
                                {totalCost.toFixed(2)} OMR
                            </p>
                            <p className="text-xs text-gray-400">Based on 0.025 OMR/kWh</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-yellow-50 dark:bg-yellow-500/10">
                    <div className="flex items-center gap-4">
                        <Tag className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-xs text-gray-500">METER COUNT</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">{meterCount}</p>
                            <p className="text-xs text-gray-400">{selectedType} meters</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-red-50 dark:bg-red-500/10">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOP CONSUMER</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">
                                {topConsumer?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {topConsumer ? `${formatNumber(topConsumer.totalConsumption)} kWh` : 'No data'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            
            {/* Chart */}
            <div className={`transition-all duration-500 ${isAnimating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
                <ModernAreaChart
                    data={trendData}
                    config={{
                        consumption: {
                            label: 'Consumption (kWh)',
                            color: '#10B981'
                        }
                    }}
                    title={`Monthly Trend for ${selectedType}`}
                    height="h-[300px]"
                    showLegend={false}
                    curved={true}
                />
            </div>
            
            {/* Table */}
            <Card>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white mb-4">
                    Meter Details for {selectedType}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Account #</th>
                                <th className="px-4 py-3">Total Consumption (kWh)</th>
                                <th className="px-4 py-3">Total Cost (OMR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((meter, idx) => (
                                <tr key={idx} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-4 py-2 font-medium">{meter.name}</td>
                                    <td className="px-4 py-2">{meter.account}</td>
                                    <td className="px-4 py-2">{formatNumber(meter.totalConsumption)}</td>
                                    <td className="px-4 py-2 text-green-500 font-semibold">
                                        {meter.totalCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Tab 2: Overview Component
const OverviewTab = ({ meters, dateRange, onDateRangeChange }: any) => {
    const [isAnimating, setIsAnimating] = useState(false);
    
    const totalConsumption = calculateTotalConsumption(meters || [], dateRange.start, dateRange.end);
    const totalCost = calculateCost(totalConsumption);
    const totalMeters = meters?.length || 0;
    const topConsumer = getTopConsumer(meters || [], dateRange.start, dateRange.end);
    
    // Generate monthly trend data
    const monthlyTrendData = monthColumns.map((col, idx) => ({
        month: monthLabels[idx],
        consumption: (meters || []).reduce((sum: number, meter: any) => sum + (meter[col] || 0), 0)
    }));
    
    // Consumption by type data
    const typeData = (meters || []).reduce((acc: any, meter: any) => {
        const type = meter.type || 'Unknown';
        if (!acc[type]) {
            acc[type] = 0;
        }
        acc[type] += calculateTotalConsumption([meter], dateRange.start, dateRange.end);
        return acc;
    }, {});
    
    const consumptionByTypeData = Object.entries(typeData)
        .map(([type, consumption]: [string, any]) => ({
            name: type,
            value: consumption
        }))
        .sort((a, b) => b.value - a.value);
    
    // Handle range slider change
    const handleRangeChange = (startMonth: number, endMonth: number) => {
        setIsAnimating(true);
        setTimeout(() => {
            onDateRangeChange({ start: startMonth, end: endMonth });
            setIsAnimating(false);
        }, 300);
    };
    
    return (
        <div className="space-y-6">
            {/* Modern Range Slider */}
            <ModernDateRangeSlider 
                onRangeChange={handleRangeChange}
                defaultStart={dateRange.start}
                defaultEnd={dateRange.end}
            />
            
            {/* Title */}
            <Card className={`transition-all duration-500 ${isAnimating ? 'opacity-70' : 'opacity-100'}`}>
                <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">
                    Consumption Overview for {monthLabels[dateRange.start]} to {monthLabels[dateRange.end]}
                </h3>
            </Card>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-500/10">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOTAL CONSUMPTION</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">
                                {formatMWh(totalConsumption)} MWh
                            </p>
                            <p className="text-xs text-gray-400">{formatNumber(totalConsumption)} kWh</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-green-50 dark:bg-green-500/10">
                    <div className="flex items-center gap-4">
                        <Database className="w-8 h-8 text-green-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOTAL COST</p>
                            <p className="font-bold text-xl text-green-500">
                                {totalCost.toFixed(2)} OMR
                            </p>
                            <p className="text-xs text-gray-400">Total consumption × 0.025</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-yellow-50 dark:bg-yellow-500/10">
                    <div className="flex items-center gap-4">
                        <Database className="w-8 h-8 text-yellow-500" />
                        <div>
                            <p className="text-xs text-gray-500">TOTAL METERS</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">{totalMeters}</p>
                            <p className="text-xs text-gray-400">All meter types</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="bg-red-50 dark:bg-red-500/10">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="w-8 h-8 text-red-500" />
                        <div>
                            <p className="text-xs text-gray-500">HIGHEST CONSUMER</p>
                            <p className="font-bold text-xl text-[#4E4456] dark:text-white">
                                {topConsumer?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-400">
                                {topConsumer ? `${formatNumber(topConsumer.totalConsumption)} kWh / ${calculateCost(topConsumer.totalConsumption).toFixed(2)} OMR` : 'No data'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            
            {/* Charts */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-500 ${isAnimating ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`}>
                <ModernAreaChart
                    data={monthlyTrendData}
                    config={{
                        consumption: {
                            label: 'Consumption (kWh)',
                            color: '#8b5cf6'
                        }
                    }}
                    title="Monthly Consumption Trend"
                    height="h-[300px]"
                    showLegend={false}
                    curved={true}
                />
                
                <ModernBarChart
                    data={consumptionByTypeData}
                    config={{
                        value: {
                            label: 'Consumption (kWh)',
                            color: '#10B981'
                        }
                    }}
                    title="Consumption by Type"
                    height="h-[300px]"
                    showLegend={false}
                    horizontal={true}
                />
            </div>
        </div>
    );
};

// Tab 3: Database Component
const DatabaseTab = ({ meters }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Calculate totals for each meter
    const processedMeters = (meters || []).map((meter: any) => {
        const monthColumns = ['apr_24', 'may_24', 'jun_24', 'jul_24', 'aug_24', 'sep_24', 'oct_24', 'nov_24', 'dec_24', 'jan_25', 'feb_25', 'mar_25', 'apr_25', 'may_25', 'jun_25', 'jul_25'];
        const totalConsumption = monthColumns.reduce((sum, col) => sum + (meter[col] || 0), 0);
        const totalCost = calculateCost(totalConsumption);
        
        return {
            ...meter,
            totalConsumption,
            totalCost
        };
    });
    
    // Filter meters based on search
    const filteredMeters = processedMeters.filter((meter: any) => 
        meter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.account?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Pagination
    const totalPages = Math.ceil(filteredMeters.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentMeters = filteredMeters.slice(startIndex, startIndex + itemsPerPage);
    
    const exportToCSV = () => {
        const headers = ['Name', 'Type', 'Account #', 'Total Consumption (kWh)', 'Total Cost (OMR)'];
        const csvContent = [
            headers.join(','),
            ...processedMeters.map((meter: any) => [
                meter.name || '',
                meter.type || '',
                meter.account || '',
                meter.totalConsumption || 0,
                (meter.totalCost || 0).toFixed(2)
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'electricity_meters.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-[#4E4456] dark:text-white">
                            Electricity Meter Database
                        </h3>
                        <p className="text-sm text-gray-500">All Meters ({processedMeters.length})</p>
                    </div>
                    <button 
                        onClick={exportToCSV}
                        className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all"
                    >
                        <Download className="h-4 w-4" /> Export to CSV
                    </button>
                </div>
            </Card>
            
            {/* Search */}
            <Card>
                <div className="flex items-center gap-4">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search meters by name, type, or account..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-2 border rounded-md dark:bg-white/10"
                    />
                </div>
            </Card>
            
            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Account #</th>
                                <th className="px-4 py-3">Total Consumption (kWh)</th>
                                <th className="px-4 py-3">Total Cost (OMR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMeters.map((meter: any, idx: number) => (
                                <tr key={idx} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                                    <td className="px-4 py-2 font-medium">{meter.name}</td>
                                    <td className="px-4 py-2">{meter.type}</td>
                                    <td className="px-4 py-2">{meter.account}</td>
                                    <td className="px-4 py-2">{formatNumber(meter.totalConsumption)}</td>
                                    <td className="px-4 py-2 text-green-500 font-semibold">
                                        {meter.totalCost.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <p>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMeters.length)} of {filteredMeters.length} meters</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Main Enhanced Electricity Module Component
export const EnhancedElectricityModule = () => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [meters, setMeters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: 0, // May-24
        end: 2   // Jul-24
    });
    
    const tabs = [
        { name: 'Overview', icon: LayoutGrid },
        { name: 'Analysis by Type', icon: Tag },
        { name: 'Database', icon: Database },
    ];
    
    useEffect(() => {
        fetchMeters();
    }, []);
    
    const fetchMeters = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('energy_meters')
                .select('*');
            
            if (error) throw error;
            setMeters(data || []);
        } catch (error) {
            console.error('Error fetching meters:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                    <p className="mt-4 text-gray-600">Loading electricity data...</p>
                </div>
            </div>
        );
    }
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab meters={meters} dateRange={dateRange} onDateRangeChange={setDateRange} />;
            case 'Analysis by Type':
                return <AnalysisByTypeTab meters={meters} dateRange={dateRange} onDateRangeChange={setDateRange} />;
            case 'Database':
                return <DatabaseTab meters={meters} />;
            default:
                return <OverviewTab meters={meters} dateRange={dateRange} onDateRangeChange={setDateRange} />;
        }
    };
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#4E4456] dark:text-white">Electricity System Analysis</h2>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
                <div className="flex flex-wrap items-center justify-center p-1 rounded-xl bg-gray-100 dark:bg-white/10 gap-x-1">
                    {tabs.map(({ name, icon: Icon }) => (
                        <button 
                            key={name} 
                            onClick={() => setActiveTab(name)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                activeTab === name 
                                    ? 'bg-white dark:bg-white/20 text-[#4E4456] dark:text-white shadow-sm' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5'
                            }`}
                        >
                            <Icon className="h-5 w-5" /> {name}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Tab Content */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};