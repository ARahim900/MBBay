import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const HVACSupabaseTest: React.FC = () => {
    const [testResult, setTestResult] = useState<string>('');
    const [testing, setTesting] = useState(false);

    const runSupabaseTest = async () => {
        setTesting(true);
        setTestResult('');
        let results = [];

        try {
            // Test 1: Check if we can read from the table
            results.push('📋 Test 1: Reading from hvac_tracker table...');
            const { data: readData, error: readError } = await supabase
                .from('hvac_tracker')
                .select('*')
                .limit(1);
            
            if (readError) {
                results.push(`❌ Read failed: ${readError.message}`);
            } else {
                results.push(`✅ Read successful! Found ${readData?.length || 0} records`);
                
                if (readData && readData.length > 0) {
                    const testRecord = readData[0];
                    results.push(`📝 Test record ID: ${testRecord.id}`);
                    
                    // Test 2: Try to update this record
                    results.push('\n📋 Test 2: Attempting to update record...');
                    const testUpdate = {
                        latest_update_notes: `Test update at ${new Date().toISOString()}`
                    };
                    
                    const { error: updateError } = await supabase
                        .from('hvac_tracker')
                        .update(testUpdate)
                        .eq('id', testRecord.id);
                    
                    if (updateError) {
                        results.push(`❌ Update failed: ${updateError.message}`);
                        results.push(`Error code: ${updateError.code}`);
                        
                        if (updateError.code === '42501' || 
                            updateError.message?.includes('permission') || 
                            updateError.message?.includes('policy')) {
                            results.push('\n🔒 DATABASE PERMISSION ISSUE DETECTED!');
                            results.push('\n🔧 TO FIX THIS:');
                            results.push('1. Go to your Supabase Dashboard');
                            results.push('2. Navigate to Authentication → Policies');
                            results.push('3. Find the "hvac_tracker" table');
                            results.push('4. Either:');
                            results.push('   a) Disable RLS (Row Level Security) temporarily');
                            results.push('   b) Add an UPDATE policy that allows all users');
                            results.push('\n📝 Quick Fix (Disable RLS):');
                            results.push('- Click on Table Editor → hvac_tracker');
                            results.push('- Click the shield icon');
                            results.push('- Toggle "Enable RLS" to OFF');
                        }
                    } else {
                        results.push('✅ Update successful!');
                        
                        // Test 3: Verify the update
                        results.push('\n📋 Test 3: Verifying update...');
                        const { data: verifyData, error: verifyError } = await supabase
                            .from('hvac_tracker')
                            .select('latest_update_notes')
                            .eq('id', testRecord.id)
                            .single();
                        
                        if (verifyError) {
                            results.push(`❌ Verification failed: ${verifyError.message}`);
                        } else {
                            results.push('✅ Update verified successfully!');
                            results.push(`Updated value: ${verifyData?.latest_update_notes}`);
                        }
                    }
                } else {
                    results.push('⚠️ No records found to test update');
                }
            }
            
            // Test 4: Check authentication
            results.push('\n📋 Test 4: Checking Supabase authentication...');
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (authError) {
                results.push(`⚠️ Auth check failed: ${authError.message}`);
            } else if (user) {
                results.push(`✅ Authenticated as: ${user.email}`);
            } else {
                results.push('ℹ️ Using anonymous access (anon key)');
            }
            
        } catch (error: any) {
            results.push(`\n❌ Test error: ${error.message}`);
        }
        
        setTestResult(results.join('\n'));
        setTesting(false);
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Supabase HVAC Tracker Permission Test</h2>
            
            <button 
                onClick={runSupabaseTest}
                disabled={testing}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                {testing ? 'Testing...' : 'Run Supabase Test'}
            </button>
            
            {testResult && (
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
                    {testResult}
                </pre>
            )}
        </div>
    );
};

export default HVACSupabaseTest;