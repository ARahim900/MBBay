/**
 * Visual Consistency Checker Utility
 * 
 * This utility provides functions to validate visual consistency between
 * the firefighting dashboard and other enhanced modules.
 */

import { theme, getThemeValue } from '../lib/theme';

export interface ComponentStyleAnalysis {
  component: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    fontFamily: string;
    titleSize: string;
    labelSize: string;
    tooltipSize: string;
  };
  spacing: {
    cardPadding: string;
    sectionGap: string;
    gridGap: string;
  };
  components: {
    usesKpiCard: boolean;
    usesStandardCard: boolean;
    usesStandardButton: boolean;
    usesMenuBar: boolean;
  };
}

export interface ConsistencyReport {
  isConsistent: boolean;
  issues: string[];
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Analyzes the visual consistency of a component against the design system
 */
export const analyzeComponentConsistency = (
  componentName: string,
  element: HTMLElement
): ComponentStyleAnalysis => {
  const computedStyle = window.getComputedStyle(element);
  
  return {
    component: componentName,
    colors: {
      primary: getThemeValue('colors.primary', '#2D9CDB'),
      secondary: getThemeValue('colors.secondary', '#FF5B5B'),
      accent: getThemeValue('colors.accent', '#F7C604'),
      status: {
        success: getThemeValue('colors.status.success', '#10b981'),
        warning: getThemeValue('colors.status.warning', '#f59e0b'),
        error: getThemeValue('colors.status.error', '#ef4444'),
        info: getThemeValue('colors.status.info', '#3b82f6'),
      }
    },
    typography: {
      fontFamily: computedStyle.fontFamily || getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
      titleSize: getThemeValue('typography.fontSize.2xl', '1.5rem'),
      labelSize: getThemeValue('typography.labelSize', '0.875rem'),
      tooltipSize: getThemeValue('typography.tooltipSize', '0.75rem'),
    },
    spacing: {
      cardPadding: getThemeValue('spacing.lg', '1.5rem'),
      sectionGap: getThemeValue('spacing.xl', '2rem'),
      gridGap: getThemeValue('spacing.md', '1rem'),
    },
    components: {
      usesKpiCard: element.querySelector('[data-component="KpiCard"]') !== null,
      usesStandardCard: element.querySelector('[data-component="Card"]') !== null,
      usesStandardButton: element.querySelector('[data-component="Button"]') !== null,
      usesMenuBar: element.querySelector('[data-component="MenuBar"]') !== null,
    }
  };
};

/**
 * Compares two component analyses for consistency
 */
export const compareComponentConsistency = (
  baseline: ComponentStyleAnalysis,
  target: ComponentStyleAnalysis
): ConsistencyReport => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check color consistency
  if (baseline.colors.primary !== target.colors.primary) {
    issues.push(`Primary color mismatch: ${baseline.colors.primary} vs ${target.colors.primary}`);
    recommendations.push('Use theme.colors.primary for consistent primary color');
    score -= 10;
  }

  if (baseline.colors.secondary !== target.colors.secondary) {
    issues.push(`Secondary color mismatch: ${baseline.colors.secondary} vs ${target.colors.secondary}`);
    recommendations.push('Use theme.colors.secondary for consistent secondary color');
    score -= 10;
  }

  // Check typography consistency
  if (baseline.typography.fontFamily !== target.typography.fontFamily) {
    issues.push(`Font family mismatch: ${baseline.typography.fontFamily} vs ${target.typography.fontFamily}`);
    recommendations.push('Use theme.typography.fontFamily (Inter) for consistent typography');
    score -= 15;
  }

  if (baseline.typography.titleSize !== target.typography.titleSize) {
    issues.push(`Title size mismatch: ${baseline.typography.titleSize} vs ${target.typography.titleSize}`);
    recommendations.push('Use theme.typography.fontSize.2xl for main titles');
    score -= 5;
  }

  // Check component usage consistency
  if (baseline.components.usesKpiCard !== target.components.usesKpiCard) {
    issues.push('Inconsistent KpiCard usage between components');
    recommendations.push('Use KpiCard component for metric displays');
    score -= 10;
  }

  if (baseline.components.usesStandardCard !== target.components.usesStandardCard) {
    issues.push('Inconsistent Card component usage');
    recommendations.push('Use standard Card component for containers');
    score -= 10;
  }

  if (baseline.components.usesMenuBar !== target.components.usesMenuBar) {
    issues.push('Inconsistent MenuBar usage');
    recommendations.push('Use MenuBar component for navigation');
    score -= 10;
  }

  return {
    isConsistent: issues.length === 0,
    issues,
    recommendations,
    score: Math.max(0, score)
  };
};

/**
 * Validates color palette usage across components
 */
