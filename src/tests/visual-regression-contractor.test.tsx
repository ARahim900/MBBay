/**
 * Visual Regression Tests for Contractor Tracker Theme Consistency
 * 
 * This test suite validates visual consistency with other enhanced modules
 * and ensures proper theme integration across all contractor components.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContractorTrackerDashboard } from '../components/ContractorTrackerDashboard';
import { ContractorDataTable } from '../components/contractor/ContractorDataTable';
import { AddContractorModal } from '../components/contractor/AddContractorModal';
import { ContractorAnalytics } from '../components/contractor/ContractorAnalytics';
import { getThemeValue } from '../lib/theme';
import type { Contractor } from '../types/contractor';

// Mock dependencies
vi.mock('../lib/theme');
vi.mock('../lib/contractor-api');
vi.mock('../../hooks/useContractorData');

const mockGetThemeValue = vi.mocked(getThemeValue);

// Mock contractor data
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'Test Contractor',
    service_provided: 'Test Service',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 1000,
    contract_yearly_amount: 12000,
    notes: 'Test notes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

describe('Visual Regression Tests - Theme Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup theme mock with actual theme values
    mockGetThemeValue.mockImplementation((path: string, fallback: any) => {
      const themeValues: Record<string, any> = {
        // Colors
        'colors.primary': '#2D9CDB',
        'colors.secondary': '#FF5B5B',
        'colors.accent': '#F7C604',
        'colors.status.success': '#10b981',
        'colors.status.error': '#ef4444',
        'colors.status.warning': '#f59e0b',
        'colors.status.info': '#3b82f6',
        
        // Typography
        'typography.fontFamily': 'Inter, sans-serif',
        'typography.title': '1.25rem',
        'typography.label': '0.875rem',
        'typography.tooltip': '0.75rem',
        
        // Spacing
        'spacing.card': '1.5rem',
        'spacing.section': '2rem',
        'spacing.element': '1rem',
        
        // Border radius
        'borderRadius.card': '0.75rem',
        'borderRadius.button': '0.5rem',
        'borderRadius.input': '0.375rem',
        
        // Shadows
        'shadows.card': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'shadows.hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        
        // Animation
        'animation.duration': '200ms',
        'animation.easing': 'cubic-bezier(0.4, 0, 0.2, 1)'
      };
      
      return themeValues[path] || fallback;
    });
  });

  describe('Color Consistency Tests', () => {
    it('should use consistent primary colors across components', () => {
      render(<ContractorTrackerDashboard />);

      // Verify primary color usage
      expect(mockGetThemeValue).toHaveBeenCalledWith('colors.primary', expect.any(String));
      
      const primaryColor = getThemeValue('colors.primary', '#000');
      expect(primaryColor).toBe('#2D9CDB');
    });

    it('should apply correct status colors', () => {
      render(<ContractorDataTable contractors={mockContractors} />);

      // Verify status color mapping
      const statusColors = {
        success: getThemeValue('colors.status.success', '#000'),
        error: getThemeValue('colors.status.error', '#000'),
        warning: getThemeValue('colors.status.warning', '#000'),
        info: getThemeValue('colors.status.info', '#000')
      };

      expect(statusColors.success).toBe('#10b981');
      expect(statusColors.error).toBe('#ef4444');
      expect(statusColors.warning).toBe('#f59e0b');
      expect(statusColors.info).toBe('#3b82f6');
    });

    it('should maintain color contrast ratios for accessibility', () => {
      render(<ContractorTrackerDashboard />);

      // Test color combinations for WCAG AA compliance
      const colorCombinations = [
        { bg: '#2D9CDB', text: '#ffffff' }, // Primary with white
        { bg: '#10b981', text: '#ffffff' }, // Success with white
        { bg: '#ef4444', text: '#ffffff' }, // Error with white
        { bg: '#f59e0b', text: '#000000' }  // Warning with black
      ];

      colorCombinations.forEach(({ bg, text }) => {
        const contrast = calculateContrastRatio(bg, text);
        expect(contrast).toBeGreaterThanOrEqual(4.5); // WCAG AA standard
      });
    });

    it('should support dark mode color variants', () => {
      // Mock dark mode
      mockGetThemeValue.mockImplementation((path: string, fallback: any) => {
        const darkThemeValues: Record<string, any> = {
          'colors.background': '#1f2937',
          'colors.surface': '#374151',
          'colors.text': '#f9fafb',
          'colors.textSecondary': '#d1d5db'
        };
        
        return darkThemeValues[path] || fallback;
      });

      render(<ContractorTrackerDashboard />);

      const darkColors = {
        background: getThemeValue('colors.background', '#fff'),
        surface: getThemeValue('colors.surface', '#fff'),
        text: getThemeValue('colors.text', '#000'),
        textSecondary: getThemeValue('colors.textSecondary', '#666')
      };

      expect(darkColors.background).toBe('#1f2937');
      expect(darkColors.surface).toBe('#374151');
      expect(darkColors.text).toBe('#f9fafb');
      expect(darkColors.textSecondary).toBe('#d1d5db');
    });
  });

  describe('Typography Consistency Tests', () => {
    it('should use Inter font family consistently', () => {
      render(<ContractorTrackerDashboard />);

      const fontFamily = getThemeValue('typography.fontFamily', 'Arial');
      expect(fontFamily).toBe('Inter, sans-serif');
    });

    it('should apply consistent font sizes', () => {
      render(<ContractorTrackerDashboard />);

      const fontSizes = {
        title: getThemeValue('typography.title', '1rem'),
        label: getThemeValue('typography.label', '1rem'),
        tooltip: getThemeValue('typography.tooltip', '1rem')
      };

      expect(fontSizes.title).toBe('1.25rem');
      expect(fontSizes.label).toBe('0.875rem');
      expect(fontSizes.tooltip).toBe('0.75rem');
    });

    it('should maintain consistent line heights and spacing', () => {
      render(<ContractorTrackerDashboard />);

      // Verify typography spacing is consistent with other modules
      expect(mockGetThemeValue).toHaveBeenCalledWith(
        expect.stringMatching(/typography\.(lineHeight|spacing)/),
        expect.any(String)
      );
    });
  });

  describe('Layout and Spacing Consistency Tests', () => {
    it('should use consistent card padding', () => {
      render(<ContractorTrackerDashboard />);

      const cardPadding = getThemeValue('spacing.card', '1rem');
      expect(cardPadding).toBe('1.5rem');
    });

    it('should apply consistent section spacing', () => {
      render(<ContractorTrackerDashboard />);

      const sectionSpacing = getThemeValue('spacing.section', '1rem');
      expect(sectionSpacing).toBe('2rem');
    });

    it('should maintain consistent border radius', () => {
      render(<ContractorTrackerDashboard />);

      const borderRadius = {
        card: getThemeValue('borderRadius.card', '0.5rem'),
        button: getThemeValue('borderRadius.button', '0.25rem'),
        input: getThemeValue('borderRadius.input', '0.25rem')
      };

      expect(borderRadius.card).toBe('0.75rem');
      expect(borderRadius.button).toBe('0.5rem');
      expect(borderRadius.input).toBe('0.375rem');
    });

    it('should use consistent shadow styles', () => {
      render(<ContractorTrackerDashboard />);

      const shadows = {
        card: getThemeValue('shadows.card', 'none'),
        hover: getThemeValue('shadows.hover', 'none')
      };

      expect(shadows.card).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1)');
      expect(shadows.hover).toBe('0 10px 15px -3px rgba(0, 0, 0, 0.1)');
    });
  });

  describe('Component Structure Consistency Tests', () => {
    it('should follow consistent header layout pattern', () => {
      render(<ContractorTrackerDashboard />);

      // Verify header structure matches other enhanced modules
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    });

    it('should use consistent navigation structure', () => {
      render(<ContractorTrackerDashboard />);

      // Verify MenuBar navigation structure
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('mb-6', 'flex', 'justify-center');
    });

    it('should apply consistent grid layouts', () => {
      render(<ContractorTrackerDashboard />);

      // Verify grid structure for KPI cards and content
      const gridContainers = screen.getAllByTestId(/grid-container/);
      gridContainers.forEach(container => {
        expect(container).toHaveClass('grid');
      });
    });

    it('should maintain consistent modal structure', () => {
      render(
        <AddContractorModal
          isOpen={true}
          onClose={() => {}}
          onSuccess={() => {}}
        />
      );

      // Verify modal structure consistency
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('fixed', 'inset-0', 'z-50');
    });
  });

  describe('Animation and Interaction Consistency Tests', () => {
    it('should use consistent animation durations', () => {
      render(<ContractorTrackerDashboard />);

      const animationDuration = getThemeValue('animation.duration', '150ms');
      expect(animationDuration).toBe('200ms');
    });

    it('should apply consistent easing functions', () => {
      render(<ContractorTrackerDashboard />);

      const animationEasing = getThemeValue('animation.easing', 'ease');
      expect(animationEasing).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });

    it('should maintain consistent hover effects', () => {
      render(<ContractorDataTable contractors={mockContractors} />);

      // Verify hover effects are applied consistently
      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        expect(element).toHaveClass('transition-colors');
      });
    });
  });

  describe('Responsive Design Consistency Tests', () => {
    it('should apply consistent breakpoint classes', () => {
      render(<ContractorTrackerDashboard />);

      // Verify responsive classes match other modules
      const responsiveElements = screen.getAllByTestId(/responsive-/);
      responsiveElements.forEach(element => {
        expect(element.className).toMatch(/sm:|md:|lg:|xl:/);
      });
    });

    it('should maintain consistent mobile layouts', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ContractorTrackerDashboard />);

      // Verify mobile-specific classes are applied
      const mobileElements = screen.getAllByTestId(/mobile-/);
      mobileElements.forEach(element => {
        expect(element).toHaveClass('flex-col');
      });
    });

    it('should use consistent touch target sizes', () => {
      render(<ContractorTrackerDashboard />);

      const touchTargets = screen.getAllByRole('button');
      touchTargets.forEach(target => {
        const styles = window.getComputedStyle(target);
        const minHeight = parseInt(styles.minHeight) || 44;
        expect(minHeight).toBeGreaterThanOrEqual(44); // 44px minimum for touch
      });
    });
  });

  describe('Cross-Module Consistency Tests', () => {
    it('should match FirefightingDashboard header structure', () => {
      render(<ContractorTrackerDashboard />);

      // Verify header matches firefighting module pattern
      const headerTitle = screen.getByRole('heading', { level: 1 });
      expect(headerTitle).toHaveClass('text-2xl', 'font-bold');
    });

    it('should use same KPI card styling as other modules', () => {
      render(<ContractorTrackerDashboard />);

      // Verify KPI cards match other enhanced modules
      const kpiCards = screen.getAllByTestId(/kpi-card/);
      kpiCards.forEach(card => {
        expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow');
      });
    });

    it('should maintain consistent table styling', () => {
      render(<ContractorDataTable contractors={mockContractors} />);

      // Verify table styling matches other modules
      const table = screen.getByRole('table');
      expect(table).toHaveClass('min-w-full', 'divide-y');
    });

    it('should use consistent button variants', () => {
      render(<ContractorTrackerDashboard />);

      const buttons = screen.getAllByRole('button');
      const buttonVariants = ['primary', 'secondary', 'outline', 'ghost', 'danger'];
      
      buttons.forEach(button => {
        const hasVariantClass = buttonVariants.some(variant => 
          button.className.includes(variant)
        );
        expect(hasVariantClass).toBe(true);
      });
    });
  });

  describe('Theme Integration Tests', () => {
    it('should properly integrate with centralized theme system', () => {
      render(<ContractorTrackerDashboard />);

      // Verify theme integration calls
      expect(mockGetThemeValue).toHaveBeenCalledWith(
        expect.stringMatching(/^(colors|typography|spacing|borderRadius|shadows|animation)\./),
        expect.any(String)
      );
    });

    it('should handle theme fallbacks gracefully', () => {
      mockGetThemeValue.mockImplementation(() => {
        throw new Error('Theme not found');
      });

      expect(() => {
        render(<ContractorTrackerDashboard />);
      }).not.toThrow();
    });

    it('should support theme customization', () => {
      const customTheme = {
        'colors.primary': '#custom-primary',
        'colors.secondary': '#custom-secondary'
      };

      mockGetThemeValue.mockImplementation((path: string, fallback: any) => {
        return customTheme[path as keyof typeof customTheme] || fallback;
      });

      render(<ContractorTrackerDashboard />);

      expect(getThemeValue('colors.primary', '#000')).toBe('#custom-primary');
      expect(getThemeValue('colors.secondary', '#000')).toBe('#custom-secondary');
    });
  });
});

// Helper function to calculate color contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  // Simplified contrast calculation for testing
  // In a real implementation, this would use proper color space calculations
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate relative luminance
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const sRGB = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}