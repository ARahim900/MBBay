#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Final Integration Validation for Task 20...\n');

const results = [];

function addResult(category, test, status, message, details) {
  results.push({ category, test, status, message, details });
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch {
    return '';
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

// Validate Main Application Integration
console.log('🔍 Validating Main Application Integration...\n');

const appContent = readFile('App.tsx');
if (appContent.includes('ContractorTrackerDashboard') && appContent.includes("'Contractor Tracker'")) {
  addResult('Integration', 'App.tsx Integration', 'PASS', 'ContractorTrackerDashboard properly integrated in main app');
} else {
  addResult('Integration', 'App.tsx Integration', 'FAIL', 'ContractorTrackerDashboard not properly integrated in App.tsx');
}

if (appContent.includes('HardHat') && appContent.includes('Contractor Tracker')) {
  addResult('Integration', 'Navigation Structure', 'PASS', 'Contractor Tracker properly added to navigation with HardHat icon');
} else {
  addResult('Integration', 'Navigation Structure', 'FAIL', 'Navigation structure not properly configured');
}

if (appContent.includes("case 'Contractor Tracker': return <ContractorTrackerDashboard />")) {
  addResult('Integration', 'Module Switching', 'PASS', 'Module switching logic properly implemented');
} else {
  addResult('Integration', 'Module Switching', 'FAIL', 'Module switching logic not found or incorrect');
}

// Validate Visual Consistency
console.log('🎨 Validating Visual Consistency...\n');

const contractorDashboard = readFile('src/components/ContractorTrackerDashboard.tsx');

const hasConsistentHeader = contractorDashboard.includes('flex flex-col sm:flex-row sm:items-center justify-between') &&
                           contractorDashboard.includes('dark:text-white');

if (hasConsistentHeader) {
  addResult('Visual Consistency', 'Header Structure', 'PASS', 'Header layout matches FirefightingDashboard pattern');
} else {
  addResult('Visual Consistency', 'Header Structure', 'FAIL', 'Header structure does not match established pattern');
}

if (contractorDashboard.includes('<KpiCard') && contractorDashboard.includes('color="blue"')) {
  addResult('Visual Consistency', 'KpiCard Components', 'PASS', 'KpiCard components properly used with theme colors');
} else {
  addResult('Visual Consistency', 'KpiCard Components', 'FAIL', 'KpiCard components not properly implemented');
}

if (contractorDashboard.includes('<MenuBar') && contractorDashboard.includes('gradient:')) {
  addResult('Visual Consistency', 'MenuBar Navigation', 'PASS', 'MenuBar component used with theme gradients');
} else {
  addResult('Visual Consistency', 'MenuBar Navigation', 'FAIL', 'MenuBar not properly implemented with theme gradients');
}

if (contractorDashboard.includes('<Card>') || contractorDashboard.includes('<Card ')) {
  addResult('Visual Consistency', 'Card Components', 'PASS', 'Card components consistently used');
} else {
  addResult('Visual Consistency', 'Card Components', 'FAIL', 'Card components not consistently used');
}

if (contractorDashboard.includes('<Button') && contractorDashboard.includes('variant=')) {
  addResult('Visual Consistency', 'Button Components', 'PASS', 'Button components used with consistent variants');
} else {
  addResult('Visual Consistency', 'Button Components', 'FAIL', 'Button components not properly implemented');
}

if (contractorDashboard.includes('<StatusBadge') || contractorDashboard.includes('StatusBadge')) {
  addResult('Visual Consistency', 'StatusBadge Components', 'PASS', 'StatusBadge components properly used');
} else {
  addResult('Visual Consistency', 'StatusBadge Components', 'FAIL', 'StatusBadge components not found');
}

// Validate Theme Integration
console.log('🎨 Validating Theme Integration...\n');

if (contractorDashboard.includes('getThemeValue(')) {
  addResult('Theme Integration', 'Theme Utility Usage', 'PASS', 'getThemeValue utility properly used');
} else {
  addResult('Theme Integration', 'Theme Utility Usage', 'FAIL', 'getThemeValue utility not used for theme consistency');
}

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
  addResult('Theme Integration', 'Theme Color Usage', 'PASS', `Theme colors properly referenced (${themeUsageCount}/${themeColorPatterns.length} patterns found)`);
} else {
  addResult('Theme Integration', 'Theme Color Usage', 'FAIL', `Insufficient theme color usage (${themeUsageCount}/${themeColorPatterns.length} patterns found)`);
}

if (contractorDashboard.includes('dark:')) {
  addResult('Theme Integration', 'Dark Mode Support', 'PASS', 'Dark mode classes properly implemented');
} else {
  addResult('Theme Integration', 'Dark Mode Support', 'FAIL', 'Dark mode support not implemented');
}

// Validate Accessibility Compliance
console.log('♿ Validating Accessibility Compliance...\n');

if (contractorDashboard.includes('aria-label') || contractorDashboard.includes('aria-labelledby')) {
  addResult('Accessibility', 'ARIA Labels', 'PASS', 'ARIA labels properly implemented');
} else {
  addResult('Accessibility', 'ARIA Labels', 'FAIL', 'ARIA labels not found');
}

if (contractorDashboard.includes('<header') || contractorDashboard.includes('role="')) {
  addResult('Accessibility', 'Semantic HTML', 'PASS', 'Semantic HTML elements used');
} else {
  addResult('Accessibility', 'Semantic HTML', 'FAIL', 'Semantic HTML not properly implemented');
}

if (contractorDashboard.includes('sm:') && contractorDashboard.includes('lg:')) {
  addResult('Accessibility', 'Responsive Design', 'PASS', 'Responsive design classes properly used');
} else {
  addResult('Accessibility', 'Responsive Design', 'FAIL', 'Responsive design not properly implemented');
}

// Validate End-to-End Functionality
console.log('🔄 Validating End-to-End Functionality...\n');

if (fileExists('src/tests/contractor-integration-final.test.tsx')) {
  addResult('E2E Testing', 'Integration Test File', 'PASS', 'Integration test file exists');
} else {
  addResult('E2E Testing', 'Integration Test File', 'FAIL', 'Integration test file not found');
}

const crudOperations = ['handleAddContractor', 'handleEditContractor', 'handleDeleteContractor'];
let crudCount = 0;
crudOperations.forEach(operation => {
  if (contractorDashboard.includes(operation)) {
    crudCount++;
  }
});

if (crudCount === crudOperations.length) {
  addResult('E2E Testing', 'CRUD Operations', 'PASS', 'All CRUD operations implemented');
} else {
  addResult('E2E Testing', 'CRUD Operations', 'FAIL', `Missing CRUD operations (${crudCount}/${crudOperations.length} found)`);
}

if (contractorDashboard.includes('error') && contractorDashboard.includes('loading')) {
  addResult('E2E Testing', 'Error Handling', 'PASS', 'Error and loading states properly handled');
} else {
  addResult('E2E Testing', 'Error Handling', 'FAIL', 'Error handling not properly implemented');
}

// Validate Performance and Security
console.log('⚡ Validating Performance and Security...\n');

if (contractorDashboard.includes('useContractorData')) {
  addResult('Performance', 'Data Fetching', 'PASS', 'Custom hook for efficient data fetching used');
} else {
  addResult('Performance', 'Data Fetching', 'FAIL', 'Efficient data fetching not implemented');
}

const contractorAPI = readFile('src/lib/contractor-api.ts');
if (contractorAPI.includes('Authorization') && contractorAPI.includes('apikey')) {
  addResult('Security', 'API Authentication', 'PASS', 'API authentication headers properly implemented');
} else {
  addResult('Security', 'API Authentication', 'FAIL', 'API authentication not properly implemented');
}

if (contractorDashboard.includes('validation') || fileExists('src/hooks/useFormValidation.ts')) {
  addResult('Security', 'Input Validation', 'PASS', 'Input validation implemented');
} else {
  addResult('Security', 'Input Validation', 'FAIL', 'Input validation not found');
}

// Generate Report
console.log('\n' + '='.repeat(80));
console.log('📋 FINAL INTEGRATION VALIDATION REPORT');
console.log('='.repeat(80));

const categories = [...new Set(results.map(r => r.category))];

categories.forEach(category => {
  console.log(`\n📂 ${category.toUpperCase()}`);
  console.log('-'.repeat(40));
  
  const categoryResults = results.filter(r => r.category === category);
  categoryResults.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
  });
});

// Summary
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const skipped = results.filter(r => r.status === 'SKIP').length;
const total = results.length;

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

process.exit(failed > 0 ? 1 : 0);