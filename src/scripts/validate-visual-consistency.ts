/**
 * Visual Consistency Validation Script
 * 
 * This script performs comprehensive validation of visual consistency
 * between the firefighting dashboard and other enhanced modules.
 * 
 * Usage: npm run validate-consistency
 */

import { theme, getThemeValue } from '../lib/theme';

interface ValidationResult {
  category: string;
  passed: boolean;
  issues: string[];
  recommendations: string[];
}

interface ValidationSummary {
  totalTests: number;
  passed: number;
  failed: number;
  score: number;
  results: ValidationResult[];
}

/**
 * Validates color palette consistency
 */
const validateColorConsistency = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check required theme colors exist
  const requiredColors = [
    'colors.primary',
    'colors.secondary', 
    'colors.accent',
    'colors.status.success',
    'colors.status.warning',
    'colors.status.error',
    'colors.status.info'
  ];
  
  requiredColors.forEach(colorPath => {
    const color = getThemeValue(colorPath, null);
    if (!color || color === null) {
      issues.push(`Missing required color: ${colorPath}`);
    }
  });
  
  // Validate specific color values match requirements
  const colorValidations = [
    { path: 'colors.primary', expected: '#2D9CDB', name: 'Primary' },
    { path: 'colors.secondary', expected: '#FF5B5B', name: 'Secondary' },
    { path: 'colors.accent', expected: '#F7C604', name: 'Accent' },
    { path: 'colors.status.success', expected: '#10b981', name: 'Success' },
    { path: 'colors.status.warning', expected: '#f59e0b', name: 'Warning' },
    { path: 'colors.status.error', expected: '#ef4444', name: 'Error' },
    { path: 'colors.status.info', expected: '#3b82f6', name: 'Info' }
  ];
  
  colorValidations.forEach(({ path, expected, name }) => {
    const actual = getThemeValue(path, '');
    if (actual !== expected) {
      issues.push(`${name} color mismatch: expected ${expected}, got ${actual}`);
      recommendations.push(`Update ${path} to ${expected}`);
    }
  });
  
  // Check extended color palette
  const extendedColors = ['purple', 'indigo', 'teal', 'orange', 'pink', 'green'];
  extendedColors.forEach(color => {
    const value = getThemeValue(`colors.extended.${color}`, null);
    if (!value) {
      issues.push(`Missing extended color: ${color}`);
      recommendations.push(`Add colors.extended.${color} to theme`);
    }
  });
  
  return {
    category: 'Color Consistency',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validates typography consistency
 */
const validateTypographyConsistency = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check font family
  const fontFamily = getThemeValue('typography.fontFamily', '');
  if (!fontFamily.includes('Inter')) {
    issues.push('Font family should include Inter');
    recommendations.push('Set typography.fontFamily to "\'Inter\', sans-serif"');
  }
  
  // Check required font sizes
  const requiredSizes = [
    { path: 'typography.titleSize', expected: '1.25rem', name: 'Title size' },
    { path: 'typography.labelSize', expected: '0.875rem', name: 'Label size' },
    { path: 'typography.tooltipSize', expected: '0.75rem', name: 'Tooltip size' }
  ];
  
  requiredSizes.forEach(({ path, expected, name }) => {
    const actual = getThemeValue(path, '');
    if (actual !== expected) {
      issues.push(`${name} mismatch: expected ${expected}, got ${actual}`);
      recommendations.push(`Update ${path} to ${expected}`);
    }
  });
  
  // Check extended font size scale
  const extendedSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];
  extendedSizes.forEach(size => {
    const value = getThemeValue(`typography.fontSize.${size}`, null);
    if (!value) {
      issues.push(`Missing font size: ${size}`);
      recommendations.push(`Add typography.fontSize.${size} to theme`);
    }
  });
  
  // Check font weights
  const requiredWeights = ['normal', 'medium', 'semibold', 'bold'];
  requiredWeights.forEach(weight => {
    const value = getThemeValue(`typography.fontWeight.${weight}`, null);
    if (!value) {
      issues.push(`Missing font weight: ${weight}`);
      recommendations.push(`Add typography.fontWeight.${weight} to theme`);
    }
  });
  
  return {
    category: 'Typography Consistency',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validates spacing consistency
 */
const validateSpacingConsistency = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check required spacing values
  const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  requiredSpacing.forEach(size => {
    const value = getThemeValue(`spacing.${size}`, null);
    if (!value) {
      issues.push(`Missing spacing value: ${size}`);
      recommendations.push(`Add spacing.${size} to theme`);
    }
  });
  
  // Validate specific spacing values
  const spacingValidations = [
    { size: 'xs', expected: '0.5rem' },
    { size: 'sm', expected: '0.75rem' },
    { size: 'md', expected: '1rem' },
    { size: 'lg', expected: '1.5rem' },
    { size: 'xl', expected: '2rem' }
  ];
  
  spacingValidations.forEach(({ size, expected }) => {
    const actual = getThemeValue(`spacing.${size}`, '');
    if (actual !== expected) {
      issues.push(`Spacing ${size} mismatch: expected ${expected}, got ${actual}`);
      recommendations.push(`Update spacing.${size} to ${expected}`);
    }
  });
  
  return {
    category: 'Spacing Consistency',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validates component standardization
 */
const validateComponentStandardization = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check border radius values
  const requiredBorderRadius = ['sm', 'md', 'lg', 'xl', '2xl', 'full'];
  requiredBorderRadius.forEach(size => {
    const value = getThemeValue(`borderRadius.${size}`, null);
    if (!value) {
      issues.push(`Missing border radius: ${size}`);
      recommendations.push(`Add borderRadius.${size} to theme`);
    }
  });
  
  // Check shadow definitions
  const requiredShadows = ['sm', 'md', 'lg', 'xl'];
  requiredShadows.forEach(size => {
    const value = getThemeValue(`shadows.${size}`, null);
    if (!value) {
      issues.push(`Missing shadow definition: ${size}`);
      recommendations.push(`Add shadows.${size} to theme`);
    }
  });
  
  // Check animation values
  const requiredAnimationDurations = ['fast', 'normal', 'slow'];
  requiredAnimationDurations.forEach(duration => {
    const value = getThemeValue(`animation.duration.${duration}`, null);
    if (!value) {
      issues.push(`Missing animation duration: ${duration}`);
      recommendations.push(`Add animation.duration.${duration} to theme`);
    }
  });
  
  const requiredEasing = ['default', 'in', 'out', 'inOut'];
  requiredEasing.forEach(easing => {
    const value = getThemeValue(`animation.easing.${easing}`, null);
    if (!value) {
      issues.push(`Missing easing function: ${easing}`);
      recommendations.push(`Add animation.easing.${easing} to theme`);
    }
  });
  
  return {
    category: 'Component Standardization',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validates chart configuration consistency
 */
const validateChartConsistency = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check chart colors array
  const chartColors = getThemeValue('charts.colors', []);
  if (!Array.isArray(chartColors) || chartColors.length === 0) {
    issues.push('Missing chart colors array');
    recommendations.push('Add charts.colors array to theme');
  } else {
    // Validate chart colors include theme colors
    const expectedColors = [
      getThemeValue('colors.primary', ''),
      getThemeValue('colors.secondary', ''),
      getThemeValue('colors.accent', '')
    ];
    
    expectedColors.forEach((color, index) => {
      if (color && !chartColors.includes(color)) {
        issues.push(`Chart colors missing theme color: ${color}`);
        recommendations.push(`Include ${color} in charts.colors array`);
      }
    });
  }
  
  // Check chart styling configuration
  const chartConfigs = [
    'charts.line.strokeWidth',
    'charts.line.dotSize',
    'charts.bar.borderRadius',
    'charts.pie.strokeWidth'
  ];
  
  chartConfigs.forEach(config => {
    const value = getThemeValue(config, null);
    if (value === null) {
      issues.push(`Missing chart configuration: ${config}`);
      recommendations.push(`Add ${config} to theme`);
    }
  });
  
  // Check gradient definitions
  const gradients = ['primary', 'secondary', 'accent'];
  gradients.forEach(gradient => {
    const value = getThemeValue(`charts.gradients.${gradient}`, null);
    if (!value) {
      issues.push(`Missing chart gradient: ${gradient}`);
      recommendations.push(`Add charts.gradients.${gradient} to theme`);
    }
  });
  
  return {
    category: 'Chart Consistency',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Validates navigation consistency
 */
const validateNavigationConsistency = (): ValidationResult => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // This would typically check actual component usage
  // For now, we'll validate theme completeness for navigation
  
  // Check that all required colors for navigation are available
  const navigationColors = [
    'colors.status.error',   // For firefighting (red)
    'colors.status.info',    // For water (blue)
    'colors.status.success', // For other modules (green)
    'colors.status.warning', // For warnings (yellow)
    'colors.extended.purple' // For reports/analytics
  ];
  
  navigationColors.forEach(colorPath => {
    const color = getThemeValue(colorPath, null);
    if (!color) {
      issues.push(`Missing navigation color: ${colorPath}`);
      recommendations.push(`Add ${colorPath} for navigation consistency`);
    }
  });
  
  return {
    category: 'Navigation Consistency',
    passed: issues.length === 0,
    issues,
    recommendations
  };
};

/**
 * Runs all validation tests
 */
const runValidation = (): ValidationSummary => {
  console.log('🎨 Starting Visual Consistency Validation...\n');
  
  const validations = [
    validateColorConsistency,
    validateTypographyConsistency,
    validateSpacingConsistency,
    validateComponentStandardization,
    validateChartConsistency,
    validateNavigationConsistency
  ];
  
  const results = validations.map(validation => validation());
  
  const totalTests = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = totalTests - passed;
  const score = Math.round((passed / totalTests) * 100);
  
  return {
    totalTests,
    passed,
    failed,
    score,
    results
  };
};

/**
 * Formats and displays validation results
 */
const displayResults = (summary: ValidationSummary): void => {
  console.log('📊 Validation Results Summary');
  console.log('═'.repeat(50));
  console.log(`Total Tests: ${summary.totalTests}`);
  console.log(`Passed: ${summary.passed} ✅`);
  console.log(`Failed: ${summary.failed} ❌`);
  console.log(`Overall Score: ${summary.score}/100`);
  console.log('═'.repeat(50));
  console.log();
  
  summary.results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.category}`);
    
    if (!result.passed) {
      console.log('   Issues:');
      result.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      
      if (result.recommendations.length > 0) {
        console.log('   Recommendations:');
        result.recommendations.forEach(rec => {
          console.log(`   → ${rec}`);
        });
      }
    }
    console.log();
  });
  
  // Overall assessment
  if (summary.score >= 90) {
    console.log('🎉 Excellent! Visual consistency is well maintained.');
  } else if (summary.score >= 75) {
    console.log('👍 Good visual consistency with minor issues to address.');
  } else if (summary.score >= 60) {
    console.log('⚠️  Moderate consistency issues that should be addressed.');
  } else {
    console.log('🚨 Significant consistency issues requiring immediate attention.');
  }
};

/**
 * Main validation function
 */
export const validateVisualConsistency = (): ValidationSummary => {
  const summary = runValidation();
  displayResults(summary);
  return summary;
};

// Run validation if this script is executed directly
if (require.main === module) {
  validateVisualConsistency();
}

export default validateVisualConsistency;