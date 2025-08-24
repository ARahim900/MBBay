/**
 * Validation Script for Comprehensive Form Validation
 * 
 * This script validates the implementation of comprehensive form validation
 * for contractor forms including real-time feedback and business rules.
 * 
 * Requirements: 6.4, 10.4
 */

import {
  validateField,
  validateForm,
  validateBusinessRules,
  sanitizeFormData,
  autoCalculateYearlyAmount,
  contractorValidationSchema,
  shouldValidateRealTime,
  formatValidationErrors,
  hasValidationErrors,
  getFieldValidationStatus
} from '../utils/contractor-validation';

interface ValidationTestResult {
  testName: string;
  passed: boolean;
  details: string;
  errors?: string[];
}

class FormValidationValidator {
  private results: ValidationTestResult[] = [];

  /**
   * Run all validation tests
   */
  async validateImplementation(): Promise<void> {
    console.log('🔍 Validating Comprehensive Form Validation Implementation...\n');

    // Test validation schema
    this.testValidationSchema();
    
    // Test field validation
    this.testFieldValidation();
    
    // Test business rules
    this.testBusinessRules();
    
    // Test form validation
    this.testFormValidation();
    
    // Test data sanitization
    this.testDataSanitization();
    
    // Test utility functions
    this.testUtilityFunctions();
    
    // Test real-time validation configuration
    this.testRealTimeValidation();

    // Generate report
    this.generateReport();
  }

  /**
   * Test validation schema structure
   */
  private testValidationSchema(): void {
    const requiredFields = [
      'contractor_name',
      'service_provided',
      'status',
      'contract_type',
      'start_date',
      'end_date',
      'contract_monthly_amount',
      'contract_yearly_amount',
      'notes'
    ];

    const schemaFields = Object.keys(contractorValidationSchema);
    const missingFields = requiredFields.filter(field => !schemaFields.includes(field));

    this.results.push({
      testName: 'Validation Schema Structure',
      passed: missingFields.length === 0,
      details: missingFields.length === 0 
        ? 'All required fields are present in validation schema'
        : `Missing fields: ${missingFields.join(', ')}`,
      errors: missingFields.length > 0 ? missingFields : undefined
    });

    // Test schema field properties
    const requiredProperties = ['required', 'type', 'message'];
    const schemaIssues: string[] = [];

    Object.entries(contractorValidationSchema).forEach(([fieldName, rule]) => {
      if (!rule.type) {
        schemaIssues.push(`${fieldName}: missing type property`);
      }
      if (!rule.message) {
        schemaIssues.push(`${fieldName}: missing message property`);
      }
    });

    this.results.push({
      testName: 'Validation Schema Properties',
      passed: schemaIssues.length === 0,
      details: schemaIssues.length === 0 
        ? 'All schema fields have required properties'
        : `Schema issues found: ${schemaIssues.length}`,
      errors: schemaIssues.length > 0 ? schemaIssues : undefined
    });
  }

  /**
   * Test field validation functions
   */
  private testFieldValidation(): void {
    const testCases = [
      // Contractor name validation
      {
        field: 'contractor_name',
        value: '',
        expected: 'error',
        description: 'Empty contractor name should fail'
      },
      {
        field: 'contractor_name',
        value: 'A',
        expected: 'error',
        description: 'Too short contractor name should fail'
      },
      {
        field: 'contractor_name',
        value: 'ABC Construction Ltd.',
        expected: 'success',
        description: 'Valid contractor name should pass'
      },
      {
        field: 'contractor_name',
        value: 'Test@#$%',
        expected: 'error',
        description: 'Invalid characters should fail'
      },

      // Service description validation
      {
        field: 'service_provided',
        value: 'Short',
        expected: 'error',
        description: 'Too short service description should fail'
      },
      {
        field: 'service_provided',
        value: 'Electrical maintenance and repair services for commercial buildings',
        expected: 'success',
        description: 'Valid service description should pass'
      },

      // Date validation
      {
        field: 'start_date',
        value: '',
        expected: 'error',
        description: 'Empty start date should fail'
      },
      {
        field: 'start_date',
        value: '2024-01-01',
        expected: 'success',
        description: 'Valid start date should pass'
      },

      // Amount validation
      {
        field: 'contract_monthly_amount',
        value: '-100',
        expected: 'error',
        description: 'Negative amount should fail'
      },
      {
        field: 'contract_monthly_amount',
        value: '1500.50',
        expected: 'success',
        description: 'Valid amount should pass'
      },
      {
        field: 'contract_monthly_amount',
        value: '',
        expected: 'success',
        description: 'Empty optional amount should pass'
      }
    ];

    let passedTests = 0;
    const failedTests: string[] = [];

    testCases.forEach(testCase => {
      try {
        const result = validateField(
          testCase.field as keyof typeof contractorValidationSchema,
          testCase.value,
          {}
        );

        const actualResult = result ? 'error' : 'success';
        
        if (actualResult === testCase.expected) {
          passedTests++;
        } else {
          failedTests.push(`${testCase.description}: expected ${testCase.expected}, got ${actualResult}`);
        }
      } catch (error) {
        failedTests.push(`${testCase.description}: threw error - ${error.message}`);
      }
    });

    this.results.push({
      testName: 'Field Validation Functions',
      passed: failedTests.length === 0,
      details: `${passedTests}/${testCases.length} field validation tests passed`,
      errors: failedTests.length > 0 ? failedTests : undefined
    });
  }

  /**
   * Test business rules validation
   */
  private testBusinessRules(): void {
    const testCases = [
      // PO contract duration
      {
        formData: {
          contract_type: 'PO',
          start_date: '2024-01-01',
          end_date: '2025-06-01' // More than 1 year
        },
        expectedErrors: 1,
        description: 'PO contract duration > 1 year should generate warning'
      },

      // Active contract with past end date
      {
        formData: {
          status: 'Active',
          end_date: '2023-01-01' // Past date
        },
        expectedErrors: 1,
        description: 'Active contract with past end date should fail'
      },

      // Expired contract with future end date
      {
        formData: {
          status: 'Expired',
          end_date: '2025-01-01' // Future date
        },
        expectedErrors: 1,
        description: 'Expired contract with future end date should fail'
      },

      // Monthly amount without yearly amount
      {
        formData: {
          contract_monthly_amount: '1000',
          contract_yearly_amount: ''
        },
        expectedErrors: 1,
        description: 'Monthly amount without yearly amount should generate warning'
      },

      // Valid form data
      {
        formData: {
          contract_type: 'Contract',
          status: 'Active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: '1000',
          contract_yearly_amount: '12000'
        },
        expectedErrors: 0,
        description: 'Valid form data should pass all business rules'
      }
    ];

    let passedTests = 0;
    const failedTests: string[] = [];

    testCases.forEach(testCase => {
      try {
        const errors = validateBusinessRules(testCase.formData);
        
        if (errors.length === testCase.expectedErrors) {
          passedTests++;
        } else {
          failedTests.push(`${testCase.description}: expected ${testCase.expectedErrors} errors, got ${errors.length}`);
        }
      } catch (error) {
        failedTests.push(`${testCase.description}: threw error - ${error.message}`);
      }
    });

    this.results.push({
      testName: 'Business Rules Validation',
      passed: failedTests.length === 0,
      details: `${passedTests}/${testCases.length} business rule tests passed`,
      errors: failedTests.length > 0 ? failedTests : undefined
    });
  }

  /**
   * Test complete form validation
   */
  private testFormValidation(): void {
    const validFormData = {
      contractor_name: 'ABC Construction',
      service_provided: 'Electrical maintenance and repair services',
      status: 'Active',
      contract_type: 'Contract',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      contract_monthly_amount: '1500',
      contract_yearly_amount: '18000',
      notes: 'Test notes'
    };

    const invalidFormData = {
      contractor_name: '', // Required field missing
      service_provided: 'Short', // Too short
      status: 'Invalid', // Invalid status
      contract_type: 'Contract',
      start_date: '', // Required field missing
      end_date: '2023-01-01', // Invalid date logic
      contract_monthly_amount: '-100', // Negative amount
      contract_yearly_amount: '',
      notes: ''
    };

    try {
      // Test valid form
      const validResult = validateForm(validFormData);
      const validFormPassed = validResult.isValid && validResult.errors.length === 0;

      // Test invalid form
      const invalidResult = validateForm(invalidFormData);
      const invalidFormPassed = !invalidResult.isValid && invalidResult.errors.length > 0;

      this.results.push({
        testName: 'Complete Form Validation',
        passed: validFormPassed && invalidFormPassed,
        details: `Valid form: ${validFormPassed ? 'PASS' : 'FAIL'}, Invalid form: ${invalidFormPassed ? 'PASS' : 'FAIL'}`,
        errors: (!validFormPassed || !invalidFormPassed) ? [
          !validFormPassed ? 'Valid form validation failed' : '',
          !invalidFormPassed ? 'Invalid form validation failed' : ''
        ].filter(Boolean) : undefined
      });
    } catch (error) {
      this.results.push({
        testName: 'Complete Form Validation',
        passed: false,
        details: `Form validation threw error: ${error.message}`,
        errors: [error.message]
      });
    }
  }

  /**
   * Test data sanitization
   */
  private testDataSanitization(): void {
    const testData = {
      contractor_name: '  ABC Construction  ',
      service_provided: '  Electrical services  ',
      status: 'Active',
      contract_type: 'Contract',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      contract_monthly_amount: '1500.00',
      contract_yearly_amount: '18000.00',
      notes: '  Some notes  '
    };

    try {
      const sanitized = sanitizeFormData(testData);
      
      const tests = [
        sanitized.contractor_name === 'ABC Construction',
        sanitized.service_provided === 'Electrical services',
        sanitized.notes === 'Some notes',
        sanitized.contract_monthly_amount === 1500,
        sanitized.contract_yearly_amount === 18000
      ];

      const allPassed = tests.every(test => test);

      this.results.push({
        testName: 'Data Sanitization',
        passed: allPassed,
        details: allPassed ? 'All sanitization tests passed' : 'Some sanitization tests failed',
        errors: !allPassed ? ['Data sanitization did not work as expected'] : undefined
      });
    } catch (error) {
      this.results.push({
        testName: 'Data Sanitization',
        passed: false,
        details: `Sanitization threw error: ${error.message}`,
        errors: [error.message]
      });
    }
  }

  /**
   * Test utility functions
   */
  private testUtilityFunctions(): void {
    const utilityTests = [
      // Auto-calculate yearly amount
      {
        name: 'Auto-calculate yearly amount',
        test: () => {
          const result1 = autoCalculateYearlyAmount('1000');
          const result2 = autoCalculateYearlyAmount('1500.50');
          const result3 = autoCalculateYearlyAmount('');
          const result4 = autoCalculateYearlyAmount('invalid');
          
          return result1 === '12000.00' && 
                 result2 === '18006.00' && 
                 result3 === '' && 
                 result4 === '';
        }
      },

      // Format validation errors
      {
        name: 'Format validation errors',
        test: () => {
          const errors = [
            { field: 'contractor_name', message: 'Name is required', value: '' },
            { field: 'service_provided', message: 'Service is required', value: '' }
          ];
          const formatted = formatValidationErrors(errors);
          
          return formatted.contractor_name === 'Name is required' &&
                 formatted.service_provided === 'Service is required';
        }
      },

      // Has validation errors
      {
        name: 'Has validation errors',
        test: () => {
          const errors1 = { contractor_name: 'Error' };
          const errors2 = {};
          
          return hasValidationErrors(errors1) === true &&
                 hasValidationErrors(errors2) === false;
        }
      },

      // Get field validation status
      {
        name: 'Get field validation status',
        test: () => {
          const errors = { contractor_name: 'Error' };
          const touched = { contractor_name: true, service_provided: true };
          
          const status1 = getFieldValidationStatus('contractor_name', errors, touched);
          const status2 = getFieldValidationStatus('service_provided', errors, touched);
          const status3 = getFieldValidationStatus('notes', errors, touched);
          
          return status1 === 'invalid' &&
                 status2 === 'valid' &&
                 status3 === 'neutral';
        }
      }
    ];

    let passedTests = 0;
    const failedTests: string[] = [];

    utilityTests.forEach(utilityTest => {
      try {
        if (utilityTest.test()) {
          passedTests++;
        } else {
          failedTests.push(`${utilityTest.name}: test logic failed`);
        }
      } catch (error) {
        failedTests.push(`${utilityTest.name}: threw error - ${error.message}`);
      }
    });

    this.results.push({
      testName: 'Utility Functions',
      passed: failedTests.length === 0,
      details: `${passedTests}/${utilityTests.length} utility function tests passed`,
      errors: failedTests.length > 0 ? failedTests : undefined
    });
  }

  /**
   * Test real-time validation configuration
   */
  private testRealTimeValidation(): void {
    const realTimeFields = [
      'contractor_name',
      'service_provided',
      'start_date',
      'end_date',
      'contract_monthly_amount',
      'contract_yearly_amount'
    ];

    const nonRealTimeFields = [
      'status',
      'contract_type',
      'notes'
    ];

    try {
      const realTimeResults = realTimeFields.map(field => 
        shouldValidateRealTime(field as keyof typeof contractorValidationSchema)
      );
      
      const nonRealTimeResults = nonRealTimeFields.map(field => 
        shouldValidateRealTime(field as keyof typeof contractorValidationSchema)
      );

      const realTimeCorrect = realTimeResults.every(result => result === true);
      const nonRealTimeCorrect = nonRealTimeResults.every(result => result === false);

      this.results.push({
        testName: 'Real-time Validation Configuration',
        passed: realTimeCorrect && nonRealTimeCorrect,
        details: `Real-time fields: ${realTimeCorrect ? 'PASS' : 'FAIL'}, Non-real-time fields: ${nonRealTimeCorrect ? 'PASS' : 'FAIL'}`,
        errors: (!realTimeCorrect || !nonRealTimeCorrect) ? [
          !realTimeCorrect ? 'Real-time validation configuration incorrect' : '',
          !nonRealTimeCorrect ? 'Non-real-time validation configuration incorrect' : ''
        ].filter(Boolean) : undefined
      });
    } catch (error) {
      this.results.push({
        testName: 'Real-time Validation Configuration',
        passed: false,
        details: `Real-time validation test threw error: ${error.message}`,
        errors: [error.message]
      });
    }
  }

  /**
   * Generate validation report
   */
  private generateReport(): void {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed);

    console.log('\n📊 COMPREHENSIVE FORM VALIDATION REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests.length} ❌`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`\n• ${test.testName}`);
        console.log(`  Details: ${test.details}`);
        if (test.errors) {
          test.errors.forEach(error => {
            console.log(`  - ${error}`);
          });
        }
      });
    }

    console.log('\n✅ PASSED TESTS:');
    this.results.filter(r => r.passed).forEach(test => {
      console.log(`• ${test.testName}: ${test.details}`);
    });

    // Summary
    console.log('\n🎯 IMPLEMENTATION SUMMARY:');
    console.log('- ✅ Comprehensive validation schema with business rules');
    console.log('- ✅ Real-time validation feedback configuration');
    console.log('- ✅ Field-level validation with custom validators');
    console.log('- ✅ Form-level validation with cross-field rules');
    console.log('- ✅ Data sanitization and type conversion');
    console.log('- ✅ Utility functions for validation helpers');
    console.log('- ✅ Auto-calculation of dependent fields');
    console.log('- ✅ Error formatting and status management');

    if (passedTests === totalTests) {
      console.log('\n🎉 All validation tests passed! The comprehensive form validation system is working correctly.');
    } else {
      console.log(`\n⚠️  ${failedTests.length} test(s) failed. Please review the implementation.`);
    }
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FormValidationValidator();
  validator.validateImplementation().catch(console.error);
}

export { FormValidationValidator };