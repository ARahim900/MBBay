#!/usr/bin/env node

/**
 * Accessibility and Responsive Design Validation Script
 * 
 * This script validates the implementation of task 12:
 * - Mobile-responsive layout with proper touch targets
 * - Keyboard navigation support and ARIA labels
 * - Proper color contrast and screen reader compatibility
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  component: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: string;
}

class AccessibilityValidator {
  private results: ValidationResult[] = [];
  private componentPaths: string[] = [
    'src/components/ui/Button.tsx',
    'src/components/ui/Modal.tsx',
    'src/components/ui/StatusBadge.tsx',
    'src/components/contractor/ContractorDataTable.tsx',
    'src/components/contractor/ContractorFilters.tsx',
    'src/components/contractor/AddContractorModal.tsx',
    'src/components/ContractorTrackerDashboard.tsx'
  ];

  private addResult(component: string, requirement: string, status: 'PASS' | 'FAIL' | 'WARNING', message: string, details?: string) {
    this.results.push({ component, requirement, status, message, details });
  }

  private readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      return '';
    }
  }

  private validateTouchTargets(component: string, content: string) {
    const requirement = '9.1 - Mobile-responsive layout with proper touch targets';
    
    // Check for minimum touch target sizes (44px)
    const minHeightPatterns = [
      /min-h-\[44px\]/g,
      /min-h-\[48px\]/g,
      /min-height:\s*44px/g,
      /min-height:\s*48px/g
    ];

    let hasMinHeight = false;
    minHeightPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasMinHeight = true;
      }
    });

    if (hasMinHeight) {
      this.addResult(component, requirement, 'PASS', 'Component implements proper touch target sizes');
    } else if (content.includes('Button') || content.includes('button')) {
      this.addResult(component, requirement, 'WARNING', 'Interactive elements should have minimum 44px touch targets');
    }

    // Check for responsive design classes
    const responsivePatterns = [
      /sm:/g,
      /md:/g,
      /lg:/g,
      /xl:/g,
      /grid-cols-1.*md:grid-cols-/g,
      /flex-col.*sm:flex-row/g
    ];

    let hasResponsiveClasses = false;
    responsivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasResponsiveClasses = true;
      }
    });

    if (hasResponsiveClasses) {
      this.addResult(component, requirement, 'PASS', 'Component uses responsive design classes');
    } else {
      this.addResult(component, requirement, 'WARNING', 'Component may need responsive design improvements');
    }
  }

  private validateKeyboardNavigation(component: string, content: string) {
    const requirement = '9.2 - Keyboard navigation support and ARIA labels';
    
    // Check for keyboard event handlers
    const keyboardPatterns = [
      /onKeyDown/g,
      /onKeyUp/g,
      /onKeyPress/g,
      /key === 'Enter'/g,
      /key === ' '/g,
      /key === 'Escape'/g,
      /key === 'Tab'/g
    ];

    let hasKeyboardSupport = false;
    keyboardPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasKeyboardSupport = true;
      }
    });

    // Check for tabIndex attributes
    const tabIndexPattern = /tabIndex={?-?[0-9]/g;
    const hasTabIndex = tabIndexPattern.test(content);

    // Check for ARIA attributes
    const ariaPatterns = [
      /aria-label/g,
      /aria-labelledby/g,
      /aria-describedby/g,
      /aria-expanded/g,
      /aria-pressed/g,
      /aria-disabled/g,
      /aria-invalid/g,
      /aria-live/g,
      /aria-sort/g,
      /aria-rowcount/g,
      /aria-rowindex/g,
      /role=/g
    ];

    let hasAriaAttributes = false;
    ariaPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasAriaAttributes = true;
      }
    });

    if (hasKeyboardSupport && hasAriaAttributes) {
      this.addResult(component, requirement, 'PASS', 'Component has keyboard navigation and ARIA support');
    } else if (hasAriaAttributes) {
      this.addResult(component, requirement, 'PASS', 'Component has ARIA attributes');
    } else if (hasKeyboardSupport) {
      this.addResult(component, requirement, 'WARNING', 'Component has keyboard support but may need ARIA attributes');
    } else {
      this.addResult(component, requirement, 'WARNING', 'Component may need keyboard navigation and ARIA support');
    }
  }

  private validateScreenReaderCompatibility(component: string, content: string) {
    const requirement = '9.3 - Screen reader compatibility';
    
    // Check for semantic HTML elements
    const semanticPatterns = [
      /role="button"/g,
      /role="dialog"/g,
      /role="navigation"/g,
      /role="main"/g,
      /role="header"/g,
      /role="table"/g,
      /role="columnheader"/g,
      /role="gridcell"/g,
      /role="status"/g,
      /role="alert"/g,
      /role="searchbox"/g,
      /<header/g,
      /<nav/g,
      /<main/g,
      /<section/g,
      /<h[1-6]/g
    ];

    let hasSemanticElements = false;
    semanticPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasSemanticElements = true;
      }
    });

    // Check for screen reader only content
    const srOnlyPattern = /sr-only/g;
    const hasSrOnly = srOnlyPattern.test(content);

    // Check for proper labeling
    const labelPatterns = [
      /htmlFor=/g,
      /<label/g,
      /aria-label/g,
      /aria-labelledby/g
    ];

    let hasProperLabeling = false;
    labelPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasProperLabeling = true;
      }
    });

    if (hasSemanticElements && hasProperLabeling) {
      this.addResult(component, requirement, 'PASS', 'Component has semantic elements and proper labeling');
    } else if (hasSemanticElements || hasProperLabeling) {
      this.addResult(component, requirement, 'PASS', 'Component has some screen reader compatibility features');
    } else {
      this.addResult(component, requirement, 'WARNING', 'Component may need screen reader compatibility improvements');
    }

    if (hasSrOnly) {
      this.addResult(component, requirement, 'PASS', 'Component includes screen reader only content');
    }
  }

  private validateColorContrast(component: string, content: string) {
    const requirement = '9.4 - Proper color contrast';
    
    // Check for theme color usage
    const themeColorPatterns = [
      /getThemeValue\('colors\./g,
      /theme\.colors\./g,
      /colors\.status\./g,
      /colors\.primary/g,
      /colors\.secondary/g
    ];

    let usesThemeColors = false;
    themeColorPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        usesThemeColors = true;
      }
    });

    // Check for dark mode support
    const darkModePatterns = [
      /dark:/g,
      /dark:bg-/g,
      /dark:text-/g,
      /dark:border-/g
    ];

    let hasDarkModeSupport = false;
    darkModePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasDarkModeSupport = true;
      }
    });

    if (usesThemeColors && hasDarkModeSupport) {
      this.addResult(component, requirement, 'PASS', 'Component uses theme colors and supports dark mode');
    } else if (usesThemeColors) {
      this.addResult(component, requirement, 'PASS', 'Component uses theme colors');
    } else if (hasDarkModeSupport) {
      this.addResult(component, requirement, 'PASS', 'Component supports dark mode');
    } else {
      this.addResult(component, requirement, 'WARNING', 'Component may need color contrast improvements');
    }
  }

  private validateResponsiveDesign(component: string, content: string) {
    const requirement = '9.5 - Responsive design without breaking or overlapping content';
    
    // Check for responsive grid systems
    const gridPatterns = [
      /grid-cols-1.*sm:grid-cols-/g,
      /grid-cols-1.*md:grid-cols-/g,
      /grid-cols-1.*lg:grid-cols-/g,
      /flex-col.*sm:flex-row/g,
      /flex-col.*md:flex-row/g
    ];

    let hasResponsiveGrid = false;
    gridPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasResponsiveGrid = true;
      }
    });

    // Check for responsive spacing
    const spacingPatterns = [
      /gap-2.*sm:gap-/g,
      /gap-4.*sm:gap-/g,
      /p-4.*sm:p-/g,
      /px-4.*sm:px-/g,
      /py-2.*sm:py-/g
    ];

    let hasResponsiveSpacing = false;
    spacingPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasResponsiveSpacing = true;
      }
    });

    // Check for responsive visibility
    const visibilityPatterns = [
      /hidden.*sm:block/g,
      /hidden.*md:block/g,
      /hidden.*lg:block/g,
      /sm:hidden/g,
      /md:hidden/g,
      /lg:hidden/g
    ];

    let hasResponsiveVisibility = false;
    visibilityPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasResponsiveVisibility = true;
      }
    });

    // Check for overflow handling
    const overflowPatterns = [
      /overflow-x-auto/g,
      /overflow-y-auto/g,
      /overflow-hidden/g,
      /truncate/g,
      /line-clamp-/g
    ];

    let hasOverflowHandling = false;
    overflowPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasOverflowHandling = true;
      }
    });

    const responsiveFeatures = [
      hasResponsiveGrid,
      hasResponsiveSpacing,
      hasResponsiveVisibility,
      hasOverflowHandling
    ].filter(Boolean).length;

    if (responsiveFeatures >= 3) {
      this.addResult(component, requirement, 'PASS', 'Component has comprehensive responsive design');
    } else if (responsiveFeatures >= 2) {
      this.addResult(component, requirement, 'PASS', 'Component has good responsive design features');
    } else if (responsiveFeatures >= 1) {
      this.addResult(component, requirement, 'WARNING', 'Component has some responsive design features');
    } else {
      this.addResult(component, requirement, 'WARNING', 'Component may need responsive design improvements');
    }
  }

  public validate(): ValidationResult[] {
    console.log('🔍 Validating Accessibility and Responsive Design Implementation...\n');

    this.componentPaths.forEach(componentPath => {
      const componentName = path.basename(componentPath, '.tsx');
      const content = this.readFile(componentPath);

      if (!content) {
        this.addResult(componentName, 'File Access', 'FAIL', `Could not read file: ${componentPath}`);
        return;
      }

      console.log(`📋 Validating ${componentName}...`);

      // Validate all requirements
      this.validateTouchTargets(componentName, content);
      this.validateKeyboardNavigation(componentName, content);
      this.validateScreenReaderCompatibility(componentName, content);
      this.validateColorContrast(componentName, content);
      this.validateResponsiveDesign(componentName, content);
    });

    return this.results;
  }

  public generateReport(): void {
    const results = this.validate();
    
    console.log('\n📊 ACCESSIBILITY AND RESPONSIVE DESIGN VALIDATION REPORT');
    console.log('=' .repeat(60));

    const summary = {
      PASS: results.filter(r => r.status === 'PASS').length,
      WARNING: results.filter(r => r.status === 'WARNING').length,
      FAIL: results.filter(r => r.status === 'FAIL').length
    };

    console.log(`\n📈 Summary:`);
    console.log(`✅ PASS: ${summary.PASS}`);
    console.log(`⚠️  WARNING: ${summary.WARNING}`);
    console.log(`❌ FAIL: ${summary.FAIL}`);
    console.log(`📊 Total: ${results.length}`);

    // Group results by requirement
    const requirementGroups = results.reduce((groups, result) => {
      if (!groups[result.requirement]) {
        groups[result.requirement] = [];
      }
      groups[result.requirement].push(result);
      return groups;
    }, {} as Record<string, ValidationResult[]>);

    console.log('\n📋 Detailed Results by Requirement:');
    console.log('-'.repeat(60));

    Object.entries(requirementGroups).forEach(([requirement, reqResults]) => {
      console.log(`\n🎯 ${requirement}`);
      
      reqResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`  ${icon} ${result.component}: ${result.message}`);
        if (result.details) {
          console.log(`     ${result.details}`);
        }
      });
    });

    // Component-specific results
    console.log('\n📦 Results by Component:');
    console.log('-'.repeat(60));

    const componentGroups = results.reduce((groups, result) => {
      if (!groups[result.component]) {
        groups[result.component] = [];
      }
      groups[result.component].push(result);
      return groups;
    }, {} as Record<string, ValidationResult[]>);

    Object.entries(componentGroups).forEach(([component, compResults]) => {
      const passCount = compResults.filter(r => r.status === 'PASS').length;
      const totalCount = compResults.length;
      const percentage = Math.round((passCount / totalCount) * 100);
      
      console.log(`\n🧩 ${component} (${percentage}% compliant)`);
      
      compResults.forEach(result => {
        const icon = result.status === 'PASS' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`  ${icon} ${result.message}`);
      });
    });

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('-'.repeat(60));

    const warnings = results.filter(r => r.status === 'WARNING');
    const failures = results.filter(r => r.status === 'FAIL');

    if (failures.length > 0) {
      console.log('\n🚨 Critical Issues (Must Fix):');
      failures.forEach(failure => {
        console.log(`  • ${failure.component}: ${failure.message}`);
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Improvement Opportunities:');
      warnings.forEach(warning => {
        console.log(`  • ${warning.component}: ${warning.message}`);
      });
    }

    if (failures.length === 0 && warnings.length === 0) {
      console.log('\n🎉 Excellent! All components meet accessibility and responsive design requirements.');
    }

    // Overall compliance score
    const overallScore = Math.round((summary.PASS / results.length) * 100);
    console.log(`\n🏆 Overall Compliance Score: ${overallScore}%`);
    
    if (overallScore >= 90) {
      console.log('🌟 Outstanding accessibility and responsive design implementation!');
    } else if (overallScore >= 80) {
      console.log('👍 Good accessibility and responsive design implementation with room for improvement.');
    } else if (overallScore >= 70) {
      console.log('📈 Decent implementation but needs significant improvements.');
    } else {
      console.log('🔧 Implementation needs major accessibility and responsive design improvements.');
    }

    console.log('\n' + '='.repeat(60));
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AccessibilityValidator();
  validator.generateReport();
}

export { AccessibilityValidator, ValidationResult };