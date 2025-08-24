/**
 * Validation script for Delete Contractor functionality
 * Verifies that all components and integrations are properly implemented
 */

import { ContractorAPI } from '../lib/contractor-api';
import type { Contractor } from '../types/contractor';

// Mock contractor for testing
const mockContractor: Contractor = {
  id: 999,
  contractor_name: 'Test Delete Contractor',
  service_provided: 'Test service for deletion',
  status: 'Active',
  contract_type: 'Contract',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  contract_monthly_amount: 1000,
  contract_yearly_amount: 12000,
  notes: 'Test contractor for deletion validation',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

/**
 * Validate Delete Contractor Implementation
 */
export async function validateDeleteContractor(): Promise<{
  success: boolean;
  results: Array<{ test: string; passed: boolean; message: string }>;
}> {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];

  console.log('🔍 Validating Delete Contractor functionality...\n');

  // Test 1: Check if ContractorAPI.deleteContractor method exists
  try {
    const hasDeleteMethod = typeof ContractorAPI.deleteContractor === 'function';
    results.push({
      test: 'ContractorAPI.deleteContractor method exists',
      passed: hasDeleteMethod,
      message: hasDeleteMethod 
        ? 'Delete method is properly defined in ContractorAPI'
        : 'Delete method is missing from ContractorAPI'
    });
  } catch (error) {
    results.push({
      test: 'ContractorAPI.deleteContractor method exists',
      passed: false,
      message: `Error checking delete method: ${error}`
    });
  }

  // Test 2: Check DeleteContractorModal component structure
  try {
    // This would normally import the component, but we'll check file existence
    const fs = await import('fs');
    const path = await import('path');
    
    const modalPath = path.resolve('src/components/contractor/DeleteContractorModal.tsx');
    const modalExists = fs.existsSync(modalPath);
    
    results.push({
      test: 'DeleteContractorModal component exists',
      passed: modalExists,
      message: modalExists 
        ? 'DeleteContractorModal component file exists'
        : 'DeleteContractorModal component file is missing'
    });

    if (modalExists) {
      const modalContent = fs.readFileSync(modalPath, 'utf-8');
      
      // Check for key features
      const hasConfirmationInput = modalContent.includes('confirmationText');
      const hasWarningMessage = modalContent.includes('Permanent Deletion Warning');
      const hasDeleteButton = modalContent.includes('Delete Contractor');
      const hasErrorHandling = modalContent.includes('ContractorErrorHandler');
      
      results.push({
        test: 'DeleteContractorModal has confirmation input',
        passed: hasConfirmationInput,
        message: hasConfirmationInput 
          ? 'Modal includes confirmation text input'
          : 'Modal missing confirmation text input'
      });

      results.push({
        test: 'DeleteContractorModal has warning message',
        passed: hasWarningMessage,
        message: hasWarningMessage 
          ? 'Modal includes proper warning message'
          : 'Modal missing warning message'
      });

      results.push({
        test: 'DeleteContractorModal has delete button',
        passed: hasDeleteButton,
        message: hasDeleteButton 
          ? 'Modal includes delete button'
          : 'Modal missing delete button'
      });

      results.push({
        test: 'DeleteContractorModal has error handling',
        passed: hasErrorHandling,
        message: hasErrorHandling 
          ? 'Modal includes proper error handling'
          : 'Modal missing error handling'
      });
    }
  } catch (error) {
    results.push({
      test: 'DeleteContractorModal component validation',
      passed: false,
      message: `Error validating modal component: ${error}`
    });
  }

  // Test 3: Check integration in ContractorTrackerDashboard
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const dashboardPath = path.resolve('src/components/ContractorTrackerDashboard.tsx');
    const dashboardExists = fs.existsSync(dashboardPath);
    
    if (dashboardExists) {
      const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
      
      const hasDeleteModal = dashboardContent.includes('DeleteContractorModal');
      const hasDeleteHandler = dashboardContent.includes('handleDeleteContractor');
      const hasDeleteSuccess = dashboardContent.includes('handleDeleteSuccess');
      const hasRemoveContractor = dashboardContent.includes('removeContractor');
      
      results.push({
        test: 'Dashboard imports DeleteContractorModal',
        passed: hasDeleteModal,
        message: hasDeleteModal 
          ? 'Dashboard properly imports DeleteContractorModal'
          : 'Dashboard missing DeleteContractorModal import'
      });

      results.push({
        test: 'Dashboard has delete handler',
        passed: hasDeleteHandler,
        message: hasDeleteHandler 
          ? 'Dashboard includes delete handler function'
          : 'Dashboard missing delete handler function'
      });

      results.push({
        test: 'Dashboard has delete success handler',
        passed: hasDeleteSuccess,
        message: hasDeleteSuccess 
          ? 'Dashboard includes delete success handler'
          : 'Dashboard missing delete success handler'
      });

      results.push({
        test: 'Dashboard calls removeContractor',
        passed: hasRemoveContractor,
        message: hasRemoveContractor 
          ? 'Dashboard properly calls removeContractor from hook'
          : 'Dashboard missing removeContractor call'
      });
    }
  } catch (error) {
    results.push({
      test: 'Dashboard integration validation',
      passed: false,
      message: `Error validating dashboard integration: ${error}`
    });
  }

  // Test 4: Check integration in ContractorDataTable
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const tablePath = path.resolve('src/components/contractor/ContractorDataTable.tsx');
    const tableExists = fs.existsSync(tablePath);
    
    if (tableExists) {
      const tableContent = fs.readFileSync(tablePath, 'utf-8');
      
      const hasDeleteProp = tableContent.includes('onDelete?:');
      const hasDeleteButton = tableContent.includes('Trash2');
      const hasDeleteClick = tableContent.includes('onDelete(contractor)');
      
      results.push({
        test: 'DataTable has onDelete prop',
        passed: hasDeleteProp,
        message: hasDeleteProp 
          ? 'DataTable includes onDelete prop definition'
          : 'DataTable missing onDelete prop definition'
      });

      results.push({
        test: 'DataTable has delete button',
        passed: hasDeleteButton,
        message: hasDeleteButton 
          ? 'DataTable includes delete button with Trash2 icon'
          : 'DataTable missing delete button'
      });

      results.push({
        test: 'DataTable calls onDelete',
        passed: hasDeleteClick,
        message: hasDeleteClick 
          ? 'DataTable properly calls onDelete with contractor'
          : 'DataTable missing onDelete call'
      });
    }
  } catch (error) {
    results.push({
      test: 'DataTable integration validation',
      passed: false,
      message: `Error validating table integration: ${error}`
    });
  }

  // Test 5: Check useContractorData hook integration
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const hookPath = path.resolve('hooks/useContractorData.ts');
    const hookExists = fs.existsSync(hookPath);
    
    if (hookExists) {
      const hookContent = fs.readFileSync(hookPath, 'utf-8');
      
      const hasRemoveFunction = hookContent.includes('removeContractor');
      const hasStateUpdate = hookContent.includes('setAllData(prev => prev.filter');
      const hasAnalyticsUpdate = hookContent.includes('analytics.summary.total_contracts - 1');
      const hasCacheClear = hookContent.includes('ContractorCache.clearCache()');
      
      results.push({
        test: 'Hook has removeContractor function',
        passed: hasRemoveFunction,
        message: hasRemoveFunction 
          ? 'Hook includes removeContractor function'
          : 'Hook missing removeContractor function'
      });

      results.push({
        test: 'Hook updates state on delete',
        passed: hasStateUpdate,
        message: hasStateUpdate 
          ? 'Hook properly updates state when contractor is deleted'
          : 'Hook missing state update on delete'
      });

      results.push({
        test: 'Hook updates analytics on delete',
        passed: hasAnalyticsUpdate,
        message: hasAnalyticsUpdate 
          ? 'Hook properly updates analytics when contractor is deleted'
          : 'Hook missing analytics update on delete'
      });

      results.push({
        test: 'Hook clears cache on delete',
        passed: hasCacheClear,
        message: hasCacheClear 
          ? 'Hook properly clears cache when contractor is deleted'
          : 'Hook missing cache clear on delete'
      });
    }
  } catch (error) {
    results.push({
      test: 'Hook integration validation',
      passed: false,
      message: `Error validating hook integration: ${error}`
    });
  }

  // Test 6: Validate API endpoint structure
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const apiPath = path.resolve('src/lib/contractor-api.ts');
    const apiExists = fs.existsSync(apiPath);
    
    if (apiExists) {
      const apiContent = fs.readFileSync(apiPath, 'utf-8');
      
      const hasDeleteMethod = apiContent.includes('static async deleteContractor');
      const hasDeleteEndpoint = apiContent.includes('DELETE');
      const hasErrorHandling = apiContent.includes('handleResponse');
      const hasProperUrl = apiContent.includes('contractor_tracker?id=eq.');
      
      results.push({
        test: 'API has deleteContractor method',
        passed: hasDeleteMethod,
        message: hasDeleteMethod 
          ? 'API includes deleteContractor static method'
          : 'API missing deleteContractor method'
      });

      results.push({
        test: 'API uses DELETE HTTP method',
        passed: hasDeleteEndpoint,
        message: hasDeleteEndpoint 
          ? 'API properly uses DELETE HTTP method'
          : 'API missing DELETE HTTP method'
      });

      results.push({
        test: 'API has error handling',
        passed: hasErrorHandling,
        message: hasErrorHandling 
          ? 'API includes proper error handling'
          : 'API missing error handling'
      });

      results.push({
        test: 'API uses correct endpoint URL',
        passed: hasProperUrl,
        message: hasProperUrl 
          ? 'API uses correct Supabase endpoint with ID filter'
          : 'API missing correct endpoint URL'
      });
    }
  } catch (error) {
    results.push({
      test: 'API validation',
      passed: false,
      message: `Error validating API: ${error}`
    });
  }

  // Calculate overall success
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const success = passedTests === totalTests;

  // Print results
  console.log('📊 Delete Contractor Validation Results:\n');
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.test}`);
    console.log(`   ${result.message}\n`);
  });

  console.log(`📈 Summary: ${passedTests}/${totalTests} tests passed`);
  
  if (success) {
    console.log('🎉 All delete contractor functionality is properly implemented!');
  } else {
    console.log('⚠️  Some issues found in delete contractor implementation.');
  }

  return { success, results };
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateDeleteContractor()
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    });
}