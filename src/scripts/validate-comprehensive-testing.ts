/**
 * Validation Script for Comprehensive Testing Suite Implementation
 * 
 * This script validates that the comprehensive testing suite meets all
 * requirements and provides proper coverage for the contractor tracker enhancement.
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
}

interface TestFileInfo {
  path: string;
  exists: boolean;
  size: number;
  testCount: number;
  coverage: string[];
}

class ComprehensiveTestingValidator {
  private results: ValidationResult[] = [];
  private testFiles: TestFileInfo[] = [];

  async validate(): Promise<void> {
    console.log('🔍 Validating Comprehensive Testing Suite Implementation...\n');

    await this.validateTestInfrastructure();
    await this.validateTestFiles();
    await this.validateRequirementsCoverage();
    await this.validateTestConfiguration();
    await this.validateDocumentation();

    this.generateReport();
  }

  private async validateTestInfrastructure(): Promise<void> {
    console.log('📋 Validating Test Infrastructure...');

    // Check vitest configuration
    this.checkFile('vitest.config.ts', 'Vitest configuration file');
    
    // Check test setup
    this.checkFile('src/tests/setup.ts', 'Test setup and global configuration');
    
    // Check package.json test scripts
    this.validatePackageJsonScripts();
    
    // Check test runner
    this.checkFile('src/tests/test-runner.ts', 'Comprehensive test runner');

    console.log('   ✅ Test infrastructure validation complete\n');
  }

  private async validateTestFiles(): Promise<void> {
    console.log('📁 Validating Test Files...');

    const requiredTestFiles = [
      {
        path: 'src/tests/contractor-api.test.ts',
        description: 'ContractorAPI service unit tests',
        minTests: 15
      },
      {
        path: 'src/tests/useContractorData.test.ts',
        description: 'useContractorData hook unit tests',
        minTests: 20
      },
      {
        path: 'src/tests/contractor-crud.test.tsx',
        description: 'CRUD operations component tests',
        minTests: 12
      },
      {
        path: 'src/tests/contractor-integration.test.tsx',
        description: 'Integration tests for data flow',
        minTests: 25
      },
      {
        path: 'src/tests/visual-regression-contractor.test.tsx',
        description: 'Visual regression and theme consistency tests',
        minTests: 30
      },
      {
        path: 'src/tests/comprehensive-contractor-test-suite.test.tsx',
        description: 'Complete requirements validation test suite',
        minTests: 50
      }
    ];

    for (const testFile of requiredTestFiles) {
      await this.validateTestFile(testFile);
    }

    console.log('   ✅ Test files validation complete\n');
  }

  private async validateTestFile(testFile: { path: string; description: string; minTests: number }): Promise<void> {
    const exists = fs.existsSync(testFile.path);
    
    if (!exists) {
      this.results.push({
        category: 'Test Files',
        requirement: testFile.description,
        status: 'fail',
        details: `Test file ${testFile.path} does not exist`
      });
      return;
    }

    const content = fs.readFileSync(testFile.path, 'utf-8');
    const testCount = this.countTests(content);
    const size = content.length;

    this.testFiles.push({
      path: testFile.path,
      exists: true,
      size,
      testCount,
      coverage: this.extractCoverage(content)
    });

    if (testCount >= testFile.minTests) {
      this.results.push({
        category: 'Test Files',
        requirement: testFile.description,
        status: 'pass',
        details: `Found ${testCount} tests (minimum: ${testFile.minTests})`
      });
    } else {
      this.results.push({
        category: 'Test Files',
        requirement: testFile.description,
        status: 'warning',
        details: `Found ${testCount} tests, expected minimum ${testFile.minTests}`
      });
    }
  }

  private countTests(content: string): number {
    const testMatches = content.match(/it\(|test\(/g);
    return testMatches ? testMatches.length : 0;
  }

  private extractCoverage(content: string): string[] {
    const coverage: string[] = [];
    
    // Extract describe blocks to understand test coverage
    const describeMatches = content.match(/describe\(['"`]([^'"`]+)['"`]/g);
    if (describeMatches) {
      coverage.push(...describeMatches.map(match => 
        match.replace(/describe\(['"`]([^'"`]+)['"`]/, '$1')
      ));
    }

    return coverage;
  }

  private async validateRequirementsCoverage(): Promise<void> {
    console.log('📊 Validating Requirements Coverage...');

    const requirements = [
      {
        id: 'REQ-1',
        name: 'Supabase Database Integration',
        testPatterns: ['getAllContractors', 'getAnalytics', 'API', 'headers']
      },
      {
        id: 'REQ-2',
        name: 'Analytics and Summary Data',
        testPatterns: ['analytics', 'summary', 'calculateSummary', 'expiring']
      },
      {
        id: 'REQ-3',
        name: 'Visual Consistency',
        testPatterns: ['theme', 'color', 'typography', 'consistency']
      },
      {
        id: 'REQ-4',
        name: 'Component Standardization',
        testPatterns: ['Card', 'KpiCard', 'Button', 'Modal']
      },
      {
        id: 'REQ-5',
        name: 'Theme Integration',
        testPatterns: ['getThemeValue', 'theme', 'colors', 'spacing']
      },
      {
        id: 'REQ-6',
        name: 'CRUD Operations',
        testPatterns: ['create', 'update', 'delete', 'CRUD']
      },
      {
        id: 'REQ-7',
        name: 'Filtering and Search',
        testPatterns: ['filter', 'search', 'updateFilters', 'searchContractors']
      },
      {
        id: 'REQ-8',
        name: 'Contract Expiration Notifications',
        testPatterns: ['expir', 'notification', 'urgency', 'warning']
      },
      {
        id: 'REQ-9',
        name: 'Accessibility and Responsive Design',
        testPatterns: ['accessibility', 'responsive', 'keyboard', 'ARIA']
      },
      {
        id: 'REQ-10',
        name: 'Error Handling and Security',
        testPatterns: ['error', 'handleAPIError', 'validation', 'security']
      }
    ];

    for (const requirement of requirements) {
      this.validateRequirementCoverage(requirement);
    }

    console.log('   ✅ Requirements coverage validation complete\n');
  }

  private validateRequirementCoverage(requirement: { id: string; name: string; testPatterns: string[] }): void {
    let coverageFound = false;
    let testCount = 0;

    for (const testFile of this.testFiles) {
      if (!testFile.exists) continue;

      const content = fs.readFileSync(testFile.path, 'utf-8');
      
      for (const pattern of requirement.testPatterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches = content.match(regex);
        if (matches) {
          coverageFound = true;
          testCount += matches.length;
        }
      }
    }

    if (coverageFound && testCount >= 3) {
      this.results.push({
        category: 'Requirements Coverage',
        requirement: `${requirement.id}: ${requirement.name}`,
        status: 'pass',
        details: `Found ${testCount} test references covering this requirement`
      });
    } else if (coverageFound) {
      this.results.push({
        category: 'Requirements Coverage',
        requirement: `${requirement.id}: ${requirement.name}`,
        status: 'warning',
        details: `Limited coverage found (${testCount} references)`
      });
    } else {
      this.results.push({
        category: 'Requirements Coverage',
        requirement: `${requirement.id}: ${requirement.name}`,
        status: 'fail',
        details: 'No test coverage found for this requirement'
      });
    }
  }

  private validateTestConfiguration(): Promise<void> {
    console.log('⚙️ Validating Test Configuration...');

    // Check vitest config
    if (fs.existsSync('vitest.config.ts')) {
      const config = fs.readFileSync('vitest.config.ts', 'utf-8');
      
      const requiredConfig = [
        'jsdom',
        'setupFiles',
        'coverage',
        'globals: true'
      ];

      for (const configItem of requiredConfig) {
        if (config.includes(configItem)) {
          this.results.push({
            category: 'Test Configuration',
            requirement: `Vitest ${configItem} configuration`,
            status: 'pass',
            details: 'Configuration found and properly set'
          });
        } else {
          this.results.push({
            category: 'Test Configuration',
            requirement: `Vitest ${configItem} configuration`,
            status: 'fail',
            details: 'Required configuration missing'
          });
        }
      }
    }

    console.log('   ✅ Test configuration validation complete\n');
    return Promise.resolve();
  }

  private validateDocumentation(): Promise<void> {
    console.log('📚 Validating Documentation...');

    const docFile = 'src/docs/comprehensive-testing-implementation.md';
    
    if (fs.existsSync(docFile)) {
      const content = fs.readFileSync(docFile, 'utf-8');
      
      const requiredSections = [
        'Test Suite Structure',
        'Requirements Coverage',
        'Running Tests',
        'Coverage Targets',
        'Performance Testing',
        'Accessibility Testing'
      ];

      for (const section of requiredSections) {
        if (content.includes(section)) {
          this.results.push({
            category: 'Documentation',
            requirement: `${section} documentation`,
            status: 'pass',
            details: 'Section found and documented'
          });
        } else {
          this.results.push({
            category: 'Documentation',
            requirement: `${section} documentation`,
            status: 'warning',
            details: 'Section missing or incomplete'
          });
        }
      }
    } else {
      this.results.push({
        category: 'Documentation',
        requirement: 'Comprehensive testing documentation',
        status: 'fail',
        details: 'Documentation file not found'
      });
    }

    console.log('   ✅ Documentation validation complete\n');
    return Promise.resolve();
  }

  private checkFile(filePath: string, description: string): void {
    if (fs.existsSync(filePath)) {
      this.results.push({
        category: 'Test Infrastructure',
        requirement: description,
        status: 'pass',
        details: `File exists: ${filePath}`
      });
    } else {
      this.results.push({
        category: 'Test Infrastructure',
        requirement: description,
        status: 'fail',
        details: `File missing: ${filePath}`
      });
    }
  }

  private validatePackageJsonScripts(): void {
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};

      const requiredScripts = [
        'test',
        'test:run',
        'test:coverage',
        'test:contractor',
        'test:contractor:comprehensive'
      ];

      for (const script of requiredScripts) {
        if (scripts[script]) {
          this.results.push({
            category: 'Test Infrastructure',
            requirement: `Package.json script: ${script}`,
            status: 'pass',
            details: `Script defined: ${scripts[script]}`
          });
        } else {
          this.results.push({
            category: 'Test Infrastructure',
            requirement: `Package.json script: ${script}`,
            status: 'fail',
            details: 'Required test script missing'
          });
        }
      }
    }
  }

  private generateReport(): void {
    console.log('📊 COMPREHENSIVE TESTING VALIDATION REPORT');
    console.log('='.repeat(60));

    const categories = [...new Set(this.results.map(r => r.category))];
    
    let totalPass = 0;
    let totalFail = 0;
    let totalWarning = 0;

    for (const category of categories) {
      console.log(`\n📋 ${category}`);
      console.log('-'.repeat(40));

      const categoryResults = this.results.filter(r => r.category === category);
      
      for (const result of categoryResults) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${result.requirement}`);
        console.log(`   ${result.details}`);

        if (result.status === 'pass') totalPass++;
        else if (result.status === 'fail') totalFail++;
        else totalWarning++;
      }
    }

    // Test file summary
    console.log('\n📁 Test Files Summary');
    console.log('-'.repeat(40));
    
    let totalTests = 0;
    for (const testFile of this.testFiles) {
      if (testFile.exists) {
        console.log(`✅ ${testFile.path}`);
        console.log(`   Tests: ${testFile.testCount}, Size: ${(testFile.size / 1024).toFixed(1)}KB`);
        totalTests += testFile.testCount;
      }
    }

    // Overall summary
    console.log('\n📊 Overall Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${totalPass}`);
    console.log(`❌ Failed: ${totalFail}`);
    console.log(`⚠️  Warnings: ${totalWarning}`);
    console.log(`📋 Total Tests: ${totalTests}`);
    console.log(`📁 Test Files: ${this.testFiles.filter(f => f.exists).length}`);

    const successRate = ((totalPass / (totalPass + totalFail + totalWarning)) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    console.log('\n' + '='.repeat(60));

    if (totalFail > 0) {
      console.log('❌ Validation failed. Please address the failed requirements.');
      process.exit(1);
    } else if (totalWarning > 0) {
      console.log('⚠️  Validation passed with warnings. Consider addressing warnings for optimal coverage.');
    } else {
      console.log('🎉 All validations passed! Comprehensive testing suite is properly implemented.');
    }
  }
}

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ComprehensiveTestingValidator();
  validator.validate().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export { ComprehensiveTestingValidator };