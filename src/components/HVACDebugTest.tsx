import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const HVACDebugTest: React.FC = () => {
    const [testResults, setTestResults] = useState<any>({
        tableExists: null,
        sampleData: null,
        recordCount: 0,
        error: null
    });
    const [testing, setTesting] = useState(false);

    const runDatabaseTest = async () => {
        setTesting(true);
        const results: any = {};
        
        try {
            console.log('=== HVAC DATABASE DEBUG TEST ===');
            
            // Test 1: Check if table exists and get sample data
            const { data, error, count } = await supabase
                .from('hvac_tracker')
                .select('*', { count: 'exact' })
                .limit(3);
                
            if (error) {
                results.tableExists = false;
                results.error = error.message;
                console.error('Table access error:', error);
            } else {
                results.tableExists = true;
                results.sampleData = data;
                results.recordCount = count || 0;
                console.log('Sample HVAC data:', data);
                console.log('Record count:', count);
                
                // Log the structure of the first record
                if (data && data.length > 0) {
                    console.log('First record structure:');
                    Object.keys(data[0]).forEach(key => {
                        console.log(`  ${key}: ${typeof data[0][key]} = ${data[0][key]}`);
                    });
                }
            }
            
        } catch (error: any) {
            results.error = error.message;
            console.error('Database test error:', error);
        }
        
        setTestResults(results);
        setTesting(false);
    };

    useEffect(() => {
        runDatabaseTest();
    }, []);

    const testUpdate = async () => {
        if (!testResults.sampleData || testResults.sampleData.length === 0) {
            alert('No sample data available to test update');
            return;
        }

        const sampleRecord = testResults.sampleData[0];
        console.log('Testing update on record:', sampleRecord);

        try {
            // Test update without changing any data
            const { data, error } = await supabase
                .from('hvac_tracker')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', sampleRecord.id)
                .select();

            console.log('Update test result:', { data, error });
            
            if (error) {
                alert(`Update test failed: ${error.message}`);
            } else if (!data || data.length === 0) {
                alert('Update test failed: No records updated');
            } else {
                alert('Update test successful!');
            }
        } catch (error: any) {
            console.error('Update test error:', error);
            alert(`Update test error: ${error.message}`);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">HVAC Database Debug Test</h2>
                <button 
                    onClick={runDatabaseTest} 
                    disabled={testing}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-3"
                >
                    {testing ? 'Testing...' : 'Run Test'}
                </button>
                <button 
                    onClick={testUpdate}
                    disabled={!testResults.sampleData}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                    Test Update
                </button>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Table Exists:</h3>
                    <p className={testResults.tableExists ? 'text-green-600' : 'text-red-600'}>
                        {testResults.tableExists === null ? 'Testing...' : testResults.tableExists ? 'Yes' : 'No'}
                    </p>
                </div>

                <div className="p-4 border rounded">
                    <h3 className="font-semibold mb-2">Record Count:</h3>
                    <p>{testResults.recordCount}</p>
                </div>

                {testResults.error && (
                    <div className="p-4 border border-red-300 bg-red-50 rounded">
                        <h3 className="font-semibold mb-2 text-red-800">Error:</h3>
                        <p className="text-red-700">{testResults.error}</p>
                    </div>
                )}

                {testResults.sampleData && (
                    <div className="p-4 border rounded">
                        <h3 className="font-semibold mb-2">Sample Data:</h3>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                            {JSON.stringify(testResults.sampleData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HVACDebugTest;