export const validateColorPalette = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  const computedStyle = window.getComputedStyle(element);
  
  // Check for hardcoded colors that should use theme
  const hardcodedColors = [
    '#2D9CDB', '#FF5B5B', '#F7C604', // Theme colors
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', // Status colors
    '#8b5cf6', '#14b8a6', '#f97316', '#22c55e' // Extended colors
  ];

  // This is a simplified check - in a real implementation,
  // you'd need to traverse all child elements and check their styles
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    // Check if colors are using CSS custom properties (theme integration)
    if (color && !color.includes('var(') && hardcodedColors.some(hc => color.includes(hc))) {
      issues.push(`Element uses hardcoded color instead of theme: ${color}`);
    }
    
    if (backgroundColor && !backgroundColor.includes('var(') && hardcodedColors.some(hc => backgroundColor.includes(hc))) {
      issues.push(`Element uses hardcoded background color instead of theme: ${backgroundColor}`);
    }
  });

  return issues;
};

/**
 * Validates typography consistency across components
 */
export const validateTypography = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // Check for consistent font family usage
  const allTextElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, button, label');
  const expectedFontFamily = theme.typography.fontFamily;
  
  allTextElements.forEach((el, index) => {
    const style = window.getComputedStyle(el);
    const fontFamily = style.fontFamily;
    
    if (fontFamily && !fontFamily.includes('Inter') && !fontFamily.includes('sans-serif')) {
      issues.push(`Element ${el.tagName.toLowerCase()}[${index}] uses non-standard font: ${fontFamily}`);
    }
  });

  return issues;
};

/**
 * Validates spacing consistency using theme values
 */
export const validateSpacing = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // Check for consistent spacing patterns
  const spacingElements = element.querySelectorAll('[class*="gap-"], [class*="p-"], [class*="m-"]');
  
  spacingElements.forEach((el) => {
    const classList = Array.from(el.classList);
    const spacingClasses = classList.filter(cls => 
      cls.includes('gap-') || cls.includes('p-') || cls.includes('m-')
    );
    
    spacingClasses.forEach(cls => {
      // Check if using standard spacing scale (1, 2, 3, 4, 6, 8, 12, 16, 20, 24)
      const spacingValue = cls.split('-')[1];
      const standardSpacing = ['1', '2', '3', '4', '6', '8', '12', '16', '20', '24'];
      
      if (spacingValue && !standardSpacing.includes(spacingValue)) {
        issues.push(`Non-standard spacing value used: ${cls}`);
      }
    });
  });

  return issues;
};

/**
 * Validates hover effects and animations consistency
 */
export const validateInteractions = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  
  // Check for consistent hover effects
  const interactiveElements = element.querySelectorAll('button, [role="button"], a, .hover\\:');
  
  interactiveElements.forEach((el) => {
    const classList = Array.from(el.classList);
    const hasHoverEffect = classList.some(cls => cls.includes('hover:'));
    const hasTransition = classList.some(cls => cls.includes('transition'));
    
    if (hasHoverEffect && !hasTransition) {
      issues.push('Interactive element has hover effect but no transition');
    }
  });

  return issues;
};

/**
 * Generates a comprehensive consistency report
 */
export const generateConsistencyReport = (
  firefightingElement: HTMLElement,
  waterModuleElement: HTMLElement
): ConsistencyReport => {
  const firefightingAnalysis = analyzeComponentConsistency('FirefightingDashboard', firefightingElement);
  const waterModuleAnalysis = analyzeComponentConsistency('EnhancedWaterModule', waterModuleElement);
  
  const comparison = compareComponentConsistency(waterModuleAnalysis, firefightingAnalysis);
  
  // Add additional validation checks
  const colorIssues = validateColorPalette(firefightingElement);
  const typographyIssues = validateTypography(firefightingElement);
  const spacingIssues = validateSpacing(firefightingElement);
  const interactionIssues = validateInteractions(firefightingElement);
  
  const allIssues = [
    ...comparison.issues,
    ...colorIssues,
    ...typographyIssues,
    ...spacingIssues,
    ...interactionIssues
  ];
  
  const allRecommendations = [
    ...comparison.recommendations,
    'Ensure all colors use theme configuration',
    'Maintain consistent typography hierarchy',
    'Use standard spacing scale',
    'Apply consistent hover effects and transitions'
  ];
  
  // Calculate overall score
  const issueCount = allIssues.length;
  const maxIssues = 20; // Arbitrary max for scoring
  const score = Math.max(0, 100 - (issueCount / maxIssues) * 100);
  
  return {
    isConsistent: allIssues.length === 0,
    issues: allIssues,
    recommendations: allRecommendations,
    score: Math.round(score)
  };
};

/**
 * Utility to log consistency report in a readable format
 */
export const logConsistencyReport = (report: ConsistencyReport): void => {
  console.group('🎨 Visual Consistency Report');
  console.log(`Overall Score: ${report.score}/100`);
  console.log(`Status: ${report.isConsistent ? '✅ Consistent' : '⚠️ Issues Found'}`);
  
  if (report.issues.length > 0) {
    console.group('❌ Issues Found:');
    report.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

export default {
  analyzeComponentConsistency,
  compareComponentConsistency,
  validateColorPalette,
  validateTypography,
  validateSpacing,
  validateInteractions,
  generateConsistencyReport,
  logConsistencyReport
};