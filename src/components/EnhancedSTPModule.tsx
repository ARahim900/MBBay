import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, RefreshCw, Download, Droplets, Sprout, Truck, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

// Date Range Slider Component
const DateRangeSlider = ({ dateRange, onDateRangeChange, availableDates }: any) => {
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const startIndex = Math.floor(value * (availableDates.length - 1) / 100);
        const endIndex = availableDates.length - 1;
        
        onDateRangeChange({
            start: availableDates[startIndex],
            end: availableDates[endIndex]
        });
    };

    const resetRange = () => {
        if (availableDates.length > 0) {
            onDateRangeChange({
                start: availableDates[0],
                end: availableDates[availableDates.length - 1]
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Period Range</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <input
                        type="month"
                        value={dateRange.start}
                        onChange={(e) => onDateRangeChange({...dateRange, start: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="month"
                        value={dateRange.end}
                        onChange={(e) => onDateRangeChange({...dateRange, end: e.target.value})}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                
                <button 
                    onClick={resetRange}
                    className="bg-[#10B981] text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset Range
                </button>
            </div>
            
            {/* Visual Slider */}
            <div className="relative">
                <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    onChange={handleRangeChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: 'linear-gradient(to right, #10B981 0%, #10B981 100%, #e5e7eb 100%, #e5e7eb 100%)'
                    }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>2024-07</span>
                    <span>2025-01</span>
                    <span>2025-07</span>
                </div>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Selected Period</p>
                <p className="font-semibold text-gray-900">July 2024 - July 2025</p>
            </div>
        </div>
    );
};

// KPI Metric Card Component
const MetricCard = ({ icon, title, value, unit, period, bgColor, iconColor }: any) => (
    <div className={`rounded-lg p-4 ${bgColor} border border-gray-200`}>
        <div className="flex items-center gap-3">
            <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg`}
                style={{ backgroundColor: iconColor }}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</p>
                <p className="text-2xl font-bold text-gray-900">
                    {value} <span className="text-sm font-normal text-gray-600">{unit}</span>
                </p>
                <p className="text-xs text-gray-500">{period}</p>
            </div>
        </div>
    </div>
);

// Daily Operations Table Component
const DailyOperationsTable = ({ data, currentMonth }: any) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Filter data for current month
    const monthlyData = data.filter((record: any) => {
        const recordDate = new Date(record.operation_date);
        const currentMonthDate = new Date(currentMonth);
        return recordDate.getMonth() === currentMonthDate.getMonth() && 
               recordDate.getFullYear() === currentMonthDate.getFullYear();
    });
    
    const totalPages = Math.ceil(monthlyData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPageData = monthlyData.slice(startIndex, startIndex + itemsPerPage);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB');
    };
    
    const formatCurrency = (value: number) => {
        return value?.toFixed(2) || '0.00';
    };
    
    const exportToCSV = () => {
        const headers = ['Date', 'Inlet (m³)', 'TSE (m³)', 'Tankers', 'Income (OMR)', 'Savings (OMR)', 'Total (OMR)'];
        const csvContent = [
            headers.join(','),
            ...monthlyData.map((record: any) => [
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
        a.download = `stp_operations_${currentMonth.replace('-', '_')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Daily Operations Log</h3>
                    <p className="text-sm text-gray-600">
                        Daily Operations for {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button 
                    onClick={exportToCSV}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Inlet (m³)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">TSE (m³)</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tankers</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Income (OMR)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Savings (OMR)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">Total (OMR)</th>
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
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, monthlyData.length)} of {monthlyData.length} entries
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main STP Operations Dashboard Component
export const EnhancedSTPModule = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        start: '2024-07',
        end: '2025-07'
    });
    
    useEffect(() => {
        fetchSTPData();
        const interval = setInterval(fetchSTPData, 5 * 60 * 1000); // Auto-refresh every 5 minutes
        return () => clearInterval(interval);
    }, []);
    
    const fetchSTPData = async () => {
        try {
            setLoading(true);
            const { data: fetchedData, error } = await supabase
                .from('stp_operations')
                .select('*')
                .gte('operation_date', `${dateRange.start}-01`)
                .lte('operation_date', `${dateRange.end}-31`)
                .order('operation_date', { ascending: false });
            
            if (error) throw error;
            
            // Auto-calculate financial fields if null
            const processedData = (fetchedData || []).map(record => ({
                ...record,
                income_from_tankers: record.income_from_tankers || (record.tankers_discharged * 5), // 5 OMR per tanker
                saving_from_tse: record.saving_from_tse || (record.tse_water_to_irrigation * 0.45), // 0.45 OMR per m³
                total_saving_income: record.total_saving_income || 
                    ((record.income_from_tankers || (record.tankers_discharged * 5)) + 
                     (record.saving_from_tse || (record.tse_water_to_irrigation * 0.45)))
            }));
            
            setData(processedData);
        } catch (error) {
            console.error('Error fetching STP data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Calculate metrics
    const metrics = useMemo(() => {
        return {
            totalInletSewage: data.reduce((sum, d) => sum + (Number(d.total_inlet_sewage) || 0), 0),
            totalTSE: data.reduce((sum, d) => sum + (Number(d.tse_water_to_irrigation) || 0), 0),
            totalTankers: data.reduce((sum, d) => sum + (d.tankers_discharged || 0), 0),
            totalIncome: data.reduce((sum, d) => sum + (Number(d.income_from_tankers) || 0), 0),
            totalSavings: data.reduce((sum, d) => sum + (Number(d.saving_from_tse) || 0), 0),
            totalImpact: data.reduce((sum, d) => sum + (Number(d.total_saving_income) || 0), 0)
        };
    }, [data]);
    
    // Group data by month for charts
    const monthlyData = useMemo(() => {
        const grouped = data.reduce((acc: any, record) => {
            const month = new Date(record.operation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            if (!acc[month]) {
                acc[month] = {
                    month,
                    sewageInput: 0,
                    tseOutput: 0,
                    tankerTrips: 0,
                    income: 0,
                    savings: 0
                };
            }
            acc[month].sewageInput += Number(record.total_inlet_sewage) || 0;
            acc[month].tseOutput += Number(record.tse_water_to_irrigation) || 0;
            acc[month].tankerTrips += record.tankers_discharged || 0;
            acc[month].income += Number(record.income_from_tankers) || 0;
            acc[month].savings += Number(record.saving_from_tse) || 0;
            return acc;
        }, {});
        
        return Object.values(grouped).sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
    }, [data]);
    
    const formatNumber = (num: number) => num.toLocaleString();
    const formatCurrency = (num: number) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading STP operations data...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">STP Plant Operations</h1>
                        <p className="text-gray-600">Sewage Treatment Plant Management</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Date Range Selector */}
                <DateRangeSlider 
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    availableDates={['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07']}
                />
                
                {/* KPI Metrics - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <MetricCard 
                        icon="💧"
                        title="INLET SEWAGE"
                        value={formatNumber(metrics.totalInletSewage)}
                        unit="m³"
                        period="For July 2024 - July 2025"
                        bgColor="bg-blue-50"
                        iconColor="#3B82F6"
                    />
                    <MetricCard 
                        icon="🌱"
                        title="TSE FOR IRRIGATION"
                        value={formatNumber(metrics.totalTSE)}
                        unit="m³"
                        period="Recycled water"
                        bgColor="bg-green-50"
                        iconColor="#10B981"
                    />
                    <MetricCard 
                        icon="🚛"
                        title="TANKER TRIPS"
                        value={formatNumber(metrics.totalTankers)}
                        unit="trips"
                        period="Total discharges"
                        bgColor="bg-gray-50"
                        iconColor="#6B7280"
                    />
                </div>
                
                {/* KPI Metrics - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <MetricCard 
                        icon="💰"
                        title="GENERATED INCOME"
                        value={formatCurrency(metrics.totalIncome)}
                        unit="OMR"
                        period="From tanker fees"
                        bgColor="bg-gray-50"
                        iconColor="#6B7280"
                    />
                    <MetricCard 
                        icon="💧"
                        title="WATER SAVINGS"
                        value={formatCurrency(metrics.totalSavings)}
                        unit="OMR"
                        period="By using TSE water"
                        bgColor="bg-cyan-50"
                        iconColor="#0EA5E9"
                    />
                    <MetricCard 
                        icon="📊"
                        title="TOTAL IMPACT"
                        value={formatCurrency(metrics.totalImpact)}
                        unit="OMR"
                        period="Savings + Income"
                        bgColor="bg-teal-50"
                        iconColor="#06B6D4"
                    />
                </div>
                
                {/* Monthly Water Volumes Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                </div>
                
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Monthly Financials Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Monthly Financials (OMR)</h3>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-green-500"></div>
                                    <span>Income</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-sm bg-cyan-500"></div>
                                    <span>Savings</span>
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
                                <YAxis stroke="#6B7280" fontSize={10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="income" fill="#84CC16" name="Income" radius={[2, 2, 0, 0]} />
                                <Bar dataKey="savings" fill="#06B6D4" name="Savings" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Monthly Operations Chart */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Monthly Operations (Tanker Trips)</h3>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                                <span>Tanker Trips</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                <XAxis dataKey="month" stroke="#6B7280" fontSize={10} />
                                <YAxis stroke="#6B7280" fontSize={10} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="tankerTrips" 
                                    stroke="#F97316" 
                                    strokeWidth={3}
                                    dot={{ r: 5, fill: '#F97316' }}
                                    name="Tanker Trips"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Daily Operations Table */}
                <DailyOperationsTable data={data} currentMonth="2025-07" />
            </div>
        </div>
    );
};