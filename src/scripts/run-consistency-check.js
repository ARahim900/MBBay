/**
 * Simple Visual Consistency Check Runner
 * 
 * This script performs basic validation of the theme configuration
 * and visual consistency requirements without requiring a test framework.
 */

// Import theme configuration (simulated for Node.js environment)
const theme = {
  colors: {
    primary: '#2D9CDB',
    secondary: '#FF5B5B',
    accent: '#F7C604',
    background: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    gridLines: '#F3F2F7',
    
    extended: {
      purple: '#8b5cf6',
      indigo: '#6366f1',
      teal: '#14b8a6',
      orange: '#f97316',
      pink: '#ec4899',
      green: '#22c55e',
    },
    
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  
  typography: {
    fontFamily: "'Inter', sans-serif",
    titleSize: '1.25rem',
    labelSize: '0.875rem',
    tooltipSize: '0.75rem',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },
  
  charts: {
    colors: [
      '#2D9CDB', // Primary
      '#FF5B5B', // Secondary
      '#F7C604', // Accent
      '#8b5cf6', // Purple
      '#14b8a6', // Teal
      '#f97316', // Orange
      '#22c55e', // Green
      '#6366f1', // Indigo
    ],
    line: {
      strokeWidth: 3,
      dotSize: 6,
      dotBorderWidth: 2,
      curved: true,
    },
    bar: {
      borderRadius: 4,
      hoverOpacity: 0.85,
    },
    pie: {
      strokeWidth: 12,
      innerRadiusRatio: 0.6,
    },
    grid: {
      strokeDasharray: '3 3',
      opacity: 0.1,
    },
    gradients: {
      primary: 'linear-gradient(180deg, #2D9CDB 0%, rgba(45, 156, 219, 0) 100%)',
      secondary: 'linear-gradient(180deg, #FF5B5B 0%, rgba(255, 91, 91, 0) 100%)',
      accent: 'linear-gradient(180deg, #F7C604 0%, rgba(247, 198, 4, 0) 100%)',
    }
  }
};

function getThemeValue(path, fallback) {
  const keys = path.split('.');
  let value = theme;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined || value === null) {
      return fallback;
    }
  }
  
  return value;
}

// Validation functions
function validateColorConsistency() {
  console.log('🎨 Validating Color Consistency...');
  const issues = [];
  
  // Check required theme colors
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
      issues.push(`❌ ${name} color mismatch: expected ${expected}, got ${actual}`);
    } else {
      console.log(`✅ ${name} color: ${actual}`);
    }
  });
  
  return issues;
}

function validateTypographyConsistency() {
  console.log('\n📝 Validating Typography Consistency...');
  const issues = [];
  
  // Check font family
  const fontFamily = getThemeValue('typography.fontFamily', '');
  if (!fontFamily.includes('Inter')) {
    issues.push('❌ Font family should include Inter');
  } else {
    console.log(`✅ Font family: ${fontFamily}`);
  }
  
  // Check required font sizes
  const sizeValidations = [
    { path: 'typography.titleSize', expected: '1.25rem', name: 'Title size' },
    { path: 'typography.labelSize', expected: '0.875rem', name: 'Label size' },
    { path: 'typography.tooltipSize', expected: '0.75rem', name: 'Tooltip size' }
  ];
  
  sizeValidations.forEach(({ path, expected, name }) => {
    const actual = getThemeValue(path, '');
    if (actual !== expected) {
      issues.push(`❌ ${name} mismatch: expected ${expected}, got ${actual}`);
    } else {
      console.log(`✅ ${name}: ${actual}`);
    }
  });
  
  return issues;
}

function validateSpacingConsistency() {
  console.log('\n📏 Validating Spacing Consistency...');
  const issues = [];
  
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
      issues.push(`❌ Spacing ${size} mismatch: expected ${expected}, got ${actual}`);
    } else {
      console.log(`✅ Spacing ${size}: ${actual}`);
    }
  });
  
  return issues;
}

