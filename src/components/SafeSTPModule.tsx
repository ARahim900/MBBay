import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, RefreshCw, Download, Droplets, Sprout, Truck, DollarSign, TrendingUp, BarChart3, Filter } from 'lucide-react';

// Safe import with fallbacks
let useSTPData: any;
let KpiCard: any;
let Card: any;
let Button: any;

try {
  const stpDataHook = require('../../hooks/useSTPData');
  useSTPData = stpDataHook.useSTPData;
} catch (error) {
  console.warn('Failed to import useSTPData hook:', error);
  useSTPData = () => ({
    allData: [],
    filteredData: [],
    monthlyData: [],
    loading: false,
    error: 'Failed to load STP data hook',
    lastFetchTime: new Date(),
    dateRange: { start: '2024-07', end: '2025-07' },
    availableDates: ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07'],
    metrics: {
      totalInletSewage: 0,
      totalTSE: 0,
      totalTankers: 0,
      totalIncome: 0,
      totalSavings: 0,
      totalImpact: 0
    },
    handleDateRangeChange: () => {},
    refetch: () => {}
  });
}

try {
  const uiComponents = require('./ui');
  KpiCard = uiComponents.KpiCard;
  Card = uiComponents.Card;
  Button = uiComponents.Button;
} catch (error) {
  console.warn('Failed to import KpiCard:', error);
  KpiCard = ({ title, value, unit, subtitle, icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value} {unit && <span className="text-sm font-normal text-gray-600">{unit}</span>}
          </p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className="text-blue-500">{typeof icon === 'string' ? icon : '📊'}</div>}
      </div>
    </div>
  );
}

try {
  const cardComponent = require('./ui/Card');
  Card = cardComponent.Card;
} catch (error) {
  console.warn('Failed to import Card:', error);
  Card = ({ children, className = '' }: any) => (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

try {
  const buttonComponent = require('./ui/Button');
  Button = buttonComponent.Button;
} catch (error) {
  console.warn('Failed to import Button:', error);
  Button = ({ children, onClick, variant = 'primary', size = 'md', icon: Icon, className = '' }: any) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}

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
            <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
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
        
        if (availableDates && availableDates.length > 0) {
            const totalMonths = availableDates.length - 1;
            const startIndex = Math.floor((value / 100) * totalMonths);
            const endIndex = totalMonths;
            
            onDateRangeChange({
                start: availableDates[startIndex],
                end: availableDates[endIndex]
            });
        }
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = e.target.value;
        onDateRangeChange({...dateRange, start: newStart});
        
        // Update slider position based on new start date
        if (availableDates && availableDates.length > 0) {
            const startIndex = availableDates.indexOf(newStart);
            if (startIndex !== -1) {
                const newSliderValue = (startIndex / (availableDates.length - 1)) * 100;
                setSliderValue(newSliderValue);
            }
        }
    };

    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateRangeChange({...dateRange, end: e.target.value});
    };

    const resetRange = () => {
        if (availableDates && availableDates.length > 0) {
            setSliderValue(0);
            onDateRangeChange({
                start: availableDates[0],
                end: availableDates[availableDates.length - 1]
            });
        }
    };

    const getSelectedPeriodText = () => {
        try {
            const startDate = new Date(dateRange.start + '-01');
            const endDate = new Date(dateRange.end + '-01');
            const startText = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            const endText = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return `${startText} - ${endText}`;
        } catch (error) {
            return 'Invalid Date Range';
        }
    };

    const getSliderBackground = () => {
        const percentage = sliderValue;
        return `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${percentage}%, #10B981 ${percentage}%, #10B981 100%)`;
    };

    return (
        <Card className="mb-6">
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
                    <p className="text-2xl font-bold text-blue-600">{filteredDataCount || 0}</p>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">From:</label>
                    <input
                        type="month"
                        value={dateRange?.start || '2024-07'}
                        onChange={handleStartDateChange}
                        min="2024-07"
                        max="2025-07"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <span className="text-gray-500 mx-2">to</span>
                    <label className="text-sm font-medium text-gray-700">To:</label>
                    <input
                        type="month"
                        value={dateRange?.end || '2025-07'}
                        onChange={handleEndDateChange}
                        min={dateRange?.start || '2024-07'}
                        max="2025-07"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
                
                <Button 
                    onClick={resetRange}
                    variant="primary"
                    icon={RefreshCw}
                >
                    Reset to Full Range
                </Button>
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
        </Card>
    );
};

// KPI Metric Card Component (Updated to use new design system)
const MetricCard = ({ icon, title, value, unit, period, bgColor, iconColor }: any) => (
    <KpiCard
        title={title}
        value={value}
        unit={unit}
        subtitle={period}
        icon={icon}
        color={iconColor === '#3B82F6' ? 'blue' : iconColor === '#10B981' ? 'green' : 'gray'}
    />
);

