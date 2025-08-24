/**
 * Simple Validation Script for Comprehensive Testing Suite
 */

import fs from 'fs';
import path from 'path';

class TestingValidator {
  constructor() {
    this.results = [];
  }

  validate() {
    console.log('🔍 Validating Comprehensive Testing Suite Implementation...\n');

    this.validateTestFiles();
    this.validateConfiguration();
    this.generateReport();
  }

  validateTestFiles() {
    console.log('📁 Validating Test Files...');

    const requiredTestFiles = [
      'src/tests/contractor-api.test.ts',
      'src/tests/useContractorData.test.ts', 
      'src/tests/contractor-crud.test.tsx',
      'src/tests/contractor-integration.test.tsx',
      'src/tests/visual-regression-contractor.test.tsx',
      'src/tests/comprehensive-contractor-test-suite.test.tsx'
    ];

    for (const testFile of requiredTestFiles) {
      const exists = fs.existsSync(testFile);
      if (exists) {
        const content = fs.readFileSync(testFile, 'utf-8');
        const testCount = (content.match(/it\(|test\(/g) || []).length;
        
        this.results.push({
          category: 'Test Files',
          requirement: path.basename(testFile),
          status: 'pass',
          details: `Found ${testCount} tests`
        });
      } else {
        this.results.push({
          category: 'Test Files',
          requirement: path.basename(testFile),
          status: 'fail',
          details: 'File does not exist'
        });
      }
    }

    console.log('   ✅ Test files validation complete\n');
  }

  validateConfiguration() {
    console.log('⚙️ Validating Configuration...');

    // Check vitest config
    if (fs.existsSync('vitest.config.ts')) {
      this.results.push({
        category: 'Configuration',
        requirement: 'Vitest configuration',
        status: 'pass',
        details: 'vitest.config.ts exists'
      });
    } else {
      this.results.push({
        category: 'Configuration',
        requirement: 'Vitest configuration',
        status: 'fail',
        details: 'vitest.config.ts missing'
      });
    }

    // Check test setup
    if (fs.existsSync('src/tests/setup.ts')) {
      this.results.push({
        category: 'Configuration',
        requirement: 'Test setup',
        status: 'pass',
        details: 'src/tests/setup.ts exists'
      });
    } else {
      this.results.push({
        category: 'Configuration',
        requirement: 'Test setup',
        status: 'fail',
        details: 'src/tests/setup.ts missing'
      });
    }

    // Check package.json scripts
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const scripts = packageJson.scripts || {};
      
      const requiredScripts = ['test', 'test:contractor', 'test:coverage'];
      
      for (const script of requiredScripts) {
        if (scripts[script]) {
          this.results.push({
            category: 'Configuration',
            requirement: `Script: ${script}`,
            status: 'pass',
            details: 'Script exists in package.json'
          });
        } else {
          this.results.push({
            category: 'Configuration',
            requirement: `Script: ${script}`,
            status: 'fail',
            details: 'Script missing from package.json'
          });
        }
      }
    }

    console.log('   ✅ Configuration validation complete\n');
  }

  generateReport() {
    console.log('📊 COMPREHENSIVE TESTING VALIDATION REPORT');
    console.log('='.repeat(60));

    const categories = [...new Set(this.results.map(r => r.category))];
    
    let totalPass = 0;
    let totalFail = 0;

    for (const category of categories) {
      console.log(`\n📋 ${category}`);
      console.log('-'.repeat(40));

      const categoryResults = this.results.filter(r => r.category === category);
      
      for (const result of categoryResults) {
        const icon = result.status === 'pass' ? '✅' : '❌';
        console.log(`${icon} ${result.requirement}`);
        console.log(`   ${result.details}`);

        if (result.status === 'pass') totalPass++;
        else totalFail++;
      }
    }

    console.log('\n📊 Overall Summary');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${totalPass}`);
    console.log(`❌ Failed: ${totalFail}`);

    const successRate = totalPass + totalFail > 0 
      ? ((totalPass / (totalPass + totalFail)) * 100).toFixed(1)
      : '0';
    console.log(`📈 Success Rate: ${successRate}%`);

    console.log('\n' + '='.repeat(60));

    if (totalFail > 0) {
      console.log('❌ Validation failed. Please address the failed requirements.');
    } else {
      console.log('🎉 All validations passed! Comprehensive testing suite is properly implemented.');
    }
  }
}

const validator = new TestingValidator();
validator.validate();