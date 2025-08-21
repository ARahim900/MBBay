import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, RefreshCw, Download, Droplets, Sprout, Truck, DollarSign, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { useSTPData } from '../../hooks/useSTPData';
import { 
  ModernAreaChart, 
  ModernBarChart, 
  ModernLineChart,
  ChartConfig 
} from './ui/ModernChart';

// Enhanced CSS for slider styling
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10B981;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
  
  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10B981;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
`;

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string | number }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                <p className="label font-semibold text-gray-800 text-sm">{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: pld.color }}
                        ></div>
                        <span>{pld.name}: {typeof pld.value === 'number' ? pld.value.toLocaleString() : pld.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Enhanced Date Range Slider Component with Full Integration
const DateRangeSlider = ({ dateRange, onDateRangeChange, availableDates, filteredDataCount }: any) => {
    const [sliderValue, setSliderValue] = useState(0);
    
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setSliderValue(value);
        
        const totalMonths = availableDates.length - 1;
        const startIndex = Math.floor((value / 100) * totalMonths);
        const endIndex = totalMonths;
        
        onDateRangeChange({
            start: availableDates[startIndex],
            end: availableDates[endIndex]
        });
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        onDateRangeChange({...dateRange, start: newStart});
        
        // Update slider position based on new start date
        const startIndex = availableDates.indexOf(newStart);
        if (startIndex !== -1) {
            const newSliderValue = (startIndex / (availableDates.length - 1)) * 100;
            setSliderValue(newSliderValue);
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateRangeChange({...dateRange, end: e.target.value});
    };

    const resetRange = () => {
        if (availableDates.length > 0) {
            setSliderValue(0);
            onDateRangeChange({
                start: availableDates[0],
                end: availableDates[availableDates.length - 1]
            });
        }
    };

    const getSelectedPeriodText = () => {
        const startDate = new Date(dateRange.start + '-01');
        const endDate = new Date(dateRange.end + '-01');
        const startText = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const endText = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        return `${startText} - ${endText}`;
    };

    const getSliderBackground = () => {
        const percentage = sliderValue;
        return `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${percentage}%, #10B981 ${percentage}%, #10B981 100%)`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-blue-500" />
                        Smart Filtration System
                    </h3>
                    <p className="text-sm text-gray-600">All components below will update automatically</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Filtered Records</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredDataCount}</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">From:</label>
                    <input
                        type="month"
                        value={dateRange.start}
                        onChange={handleStartDateChange}
                        min="2024-07"
                        max="2025-07"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <span className="text-gray-500 mx-2">to</span>
                    <label className="text-sm font-medium text-gray-700">To:</label>
                    <input
                        type="month"
                        value={dateRange.end}
                        onChange={handleEndDateChange}
                        min={dateRange.start}
                        max="2025-07"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                
                <button 
                    onClick={resetRange}
                    className="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset to Full Range
                </button>
            </div>
            
            {/* Enhanced Visual Slider */}
            <div className="relative mb-4">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleRangeChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                        background: getSliderBackground()
                    }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Jul 2024</span>
                    <span>Jan 2025</span>
                    <span>Jul 2025</span>
                </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Currently Viewing</p>
                <p className="font-semibold text-gray-900 text-lg">{getSelectedPeriodText()}</p>
                <p className="text-xs text-blue-600 mt-1">
                    All charts, metrics, and tables below are filtered to this period
                </p>
            </div>
        </div>
    );
};

// Import the new UI components - Fixed import path
import { KpiCard } from './ui/KpiCard';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// KPI Metric Card Component (Updated to use new design system)
const MetricCard = ({ icon, title, value, unit, period, bgColor, iconColor }: any) => {
    // Map hex colors to theme color names
    const getColorName = (hexColor: string) => {
        switch (hexColor) {
            case '#3B82F6': return 'blue';      // Blue
            case '#10B981': return 'green';     // Green
            case '#6B7280': return 'indigo';    // Gray -> Indigo
            case '#0EA5E9': return 'blue';      // Sky blue -> Blue
            case '#06B6D4': return 'teal';      // Teal
            default: return 'blue';             // Default fallback
        }
    };

    return (
        <KpiCard
            title={title}
            value={value}
            unit={unit}
            subtitle={period}
            icon={icon}
            color={getColorName(iconColor)}
            variant="default"
            size="md"
        />
    );
};