// Error Boundary Component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
    constructor(props: {children: React.ReactNode}) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('STP Module Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">STP Module Error</h2>
                        <p className="text-gray-600 mb-4">
                            There was an error loading the STP Plant module. This might be due to:
                        </p>
                        <ul className="text-left text-sm text-gray-500 mb-6 space-y-1">
                            <li>• Database connection issues</li>
                            <li>• Missing component dependencies</li>
                            <li>• Data formatting problems</li>
                        </ul>
                        <Button 
                            onClick={() => window.location.reload()} 
                            variant="primary"
                            icon={RefreshCw}
                        >
                            Reload Page
                        </Button>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Main STP Operations Dashboard Component with Enhanced Integration
export const SafeSTPModule = () => {
    // Use the custom hook for centralized state management with error handling
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
    } = useSTPData();
    
    const formatNumber = (num: number) => {
        try {
            return num?.toLocaleString() || '0';
        } catch (error) {
            return '0';
        }
    };
    
    const formatCurrency = (num: number) => {
        try {
            return num?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00';
        } catch (error) {
            return '0.00';
        }
    };
    
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
                <Card className="max-w-md mx-auto text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 font-semibold">Error loading STP data</p>
                    <p className="text-gray-500 mt-2">{error}</p>
                    <Button 
                        onClick={refetch}
                        variant="primary"
                        icon={RefreshCw}
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </Card>
            </div>
        );
    }
    
    return (
        <ErrorBoundary>
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
                        filteredDataCount={filteredData?.length || 0}
                    />
                    
                    {/* KPI Metrics - Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <MetricCard 
                            icon="💧"
                            title="INLET SEWAGE"
                            value={formatNumber(metrics?.totalInletSewage || 0)}
                            unit="m³"
                            period={`For ${dateRange?.start || '2024-07'} - ${dateRange?.end || '2025-07'}`}
                            bgColor="bg-blue-50"
                            iconColor="#3B82F6"
                        />
                        <MetricCard 
                            icon="🌱"
                            title="TSE FOR IRRIGATION"
                            value={formatNumber(metrics?.totalTSE || 0)}
                            unit="m³"
                            period="Recycled water (filtered period)"
                            bgColor="bg-green-50"
                            iconColor="#10B981"
                        />
                        <MetricCard 
                            icon="🚛"
                            title="TANKER TRIPS"
                            value={formatNumber(metrics?.totalTankers || 0)}
                            unit="trips"
                            period="Total discharges (filtered period)"
                            bgColor="bg-gray-50"
                            iconColor="#6B7280"
                        />
                    </div>
                    
                    {/* KPI Metrics - Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <MetricCard 
                            icon="💰"
                            title="GENERATED INCOME"
                            value={formatCurrency(metrics?.totalIncome || 0)}
                            unit="OMR"
                            period="From tanker fees (filtered period)"
                            bgColor="bg-gray-50"
                            iconColor="#6B7280"
                        />
                        <MetricCard 
                            icon="💧"
                            title="WATER SAVINGS"
                            value={formatCurrency(metrics?.totalSavings || 0)}
                            unit="OMR"
                            period="By using TSE water (filtered period)"
                            bgColor="bg-cyan-50"
                            iconColor="#0EA5E9"
                        />
                        <MetricCard 
                            icon="📊"
                            title="TOTAL IMPACT"
                            value={formatCurrency(metrics?.totalImpact || 0)}
                            unit="OMR"
                            period="Savings + Income (filtered period)"
                            bgColor="bg-teal-50"
                            iconColor="#06B6D4"
                        />
                    </div>
                    
                    {/* Monthly Water Volumes Chart */}
                    <Card className="mb-6">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Monthly Water Volumes (m³)</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                    <span>Sewage Input</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                    <span>TSE Output</span>
                                </div>
                            </div>
                        </div>
                        {monthlyData && monthlyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="sewageGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.1}/>
                                        </linearGradient>
                                        <linearGradient id="tseGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="sewageInput" stackId="1" stroke="#0EA5E9" fill="url(#sewageGradient)" name="Sewage Input" />
                                    <Area type="monotone" dataKey="tseOutput" stackId="1" stroke="#10B981" fill="url(#tseGradient)" name="TSE Output" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                    <p>No data available for the selected period</p>
                                </div>
                            </div>
                        )}
                    </Card>
                    
                    {/* Summary Card */}
                    <Card>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">STP Operations Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Records</p>
                                    <p className="text-2xl font-bold text-blue-600">{allData?.length || 0}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Filtered Records</p>
                                    <p className="text-2xl font-bold text-green-600">{filteredData?.length || 0}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Monthly Data Points</p>
                                    <p className="text-2xl font-bold text-purple-600">{monthlyData?.length || 0}</p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">System Status</p>
                                    <p className="text-lg font-bold text-orange-600">
                                        {error ? 'Error' : loading ? 'Loading' : 'Active'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default SafeSTPModule;