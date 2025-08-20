import React from 'react';
import { Droplets, RefreshCw, AlertTriangle, BarChart3 } from 'lucide-react';

export const FallbackSTPModule = () => {
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
                        <p className="text-sm font-medium text-orange-600">Fallback Mode</p>
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                {/* Status Card */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">System Notice</h3>
                            <p className="text-sm text-gray-600">STP module is running in fallback mode</p>
                        </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-orange-800 mb-2">
                            <strong>Why am I seeing this?</strong>
                        </p>
                        <ul className="text-sm text-orange-700 space-y-1 mb-4">
                            <li>• The main STP module encountered an error</li>
                            <li>• Database connection might be unavailable</li>
                            <li>• Some UI components failed to load</li>
                            <li>• This is a temporary fallback to ensure system stability</li>
                        </ul>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                    </div>
                </div>

                {/* Mock KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">INLET SEWAGE</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    --- <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">Data unavailable</p>
                            </div>
                            <div className="text-4xl">💧</div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TSE OUTPUT</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    --- <span className="text-sm font-normal text-gray-600">m³</span>
                                </p>
                                <p className="text-xs text-gray-500">Data unavailable</p>
                            </div>
                            <div className="text-4xl">🌱</div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">TANKER TRIPS</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    --- <span className="text-sm font-normal text-gray-600">trips</span>
                                </p>
                                <p className="text-xs text-gray-500">Data unavailable</p>
                            </div>
                            <div className="text-4xl">🚛</div>
                        </div>
                    </div>
                </div>

                {/* Chart Placeholder */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Operations Chart</h3>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">Chart Unavailable</p>
                            <p className="text-sm text-gray-400">Data loading failed - please refresh the page</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                        
                        <button 
                            onClick={() => console.log('Checking connection...')}
                            className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Droplets className="w-4 h-4" />
                            Check Connection
                        </button>
                        
                        <button 
                            onClick={() => alert('Please contact system administrator for technical support.')}
                            className="bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Get Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};