// Enhanced Daily Operations Table Component with Date Range Integration
const DailyOperationsTable = ({ data, dateRange }: any) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('operation_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const itemsPerPage = 15;
    
    // Filter data based on date range (not just current month)
    const filteredData = useMemo(() => {
        return data.filter((record: any) => {
            const recordDate = new Date(record.operation_date);
            const startDate = new Date(dateRange.start + '-01');
            const endDate = new Date(dateRange.end + '-31'); // End of month
            return recordDate >= startDate && recordDate <= endDate;
        });
    }, [data, dateRange]);
    
    // Sort filtered data
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            
            if (sortField === 'operation_date') {
                const aDate = new Date(aValue);
                const bDate = new Date(bValue);
                return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
            }
            
            const aNum = Number(aValue) || 0;
            const bNum = Number(bValue) || 0;
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        });
    }, [filteredData, sortField, sortDirection]);
    
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = sortedData.slice(startIndex, startIndex + itemsPerPage);
    
    // Reset page when date range changes
    useEffect(() => {
        setCurrentPage(1);
    }, [dateRange]);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };
    
    const formatCurrency = (value: number) => {
        return value?.toFixed(2) || '0.00';
    };
    
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return '↕️';
        return sortDirection === 'asc' ? '↑' : '↓';
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Inlet (m³)', 'TSE (m³)', 'Tankers', 'Income (OMR)', 'Savings (OMR)', 'Total (OMR)'];
        const csvContent = [
            headers.join(','),
            ...sortedData.map((record: any) => [
                formatDate(record.operation_date),
                record.total_inlet_sewage || 0,
                record.tse_water_to_irrigation || 0,
                record.tankers_discharged || 0,
                formatCurrency(record.income_from_tankers),
                formatCurrency(record.saving_from_tse),
                formatCurrency(record.total_saving_income)
            ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stp_operations_${dateRange.start}_to_${dateRange.end}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Daily Operations Log
                    </h3>
                    <p className="text-sm text-gray-600">
                        Showing {sortedData.length} records from {new Date(dateRange.start + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} to {new Date(dateRange.end + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="text-right mr-4">
                        <p className="text-xs text-gray-500">Filtered Records</p>
                        <p className="text-lg font-bold text-blue-600">{sortedData.length}</p>
                    </div>
                    <button 
                        onClick={exportToCSV}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Export Filtered Data
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th 
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('operation_date')}
                            >
                                Date {getSortIcon('operation_date')}
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('total_inlet_sewage')}
                            >
                                Inlet (m³) {getSortIcon('total_inlet_sewage')}
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('tse_water_to_irrigation')}
                            >
                                TSE (m³) {getSortIcon('tse_water_to_irrigation')}
                            </th>
                            <th 
                                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('tankers_discharged')}
                            >
                                Tankers {getSortIcon('tankers_discharged')}
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('income_from_tankers')}
                            >
                                Income (OMR) {getSortIcon('income_from_tankers')}
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('saving_from_tse')}
                            >
                                Savings (OMR) {getSortIcon('saving_from_tse')}
                            </th>
                            <th 
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-bold cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => handleSort('total_saving_income')}
                            >
                                Total (OMR) {getSortIcon('total_saving_income')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentPageData.map((record: any, index: number) => (
                            <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-blue-50'}>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatDate(record.operation_date)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{record.total_inlet_sewage || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{record.tse_water_to_irrigation || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-center">{record.tankers_discharged || 0}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(record.income_from_tankers)}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(record.saving_from_tse)}</td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(record.total_saving_income)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedData.length)} of {sortedData.length} filtered entries
                    {sortedData.length !== data.length && (
                        <span className="text-blue-600 ml-2">
                            (filtered from {data.length} total records)
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main STP Operations Dashboard Component with Enhanced Integration
export const EnhancedSTPModule = () => {
    // Use the custom hook for centralized state management
    let hookData;
    try {
        hookData = useSTPData();
    } catch (error) {
        console.error('Failed to initialize STP data hook:', error);
        // Return fallback component if hook fails
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 max-w-md mx-auto text-center">
                    <div className="text-orange-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">STP Data Hook Failed</h2>
                    <p className="text-gray-600 mb-4">Unable to initialize data management system.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    const {
        allData,
        filteredData,
        monthlyData,
        loading,
        error,
        lastFetchTime,
        dateRange,
        availableDates,
        metrics,
        handleDateRangeChange,
        refetch
    } = hookData;
    
    const formatNumber = (num: number) => num.toLocaleString();
    const formatCurrency = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading STP operations data...</p>
                    <p className="text-sm text-gray-500 mt-2">Preparing smart filtration system...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-semibold">Error loading STP data</p>
                    <p className="text-gray-500 mt-2">{error}</p>
                    <button 
                        onClick={refetch}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            <style>{sliderStyles}</style>
            {/* Enhanced Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Droplets className="w-8 h-8 text-blue-500" />
                            STP Plant Smart Operations
                        </h1>
                        <p className="text-gray-600">Sewage Treatment Plant with Integrated Filtration System</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-sm font-medium text-gray-900">
                            {lastFetchTime ? lastFetchTime.toLocaleString() : 'Loading...'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Enhanced Date Range Selector */}
                <DateRangeSlider 
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    availableDates={availableDates}
                    filteredDataCount={filteredData.length}
                />
                
                {/* KPI Metrics - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <MetricCard 
                        icon={Droplets}
                        title="INLET SEWAGE"
                        value={formatNumber(metrics.totalInletSewage)}
                        unit="m³"
                        period={`For ${new Date(dateRange.start + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${new Date(dateRange.end + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        bgColor="bg-blue-50"
                        iconColor="#3B82F6"
                    />
                    <MetricCard 
                        icon={Sprout}
                        title="TSE FOR IRRIGATION"
                        value={formatNumber(metrics.totalTSE)}
                        unit="m³"
                        period="Recycled water (filtered period)"
                        bgColor="bg-green-50"
                        iconColor="#10B981"
                    />
                    <MetricCard 
                        icon={Truck}
                        title="TANKER TRIPS"
                        value={formatNumber(metrics.totalTankers)}
                        unit="trips"
                        period="Total discharges (filtered period)"
                        bgColor="bg-gray-50"
                        iconColor="#6B7280"
                    />
                </div>
                
                {/* KPI Metrics - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <MetricCard 
                        icon={DollarSign}
                        title="GENERATED INCOME"
                        value={formatCurrency(metrics.totalIncome)}
                        unit="OMR"
                        period="From tanker fees (filtered period)"
                        bgColor="bg-gray-50"
                        iconColor="#6B7280"
                    />
                    <MetricCard 
                        icon={Droplets}
                        title="WATER SAVINGS"
                        value={formatCurrency(metrics.totalSavings)}
                        unit="OMR"
                        period="By using TSE water (filtered period)"
                        bgColor="bg-cyan-50"
                        iconColor="#0EA5E9"
                    />
                    <MetricCard 
                        icon={TrendingUp}
                        title="TOTAL IMPACT"
                        value={formatCurrency(metrics.totalImpact)}
                        unit="OMR"
                        period="Savings + Income (filtered period)"
                        bgColor="bg-teal-50"
                        iconColor="#06B6D4"
                    />
                </div>
                
                {/* Monthly Water Volumes Chart */}
                <ModernAreaChart
                    data={monthlyData}
                    config={{
                        sewageInput: {
                            label: "Sewage Input (m³)",
                            color: "#0EA5E9"
                        },
                        tseOutput: {
                            label: "TSE Output (m³)",
                            color: "#10B981"
                        }
                    }}
                    title="Monthly Water Volumes (m³)"
                    description={`Water processing data from ${new Date(dateRange.start + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} to ${new Date(dateRange.end + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                    height="h-[350px]"
                    stacked={false}
                    showLegend={true}
                    className="mb-6"
                />
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card className="pt-0">
                        <div className="border-b py-5 px-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Monthly Financials (OMR)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Income from tanker fees vs water cost savings
                            </p>
                        </div>
                        <div className="px-2 pt-4 sm:px-6 sm:pt-6">
                            {monthlyData && monthlyData.length > 0 ? (
                                <ModernBarChart
                                    data={monthlyData}
                                    config={{
                                        income: {
                                            label: "Income (OMR)",
                                            color: "#84CC16"
                                        },
                                        savings: {
                                            label: "Savings (OMR)",
                                            color: "#06B6D4"
                                        }
                                    }}
                                    title=""
                                    description=""
                                    height="h-[250px]"
                                    showLegend={true}
                                    stacked={false}
                                />
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <p>No financial data available for selected period</p>
                                        <p className="text-sm mt-2">Select a different date range or check data connection</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    <ModernLineChart
                        data={monthlyData}
                        config={{
                            tankerTrips: {
                                label: "Tanker Trips",
                                color: "#F97316"
                            }
                        }}
                        title="Monthly Operations"
                        description="Number of tanker discharge trips per month"
                        height="h-[300px]"
                        showLegend={false}
                        curved={true}
                        showDots={true}
                    />
                </div>
                
                {/* Daily Operations Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Database Connection Status</h3>
                            <p className="text-sm text-gray-600">Total records: {allData.length} | Filtered: {filteredData.length}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            allData.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {allData.length > 0 ? 'Connected' : 'No Data'}
                        </div>
                    </div>
                </div>
                <DailyOperationsTable data={allData} dateRange={dateRange} />
            </div>
        </div>
    );
};