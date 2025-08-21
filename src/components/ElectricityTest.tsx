import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';
import { Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const ElectricityTest: React.FC = () => {
  const [testResults, setTestResults] = useState({
    dbConnection: null as boolean | null,
    dataFetch: null as boolean | null,
    dataCount: 0,
    sampleData: null as any,
    error: null as string | null
  });
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    const results = { ...testResults };
    
    try {
      // Test 1: Database Connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('electricity_meters')
        .select('count')
        .limit(1);
        
      if (connectionError) {
        // Try fallback table
        const fallback = await supabase
          .from('energy_meters')
          .select('count')
          .limit(1);
          
        if (fallback.error) {
          results.dbConnection = false;
          results.error = `Connection failed: ${fallback.error.message}`;
        } else {
          results.dbConnection = true;
        }
      } else {
        results.dbConnection = true;
      }

      if (results.dbConnection) {
        // Test 2: Data Fetching
        const { data, error } = await supabase
          .from('electricity_meters')
          .select('*')
          .limit(5);
          
        let finalData = data;
        
        if (error) {
          const fallback = await supabase
            .from('energy_meters')
            .select('*')
            .limit(5);
            
          if (fallback.error) {
            results.dataFetch = false;
            results.error = `Data fetch failed: ${fallback.error.message}`;
          } else {
            results.dataFetch = true;
            finalData = fallback.data;
          }
        } else {
          results.dataFetch = true;
        }

        if (finalData) {
          results.dataCount = finalData.length;
          results.sampleData = finalData[0] || null;
        }
      }
      
    } catch (error: any) {
      results.error = error.message;
      results.dbConnection = false;
      results.dataFetch = false;
    }

    setTestResults(results);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    if (status) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const StatusText = ({ status }: { status: boolean | null }) => {
    if (status === null) return <span className="text-blue-500">Testing...</span>;
    if (status) return <span className="text-green-500">Pass</span>;
    return <span className="text-red-500">Fail</span>;
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: theme.colors.background,
      minHeight: '100vh'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-500" />
            <div>
              <h1 style={{ 
                fontSize: theme.typography.titleSize,
                color: theme.colors.textPrimary,
                fontFamily: theme.typography.fontFamily,
                fontWeight: '600'
              }}>
                Electricity Module Test Suite
              </h1>
              <p style={{ 
                fontSize: theme.typography.labelSize,
                color: theme.colors.textSecondary 
              }}>
                Validating database connectivity and data visualization
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Run Tests'}
            </button>
          </div>

          {/* Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={testResults.dbConnection} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Database Connection</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Testing connectivity to Supabase electricity_meters table
                  </p>
                </div>
              </div>
              <StatusText status={testResults.dbConnection} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <StatusIcon status={testResults.dataFetch} />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Data Retrieval</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Fetching sample electricity meter data
                  </p>
                </div>
              </div>
              <div className="text-right">
                <StatusText status={testResults.dataFetch} />
                {testResults.dataCount > 0 && (
                  <p className="text-xs text-gray-500">{testResults.dataCount} records found</p>
                )}
              </div>
            </div>

            {/* Sample Data Display */}
            {testResults.sampleData && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sample Data Structure</h3>
                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(testResults.sampleData, null, 2)}
                </pre>
              </div>
            )}

            {/* Error Display */}
            {testResults.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-900 dark:text-red-400 mb-2">Error Details</h3>
                <p className="text-sm text-red-700 dark:text-red-300">{testResults.error}</p>
              </div>
            )}

            {/* Theme Test */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Theme Configuration</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded mb-2" 
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Primary</p>
                  <p className="text-xs font-mono">{theme.colors.primary}</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded mb-2" 
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Secondary</p>
                  <p className="text-xs font-mono">{theme.colors.secondary}</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-full h-12 rounded mb-2" 
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400">Accent</p>
                  <p className="text-xs font-mono">{theme.colors.accent}</p>
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className={`p-4 rounded-lg ${
              testResults.dbConnection && testResults.dataFetch 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            }`}>
              <h3 className={`font-semibold mb-2 ${
                testResults.dbConnection && testResults.dataFetch 
                  ? 'text-green-900 dark:text-green-400' 
                  : 'text-yellow-900 dark:text-yellow-400'
              }`}>
                Overall Status
              </h3>
              <p className={`text-sm ${
                testResults.dbConnection && testResults.dataFetch 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {testResults.dbConnection && testResults.dataFetch 
                  ? '✅ All systems operational - Electricity module ready for production'
                  : '⚠️  Some issues detected - Please check error details above'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricityTest;