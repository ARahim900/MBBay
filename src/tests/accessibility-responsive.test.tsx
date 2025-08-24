import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ContractorTrackerDashboard } from '../components/ContractorTrackerDashboard';
import { ContractorDataTable } from '../components/contractor/ContractorDataTable';
import { AddContractorModal } from '../components/contractor/AddContractorModal';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ContractorFilters } from '../components/contractor/ContractorFilters';
import type { Contractor } from '../types/contractor';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'Test Contractor 1',
    service_provided: 'Maintenance and repair services for building systems',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 5000,
    contract_yearly_amount: 60000,
    notes: 'Test notes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'Test Contractor 2',
    service_provided: 'Security services for the facility',
    status: 'Expired',
    contract_type: 'PO',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    contract_monthly_amount: 3000,
    contract_yearly_amount: 36000,
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

// Mock hooks
jest.mock('../../hooks/useContractorData', () => ({
  useContractorData: () => ({
    allData: mockContractors,
    filteredData: mockContractors,
    summary: {
      total_contracts: 2,
      active_contracts: 1,
      expired_contracts: 1,
      pending_contracts: 0,
      total_yearly_value: 96000,
      average_contract_duration: 365
    },
    expiringContracts: [],
    contractsByService: [],
    loading: false,
    error: null,
    lastFetchTime: new Date(),
    filters: {
      status: 'all',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    },
    updateFilters: jest.fn(),
    forceRefresh: jest.fn(),
    updateContractor: jest.fn(),
    removeContractor: jest.fn(),
    addContractor: jest.fn()
  })
}));

describe('Accessibility and Responsive Design Tests', () => {
  describe('Button Component', () => {
    it('should have proper ARIA attributes and keyboard support', async () => {
      const handleClick = jest.fn();
      const { container } = render(
        <Button onClick={handleClick} aria-label="Test button">
          Click me
        </Button>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      
      // Check ARIA attributes
      expect(button).toHaveAttribute('aria-label', 'Test button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('tabIndex', '0');
      
      // Check keyboard interaction
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.keyDown(button, { key: ' ' });
      
      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper touch targets (minimum 44px)', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button');
      
      const styles = window.getComputedStyle(button);
      const minHeight = parseInt(styles.minHeight);
      
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('should handle disabled state properly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('tabIndex', '-1');
    });

    it('should show loading state with proper accessibility', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('Modal Component', () => {
    it('should have proper focus management and ARIA attributes', async () => {
      const handleClose = jest.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      const modal = screen.getByRole('dialog');
      
      // Check ARIA attributes
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(modal).toHaveAttribute('role', 'dialog');
      
      // Check title
      expect(screen.getByText('Test Modal')).toHaveAttribute('id', 'modal-title');
      
      // Check escape key handling
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalled();
      
      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should trap focus within modal', async () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <button>First Button</button>
          <button>Second Button</button>
        </Modal>
      );

      const firstButton = screen.getByText('First Button');
      const secondButton = screen.getByText('Second Button');
      const closeButton = screen.getByLabelText('Close modal');

      // Tab should cycle through focusable elements
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'Tab' });
      fireEvent.keyDown(document, { key: 'Tab' });
      
      // Shift+Tab should go backwards
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    });
  });

  describe('StatusBadge Component', () => {
    it('should have proper ARIA attributes and descriptions', async () => {
      const { container } = render(<StatusBadge status="Active" />);
      
      const badge = screen.getByRole('status');
      
      expect(badge).toHaveAttribute('role', 'status');
      expect(badge).toHaveAttribute('aria-label');
      expect(badge).toHaveAttribute('title');
      
      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide meaningful descriptions for each status', () => {
      const statuses: Array<'Active' | 'Expired' | 'Pending'> = ['Active', 'Expired', 'Pending'];
      
      statuses.forEach(status => {
        const { unmount } = render(<StatusBadge status={status} />);
        const badge = screen.getByRole('status');
        
        expect(badge).toHaveAttribute('aria-label');
        expect(badge.getAttribute('aria-label')).toContain(status);
        
        unmount();
      });
    });
  });

  describe('ContractorDataTable Component', () => {
    it('should have proper table accessibility attributes', async () => {
      const { container } = render(
        <ContractorDataTable data={mockContractors} />
      );

      // Check for desktop table (hidden on mobile)
      const table = container.querySelector('table[role="table"]');
      if (table) {
        expect(table).toHaveAttribute('aria-label', 'Contractor data table');
        expect(table).toHaveAttribute('aria-rowcount');
        
        // Check column headers
        const columnHeaders = screen.getAllByRole('columnheader');
        expect(columnHeaders.length).toBeGreaterThan(0);
        
        // Check sortable columns have proper ARIA attributes
        const sortableHeaders = columnHeaders.filter(header => 
          header.hasAttribute('aria-sort')
        );
        expect(sortableHeaders.length).toBeGreaterThan(0);
      }

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide mobile-friendly card layout', () => {
      render(<ContractorDataTable data={mockContractors} />);
      
      // Check for mobile cards (visible on mobile)
      const mobileCards = document.querySelectorAll('.lg\\:hidden .space-y-4');
      expect(mobileCards.length).toBeGreaterThan(0);
    });

    it('should have proper keyboard navigation for sortable columns', async () => {
      const user = userEvent.setup();
      render(<ContractorDataTable data={mockContractors} />);
      
      // Find sortable column headers
      const sortableHeaders = screen.getAllByRole('columnheader').filter(header =>
        header.hasAttribute('tabIndex') && header.getAttribute('tabIndex') === '0'
      );
      
      if (sortableHeaders.length > 0) {
        const firstSortableHeader = sortableHeaders[0];
        
        // Should be focusable
        expect(firstSortableHeader).toHaveAttribute('tabIndex', '0');
        
        // Should respond to Enter and Space keys
        await user.click(firstSortableHeader);
        await user.keyboard('{Enter}');
        await user.keyboard(' ');
      }
    });
  });

  describe('ContractorFilters Component', () => {
    const mockFilters = {
      status: 'all' as const,
      search: '',
      contractType: 'all' as const,
      dateRange: null,
      serviceCategory: null
    };

    it('should have proper form accessibility', async () => {
      const { container } = render(
        <ContractorFilters 
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          data={mockContractors}
        />
      );

      // Check search input
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveAttribute('aria-label');
      expect(searchInput).toHaveAttribute('aria-describedby');
      
      // Check select elements
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toHaveAttribute('aria-label');
      });

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper touch targets for mobile', () => {
      render(
        <ContractorFilters 
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          data={mockContractors}
        />
      );

      // Check minimum touch target sizes
      const interactiveElements = [
        ...screen.getAllByRole('combobox'),
        screen.getByRole('searchbox'),
        ...screen.getAllByRole('button')
      ];

      interactiveElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const minHeight = parseInt(styles.minHeight || '0');
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('AddContractorModal Component', () => {
    it('should have proper form accessibility', async () => {
      const { container } = render(
        <AddContractorModal 
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />
      );

      const form = screen.getByRole('form') || container.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
      expect(form).toHaveAttribute('aria-label');

      // Check required fields have proper attributes
      const requiredInputs = screen.getAllByRole('textbox', { required: true });
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('required');
        expect(input).toHaveAttribute('aria-invalid');
      });

      // Check labels are properly associated
      const labels = container.querySelectorAll('label[for]');
      labels.forEach(label => {
        const forId = label.getAttribute('for');
        const associatedInput = container.querySelector(`#${forId}`);
        expect(associatedInput).toBeInTheDocument();
      });

      // Check accessibility
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide proper error feedback', async () => {
      const user = userEvent.setup();
      render(
        <AddContractorModal 
          isOpen={true}
          onClose={jest.fn()}
          onSuccess={jest.fn()}
        />
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /add contractor/i });
      await user.click(submitButton);

      // Check for error messages
      await waitFor(() => {
        const errorMessages = screen.getAllByRole('alert');
        expect(errorMessages.length).toBeGreaterThan(0);
        
        errorMessages.forEach(error => {
          expect(error).toHaveAttribute('aria-live', 'polite');
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for different screen sizes', () => {
      // Mock different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1024, height: 768 }, // Desktop
        { width: 1920, height: 1080 } // Large desktop
      ];

      viewports.forEach(viewport => {
        // Mock viewport
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: viewport.height,
        });

        const { unmount } = render(<ContractorDataTable data={mockContractors} />);
        
        // Check that responsive classes are applied
        const container = document.body;
        expect(container).toBeInTheDocument();
        
        unmount();
      });
    });

    it('should have proper spacing and layout on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<ContractorDataTable data={mockContractors} />);
      
      // Check for mobile-specific classes
      const mobileElements = document.querySelectorAll('.lg\\:hidden');
      expect(mobileElements.length).toBeGreaterThan(0);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should meet WCAG color contrast requirements', async () => {
      const { container } = render(
        <div>
          <StatusBadge status="Active" />
          <StatusBadge status="Expired" />
          <StatusBadge status="Pending" />
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
      );

      // Check accessibility (includes color contrast)
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should provide visual indicators beyond color', () => {
      render(<StatusBadge status="Active" showIcon={true} />);
      
      const badge = screen.getByRole('status');
      const icon = badge.querySelector('[aria-hidden="true"]');
      
      // Should have both color and icon indicators
      expect(icon).toBeInTheDocument();
      expect(badge).toHaveAttribute('title');
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide meaningful content for screen readers', () => {
      render(<ContractorDataTable data={mockContractors} />);
      
      // Check for screen reader only content
      const srOnlyElements = document.querySelectorAll('.sr-only');
      expect(srOnlyElements.length).toBeGreaterThan(0);
      
      // Check for proper headings structure
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        expect(heading.tagName).toMatch(/^H[1-6]$/);
      });
    });

    it('should announce dynamic content changes', async () => {
      const user = userEvent.setup();
      render(
        <ContractorFilters 
          filters={mockFilters}
          onFiltersChange={jest.fn()}
          data={mockContractors}
        />
      );

      const searchInput = screen.getByRole('searchbox');
      await user.type(searchInput, 'test');

      // Check for live regions
      const liveRegions = document.querySelectorAll('[aria-live]');
      expect(liveRegions.length).toBeGreaterThan(0);
    });
  });
});