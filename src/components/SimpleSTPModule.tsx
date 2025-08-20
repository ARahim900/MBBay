import React from 'react';
import { Droplets, RefreshCw, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';

export const SimpleSTPModule = () => {
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
                        <p className="text-sm font-medium text-green-600">Active</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
                            <p className="text-sm text-gray-600">STP module is running successfully</p>
                        </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800 mb-2">
                            <strong>STP Plant is operational</strong>
                        </p>
                        <ul className="text-sm text-green-700 space-y-1 mb-4">
                            <li>• All systems are functioning normally</li>
                            <li>• Data collection is active</li>
                            <li>• No critical alerts</li>
                            <li>• Ready for full operation</li>
                        </ul>
                    </div>
                </div>

                {/* Mock KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">INLET SEWAGE</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    12,450 <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">This month</p>
                            </div>
                            <div className="text-4xl">💧</div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TSE OUTPUT</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    11,200 <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">Treated water</p>
                            </div>
                            <div className="text-4xl">🌱</div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">EFFICIENCY</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    89.9 <span className="text-sm font-normal text-gray-600">%</span>
                                </p>
                                <p className="text-xs text-gray-500">Treatment efficiency</p>
                            </div>
                            <div className="text-4xl">📊</div>
                        </div>
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Operations Trend</h3>
                    <div className="h-64 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-700 font-medium">Operations Chart</p>
                            <p className="text-sm text-gray-500">Showing steady performance trends</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <button className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Refresh Data
                        </button>
                        
                        <button className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            View Reports
                        </button>
                        
                        <button className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Water Quality
                        </button>
                        
                        <button className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Maintenance
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleSTPModule;