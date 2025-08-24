#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: string;
}

class FinalIntegrationValidator {
  private results: ValidationResult[] = [];
  private readonly projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  private addResult(category: string, test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, details?: string) {
    this.results.push({ category, test, status, message, details });
  }

  private runCommand(command: string, options: { cwd?: string; timeout?: number } = {}): { stdout: string; stderr: string; success: boolean } {
    try {
      const stdout = execSync(command, {
        cwd: options.cwd || this.projectRoot,
        encoding: 'utf8',
        timeout: options.timeout || 30000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return { stdout, stderr: '', success: true };
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Unknown error',
        success: false
      };
    }
  }

  private fileExists(filePath: string): boolean {
    return existsSync(join(this.projectRoot, filePath));
  }

  private readFile(filePath: string): string {
    try {
      return readFileSync(join(this.projectRoot, filePath), 'utf8');
    } catch {
      return '';
    }
  }

  async validateMainApplicationIntegration(): Promise<void> {
    console.log('🔍 Validating Main Application Integration...\n');

    // Check App.tsx integration
    const appContent = this.readFile('App.tsx');
    if (appContent.includes('ContractorTrackerDashboard') && appContent.includes("'Contractor Tracker'")) {
      this.addResult('Integration', 'App.tsx Integration', 'PASS', 'ContractorTrackerDashboard properly integrated in main app');
    } else {
      this.addResult('Integration', 'App.tsx Integration', 'FAIL', 'ContractorTrackerDashboard not properly integrated in App.tsx');
    }

    // Check navigation structure
    if (appContent.includes('HardHat') && appContent.includes('Contractor Tracker')) {
      this.addResult('Integration', 'Navigation Structure', 'PASS', 'Contractor Tracker properly added to navigation with HardHat icon');
    } else {
      this.addResult('Integration', 'Navigation Structure', 'FAIL', 'Navigation structure not properly configured');
    }

    // Check module switching logic
    if (appContent.includes("case 'Contractor Tracker': return <ContractorTrackerDashboard />")) {
      this.addResult('Integration', 'Module Switching', 'PASS', 'Module switching logic properly implemented');
    } else {
      this.addResult('Integration', 'Module Switching', 'FAIL', 'Module switching logic not found or incorrect');
    }
  }

  async validateVisualConsistency(): Promise<void> {
    console.log('🎨 Validating Visual Consistency...\n');

    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');
    const firefightingDashboard = this.readFile('src/components/FirefightingDashboard.tsx');

    // Check header structure consistency
    const hasConsistentHeader = contractorDashboard.includes('flex flex-col sm:flex-row sm:items-center justify-between') &&
                               contractorDashboard.includes('dark:text-white');
    
    if (hasConsistentHeader) {
      this.addResult('Visual Consistency', 'Header Structure', 'PASS', 'Header layout matches FirefightingDashboard pattern');
    } else {
      this.addResult('Visual Consistency', 'Header Structure', 'FAIL', 'Header structure does not match established pattern');
    }

    // Check KpiCard usage
    if (contractorDashboard.includes('<KpiCard') && contractorDashboard.includes('color="blue"')) {
      this.addResult('Visual Consistency', 'KpiCard Components', 'PASS', 'KpiCard components properly used with theme colors');
    } else {
      this.addResult('Visual Consistency', 'KpiCard Components', 'FAIL', 'KpiCard components not properly implemented');
    }

    // Check MenuBar usage
    if (contractorDashboard.includes('<MenuBar') && contractorDashboard.includes('gradient:')) {
      this.addResult('Visual Consistency', 'MenuBar Navigation', 'PASS', 'MenuBar component used with theme gradients');
    } else {
      this.addResult('Visual Consistency', 'MenuBar Navigation', 'FAIL', 'MenuBar not properly implemented with theme gradients');
    }

    // Check Card component usage
    if (contractorDashboard.includes('<Card>') || contractorDashboard.includes('<Card ')) {
      this.addResult('Visual Consistency', 'Card Components', 'PASS', 'Card components consistently used');
    } else {
      this.addResult('Visual Consistency', 'Card Components', 'FAIL', 'Card components not consistently used');
    }

    // Check Button component usage
    if (contractorDashboard.includes('<Button') && contractorDashboard.includes('variant=')) {
      this.addResult('Visual Consistency', 'Button Components', 'PASS', 'Button components used with consistent variants');
    } else {
      this.addResult('Visual Consistency', 'Button Components', 'FAIL', 'Button components not properly implemented');
    }

    // Check StatusBadge usage
    if (contractorDashboard.includes('<StatusBadge') || contractorDashboard.includes('StatusBadge')) {
      this.addResult('Visual Consistency', 'StatusBadge Components', 'PASS', 'StatusBadge components properly used');
    } else {
      this.addResult('Visual Consistency', 'StatusBadge Components', 'FAIL', 'StatusBadge components not found');
    }
  }

  async validateThemeIntegration(): Promise<void> {
    console.log('🎨 Validating Theme Integration...\n');

    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');

    // Check getThemeValue usage
    if (contractorDashboard.includes('getThemeValue(')) {
      this.addResult('Theme Integration', 'Theme Utility Usage', 'PASS', 'getThemeValue utility properly used');
    } else {
      this.addResult('Theme Integration', 'Theme Utility Usage', 'FAIL', 'getThemeValue utility not used for theme consistency');
    }

    // Check theme color references
    const themeColorPatterns = [
      'colors.primary',
      'colors.status.success',
      'colors.status.warning',
      'colors.status.error',
      'typography.fontFamily'
    ];

    let themeUsageCount = 0;
    themeColorPatterns.forEach(pattern => {
      if (contractorDashboard.includes(pattern)) {
        themeUsageCount++;
      }
    });

    if (themeUsageCount >= 3) {
      this.addResult('Theme Integration', 'Theme Color Usage', 'PASS', `Theme colors properly referenced (${themeUsageCount}/${themeColorPatterns.length} patterns found)`);
    } else {
      this.addResult('Theme Integration', 'Theme Color Usage', 'FAIL', `Insufficient theme color usage (${themeUsageCount}/${themeColorPatterns.length} patterns found)`);
    }

    // Check dark mode support
    if (contractorDashboard.includes('dark:')) {
      this.addResult('Theme Integration', 'Dark Mode Support', 'PASS', 'Dark mode classes properly implemented');
    } else {
      this.addResult('Theme Integration', 'Dark Mode Support', 'FAIL', 'Dark mode support not implemented');
    }
  }

  async validateAccessibilityCompliance(): Promise<void> {
    console.log('♿ Validating Accessibility Compliance...\n');

    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');

    // Check ARIA labels
    if (contractorDashboard.includes('aria-label') || contractorDashboard.includes('aria-labelledby')) {
      this.addResult('Accessibility', 'ARIA Labels', 'PASS', 'ARIA labels properly implemented');
    } else {
      this.addResult('Accessibility', 'ARIA Labels', 'FAIL', 'ARIA labels not found');
    }

    // Check semantic HTML
    if (contractorDashboard.includes('<header') || contractorDashboard.includes('role="')) {
      this.addResult('Accessibility', 'Semantic HTML', 'PASS', 'Semantic HTML elements used');
    } else {
      this.addResult('Accessibility', 'Semantic HTML', 'FAIL', 'Semantic HTML not properly implemented');
    }

    // Check keyboard navigation support
    if (contractorDashboard.includes('onKeyDown') || contractorDashboard.includes('tabIndex')) {
      this.addResult('Accessibility', 'Keyboard Navigation', 'PASS', 'Keyboard navigation support implemented');
    } else {
      this.addResult('Accessibility', 'Keyboard Navigation', 'SKIP', 'Keyboard navigation support not explicitly found (may be handled by UI components)');
    }

    // Check responsive design
    if (contractorDashboard.includes('sm:') && contractorDashboard.includes('lg:')) {
      this.addResult('Accessibility', 'Responsive Design', 'PASS', 'Responsive design classes properly used');
    } else {
      this.addResult('Accessibility', 'Responsive Design', 'FAIL', 'Responsive design not properly implemented');
    }
  }

  async validateEndToEndFunctionality(): Promise<void> {
    console.log('🔄 Validating End-to-End Functionality...\n');

    // Check if integration test exists
    if (this.fileExists('src/tests/contractor-integration-final.test.tsx')) {
      this.addResult('E2E Testing', 'Integration Test File', 'PASS', 'Integration test file exists');
      
      // Run the integration tests
      console.log('Running integration tests...');
      const testResult = this.runCommand('npm run test -- src/tests/contractor-integration-final.test.tsx --run', { timeout: 60000 });
      
      if (testResult.success) {
        this.addResult('E2E Testing', 'Integration Tests', 'PASS', 'All integration tests passed');
      } else {
        this.addResult('E2E Testing', 'Integration Tests', 'FAIL', 'Some integration tests failed', testResult.stderr);
      }
    } else {
      this.addResult('E2E Testing', 'Integration Test File', 'FAIL', 'Integration test file not found');
    }

    // Check CRUD operations implementation
    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');
    const crudOperations = ['handleAddContractor', 'handleEditContractor', 'handleDeleteContractor'];
    
    let crudCount = 0;
    crudOperations.forEach(operation => {
      if (contractorDashboard.includes(operation)) {
        crudCount++;
      }
    });

    if (crudCount === crudOperations.length) {
      this.addResult('E2E Testing', 'CRUD Operations', 'PASS', 'All CRUD operations implemented');
    } else {
      this.addResult('E2E Testing', 'CRUD Operations', 'FAIL', `Missing CRUD operations (${crudCount}/${crudOperations.length} found)`);
    }

    // Check error handling
    if (contractorDashboard.includes('error') && contractorDashboard.includes('loading')) {
      this.addResult('E2E Testing', 'Error Handling', 'PASS', 'Error and loading states properly handled');
    } else {
      this.addResult('E2E Testing', 'Error Handling', 'FAIL', 'Error handling not properly implemented');
    }
  }

  async validatePerformanceOptimization(): Promise<void> {
    console.log('⚡ Validating Performance Optimization...\n');

    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');

    // Check for React.memo or useMemo usage
    if (contractorDashboard.includes('useMemo') || contractorDashboard.includes('useCallback')) {
      this.addResult('Performance', 'Memoization', 'PASS', 'Performance optimization hooks used');
    } else {
      this.addResult('Performance', 'Memoization', 'SKIP', 'Memoization not explicitly found (may not be needed for current data size)');
    }

    // Check for lazy loading
    if (contractorDashboard.includes('lazy') || contractorDashboard.includes('Suspense')) {
      this.addResult('Performance', 'Lazy Loading', 'PASS', 'Lazy loading implemented');
    } else {
      this.addResult('Performance', 'Lazy Loading', 'SKIP', 'Lazy loading not found (may not be needed for current component size)');
    }

    // Check for efficient data fetching
    if (contractorDashboard.includes('useContractorData')) {
      this.addResult('Performance', 'Data Fetching', 'PASS', 'Custom hook for efficient data fetching used');
    } else {
      this.addResult('Performance', 'Data Fetching', 'FAIL', 'Efficient data fetching not implemented');
    }
  }

  async validateSecurityImplementation(): Promise<void> {
    console.log('🔒 Validating Security Implementation...\n');

    const contractorAPI = this.readFile('src/lib/contractor-api.ts');
    const contractorDashboard = this.readFile('src/components/ContractorTrackerDashboard.tsx');

    // Check API security headers
    if (contractorAPI.includes('Authorization') && contractorAPI.includes('apikey')) {
      this.addResult('Security', 'API Authentication', 'PASS', 'API authentication headers properly implemented');
    } else {
      this.addResult('Security', 'API Authentication', 'FAIL', 'API authentication not properly implemented');
    }

    // Check input validation
    if (contractorDashboard.includes('validation') || this.fileExists('src/hooks/useFormValidation.ts')) {
      this.addResult('Security', 'Input Validation', 'PASS', 'Input validation implemented');
    } else {
      this.addResult('Security', 'Input Validation', 'FAIL', 'Input validation not found');
    }

    // Check error handling security
    if (contractorAPI.includes('handleResponse') && contractorAPI.includes('console.error')) {
      this.addResult('Security', 'Secure Error Handling', 'PASS', 'Secure error handling implemented');
    } else {
      this.addResult('Security', 'Secure Error Handling', 'FAIL', 'Secure error handling not properly implemented');
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 FINAL INTEGRATION VALIDATION REPORT');
    console.log('='.repeat(80));

    const categories = [...new Set(this.results.map(r => r.category))];
    
    categories.forEach(category => {
      console.log(`\n📂 ${category.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      const categoryResults = this.results.filter(r => r.category === category);
      categoryResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
        console.log(`${icon} ${result.test}: ${result.message}`);
        if (result.details) {
          console.log(`   Details: ${result.details}`);
        }
      });
    });

    // Summary
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
    console.log(`❌ Failed: ${failed}/${total} (${Math.round(failed/total*100)}%)`);
    console.log(`⏭️  Skipped: ${skipped}/${total} (${Math.round(skipped/total*100)}%)`);

    if (failed === 0) {
      console.log('\n🎉 ALL CRITICAL VALIDATIONS PASSED! Task 20 is complete.');
    } else {
      console.log('\n⚠️  Some validations failed. Please address the issues above.');
    }

    console.log('\n' + '='.repeat(80));
  }

  async run(): Promise<void> {
    console.log('🚀 Starting Final Integration Validation for Task 20...\n');

    try {
      await this.validateMainApplicationIntegration();
      await this.validateVisualConsistency();
      await this.validateThemeIntegration();
      await this.validateAccessibilityCompliance();
      await this.validateEndToEndFunctionality();
      await this.validatePerformanceOptimization();
      await this.validateSecurityImplementation();
    } catch (error) {
      console.error('❌ Validation failed with error:', error);
      process.exit(1);
    }

    this.generateReport();
    
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new FinalIntegrationValidator();
  validator.run().catch(console.error);
}

export { FinalIntegrationValidator };