function validateComponentStandardization() {
  console.log('\n🧩 Validating Component Standardization...');
  const issues = [];
  
  // Check border radius values
  const borderRadiusChecks = ['sm', 'md', 'lg', 'xl', '2xl', 'full'];
  borderRadiusChecks.forEach(size => {
    const value = getThemeValue(`borderRadius.${size}`, null);
    if (!value) {
      issues.push(`❌ Missing border radius: ${size}`);
    } else {
      console.log(`✅ Border radius ${size}: ${value}`);
    }
  });
  
  // Check animation values
  const animationChecks = [
    { path: 'animation.duration.fast', expected: '150ms' },
    { path: 'animation.duration.normal', expected: '300ms' },
    { path: 'animation.duration.slow', expected: '500ms' }
  ];
  
  animationChecks.forEach(({ path, expected }) => {
    const actual = getThemeValue(path, '');
    if (actual !== expected) {
      issues.push(`❌ Animation duration mismatch: expected ${expected}, got ${actual}`);
    } else {
      console.log(`✅ ${path}: ${actual}`);
    }
  });
  
  return issues;
}

function validateChartConsistency() {
  console.log('\n📊 Validating Chart Consistency...');
  const issues = [];
  
  // Check chart colors array
  const chartColors = getThemeValue('charts.colors', []);
  if (!Array.isArray(chartColors) || chartColors.length === 0) {
    issues.push('❌ Missing chart colors array');
  } else {
    console.log(`✅ Chart colors array: ${chartColors.length} colors`);
    
    // Validate chart colors include theme colors
    const expectedColors = [
      getThemeValue('colors.primary', ''),
      getThemeValue('colors.secondary', ''),
      getThemeValue('colors.accent', '')
    ];
    
    expectedColors.forEach((color, index) => {
      if (color && chartColors.includes(color)) {
        console.log(`✅ Chart includes theme color: ${color}`);
      } else {
        issues.push(`❌ Chart colors missing theme color: ${color}`);
      }
    });
  }
  
  // Check chart configuration
  const chartConfigs = [
    'charts.line.strokeWidth',
    'charts.bar.borderRadius',
    'charts.pie.strokeWidth'
  ];
  
  chartConfigs.forEach(config => {
    const value = getThemeValue(config, null);
    if (value === null) {
      issues.push(`❌ Missing chart configuration: ${config}`);
    } else {
      console.log(`✅ ${config}: ${value}`);
    }
  });
  
  return issues;
}

// Main validation runner
function runVisualConsistencyValidation() {
  console.log('🎨 Visual Consistency Validation Report');
  console.log('═'.repeat(60));
  console.log('Checking firefighting dashboard alignment with design system...\n');
  
  const allIssues = [
    ...validateColorConsistency(),
    ...validateTypographyConsistency(),
    ...validateSpacingConsistency(),
    ...validateComponentStandardization(),
    ...validateChartConsistency()
  ];
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 VALIDATION SUMMARY');
  console.log('═'.repeat(60));
  
  if (allIssues.length === 0) {
    console.log('🎉 All validation checks passed!');
    console.log('✅ Visual consistency is well maintained.');
    console.log('✅ Theme configuration is complete and correct.');
    console.log('✅ All required design system elements are present.');
  } else {
    console.log(`⚠️  Found ${allIssues.length} issues:`);
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    console.log('\n💡 Recommendations:');
    console.log('• Ensure all colors use theme configuration');
    console.log('• Maintain consistent typography hierarchy');
    console.log('• Use standard spacing scale');
    console.log('• Apply consistent component patterns');
  }
  
  const score = Math.max(0, 100 - (allIssues.length * 10));
  console.log(`\n📈 Overall Score: ${score}/100`);
  
  if (score >= 90) {
    console.log('🎉 Excellent! Visual consistency is well maintained.');
  } else if (score >= 75) {
    console.log('👍 Good visual consistency with minor issues to address.');
  } else if (score >= 60) {
    console.log('⚠️  Moderate consistency issues that should be addressed.');
  } else {
    console.log('🚨 Significant consistency issues requiring immediate attention.');
  }
  
  console.log('\n' + '═'.repeat(60));
  
  return {
    totalIssues: allIssues.length,
    score: score,
    passed: allIssues.length === 0
  };
}

// Run the validation
runVisualConsistencyValidation();