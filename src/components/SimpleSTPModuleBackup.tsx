import React, { useState } from 'react';
import { Droplets, RefreshCw, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export const SimpleSTPModuleBackup = () => {
    const [isLoading, setIsLoading] = useState(false);
    
    const mockData = {
        totalInletSewage: 12450,
        totalTSE: 11200,
        totalTankers: 58,
        totalIncome: 290,
        totalSavings: 5040,
        totalImpact: 5330
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Droplets className="w-8 h-8 text-blue-500" />
                            STP Plant Operations
                        </h1>
                        <p className="text-gray-600">Sewage Treatment Plant Management System</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="text-sm font-medium text-green-600">Active (Demo Mode)</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Status Banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <div>
                            <h3 className="font-medium text-yellow-800">Demo Mode Active</h3>
                            <p className="text-sm text-yellow-700">
                                STP module is running with sample data. Database connection may be unavailable.
                            </p>
                        </div>
                        <button 
                            onClick={() => window.location.reload()}
                            className="ml-auto bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry Connection
                        </button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Droplets className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">INLET SEWAGE</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalInletSewage.toLocaleString()} <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">Demo period total</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TSE IRRIGATION</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalTSE.toLocaleString()} <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">Recycled water output</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TANKER TRIPS</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalTankers} <span className="text-sm font-normal text-gray-600">trips</span>
                                </p>
                                <p className="text-xs text-gray-500">Total discharges</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-yellow-600 text-xl">💰</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">INCOME</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalIncome.toLocaleString()} <span className="text-sm font-normal text-gray-600">OMR</span>
                                </p>
                                <p className="text-xs text-gray-500">From tanker fees</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                                <span className="text-cyan-600 text-xl">💧</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">WATER SAVINGS</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalSavings.toLocaleString()} <span className="text-sm font-normal text-gray-600">OMR</span>
                                </p>
                                <p className="text-xs text-gray-500">By using TSE water</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <span className="text-teal-600 text-xl">📊</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TOTAL IMPACT</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {mockData.totalImpact.toLocaleString()} <span className="text-sm font-normal text-gray-600">OMR</span>
                                </p>
                                <p className="text-xs text-gray-500">Savings + Income</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">Primary Treatment</span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900 mt-2">98.5%</p>
                            <p className="text-xs text-green-600">Efficiency</p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-800">Secondary Treatment</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 mt-2">97.2%</p>
                            <p className="text-xs text-blue-600">Efficiency</p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-purple-800">TSE Production</span>
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-900 mt-2">89.9%</p>
                            <p className="text-xs text-purple-600">Recovery Rate</p>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-orange-800">Maintenance</span>
                                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">Scheduled</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-900 mt-2">5</p>
                            <p className="text-xs text-orange-600">Days remaining</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};