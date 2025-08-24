/**
 * Comprehensive Form Validation Tests
 * 
 * Tests for the contractor form validation system including
 * real-time validation, business rules, and error handling.
 * 
 * Requirements: 6.4, 10.4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddContractorModal } from '../components/contractor/AddContractorModal';
import { EditContractorModal } from '../components/contractor/EditContractorModal';
import {
  validateField,
  validateForm,
  validateBusinessRules,
  sanitizeFormData,
  autoCalculateYearlyAmount,
  contractorValidationSchema
} from '../utils/contractor-validation';
import { useFormValidation } from '../hooks/useFormValidation';
import type { Contractor } from '../types/contractor';

// Mock dependencies
vi.mock('../lib/contractor-api', () => ({
  ContractorAPI: {
    createContractor: vi.fn(),
    updateContractor: vi.fn()
  }
}));

vi.mock('../utils/contractor-error-handler', () => ({
  ContractorErrorHandler: {
    handleAPIError: vi.fn(() => 'Test error message')
  }
}));

describe('Contractor Form Validation', () => {
  describe('Field Validation', () => {
    it('should validate contractor name correctly', () => {
      // Required field
      expect(validateField('contractor_name', '', {})).toMatchObject({
        field: 'contractor_name',
        message: expect.stringContaining('required')
      });

      // Too short
      expect(validateField('contractor_name', 'A', {})).toMatchObject({
        field: 'contractor_name',
        message: expect.stringContaining('at least 2 characters')
      });

      // Too long
      const longName = 'A'.repeat(256);
      expect(validateField('contractor_name', longName, {})).toMatchObject({
        field: 'contractor_name',
        message: expect.stringContaining('less than 255 characters')
      });

      // Invalid characters
      expect(validateField('contractor_name', 'Test@#$%', {})).toMatchObject({
        field: 'contractor_name',
        message: expect.stringContaining('invalid characters')
      });

      // Valid name
      expect(validateField('contractor_name', 'ABC Construction Ltd.', {})).toBeNull();
    });

    it('should validate service description correctly', () => {
      // Required field
      expect(validateField('service_provided', '', {})).toMatchObject({
        field: 'service_provided',
        message: expect.stringContaining('required')
      });

      // Too short
      expect(validateField('service_provided', 'Short', {})).toMatchObject({
        field: 'service_provided',
        message: expect.stringContaining('at least 10 characters')
      });

      // Too long
      const longDescription = 'A'.repeat(1001);
      expect(validateField('service_provided', longDescription, {})).toMatchObject({
        field: 'service_provided',
        message: expect.stringContaining('less than 1000 characters')
      });

      // Valid description
      expect(validateField('service_provided', 'Electrical maintenance and repair services', {})).toBeNull();
    });

    it('should validate dates correctly', () => {
      // Required start date
      expect(validateField('start_date', '', {})).toMatchObject({
        field: 'start_date',
        message: expect.stringContaining('required')
      });

      // Invalid date format
      expect(validateField('start_date', 'invalid-date', {})).toMatchObject({
        field: 'start_date',
        message: expect.stringContaining('valid date')
      });

      // Date too far in the past (more than 10 years)
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 11);
      expect(validateField('start_date', oldDate.toISOString().split('T')[0], {})).toMatchObject({
        field: 'start_date',
        message: expect.stringContaining('10 years in the past')
      });

      // Valid start date
      const validDate = new Date().toISOString().split('T')[0];
      expect(validateField('start_date', validDate, {})).toBeNull();
    });

    it('should validate end date with business rules', () => {
      const startDate = '2024-01-01';
      const formData = { start_date: startDate };

      // End date before start date
      expect(validateField('end_date', '2023-12-31', formData)).toMatchObject({
        field: 'end_date',
        message: expect.stringContaining('after start date')
      });

      // Contract duration too long (more than 20 years)
      const longEndDate = '2045-01-01';
      expect(validateField('end_date', longEndDate, formData)).toMatchObject({
        field: 'end_date',
        message: expect.stringContaining('20 years')
      });

      // Contract duration too short (same day)
      expect(validateField('end_date', startDate, formData)).toMatchObject({
        field: 'end_date',
        message: expect.stringContaining('at least 1 day')
      });

      // Valid end date
      expect(validateField('end_date', '2024-12-31', formData)).toBeNull();
    });

    it('should validate monetary amounts correctly', () => {
      // Negative amount
      expect(validateField('contract_monthly_amount', '-100', {})).toMatchObject({
        field: 'contract_monthly_amount',
        message: expect.stringContaining('cannot be negative')
      });

      // Too large amount
      expect(validateField('contract_monthly_amount', '20000000', {})).toMatchObject({
        field: 'contract_monthly_amount',
        message: expect.stringContaining('10,000,000 OMR')
      });

      // Too many decimal places
      expect(validateField('contract_monthly_amount', '100.123', {})).toMatchObject({
        field: 'contract_monthly_amount',
        message: expect.stringContaining('2 decimal places')
      });

      // Valid amount
      expect(validateField('contract_monthly_amount', '1500.50', {})).toBeNull();

      // Empty amount (optional field)
      expect(validateField('contract_monthly_amount', '', {})).toBeNull();
    });

    it('should validate yearly amount consistency with monthly amount', () => {
      const formData = { contract_monthly_amount: '1000' };

      // Yearly amount not matching monthly * 12
      expect(validateField('contract_yearly_amount', '10000', formData)).toMatchObject({
        field: 'contract_yearly_amount',
        message: expect.stringContaining('12x monthly amount')
      });

      // Correct yearly amount
      expect(validateField('contract_yearly_amount', '12000', formData)).toBeNull();
    });
  });

  describe('Business Rules Validation', () => {
    it('should validate PO contract duration', () => {
      const formData = {
        contract_type: 'PO',
        start_date: '2024-01-01',
        end_date: '2025-06-01' // More than 1 year
      };

      const errors = validateBusinessRules(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Purchase Orders');
      expect(errors[0].message).toContain('1 year');
    });

    it('should validate active contract end date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const formData = {
        status: 'Active',
        end_date: yesterday.toISOString().split('T')[0]
      };

      const errors = validateBusinessRules(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Active contracts');
      expect(errors[0].message).toContain('future');
    });

    it('should validate expired contract end date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const formData = {
        status: 'Expired',
        end_date: tomorrow.toISOString().split('T')[0]
      };

      const errors = validateBusinessRules(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Expired contracts');
      expect(errors[0].message).toContain('past');
    });

    it('should validate monthly/yearly amount consistency', () => {
      const formData = {
        contract_monthly_amount: '1000',
        contract_yearly_amount: '' // Missing yearly amount
      };

      const errors = validateBusinessRules(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Yearly amount should be provided');
    });
  });

  describe('Form Validation', () => {
    it('should validate complete form data', () => {
      const validFormData = {
        contractor_name: 'ABC Construction',
        service_provided: 'Electrical maintenance and repair services',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: '1500',
        contract_yearly_amount: '18000',
        notes: 'Test notes'
      };

      const result = validateForm(validFormData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return all validation errors for invalid form', () => {
      const invalidFormData = {
        contractor_name: '', // Required
        service_provided: 'Short', // Too short
        status: 'Invalid', // Invalid status
        contract_type: 'Contract',
        start_date: '', // Required
        end_date: '2023-01-01', // Before start date
        contract_monthly_amount: '-100', // Negative
        contract_yearly_amount: '',
        notes: ''
      };

      const result = validateForm(invalidFormData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      // Check that we have errors for the expected fields
      const errorFields = result.errors.map(e => e.field);
      expect(errorFields).toContain('contractor_name');
      expect(errorFields).toContain('service_provided');
      expect(errorFields).toContain('start_date');
      expect(errorFields).toContain('contract_monthly_amount');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize form data correctly', () => {
      const formData = {
        contractor_name: '  ABC Construction  ',
        service_provided: '  Electrical services  ',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: '1500.00',
        contract_yearly_amount: '18000.00',
        notes: '  Some notes  '
      };

      const sanitized = sanitizeFormData(formData);
      
      expect(sanitized.contractor_name).toBe('ABC Construction');
      expect(sanitized.service_provided).toBe('Electrical services');
      expect(sanitized.notes).toBe('Some notes');
      expect(sanitized.contract_monthly_amount).toBe(1500);
      expect(sanitized.contract_yearly_amount).toBe(18000);
    });

    it('should handle empty optional fields', () => {
      const formData = {
        contractor_name: 'ABC Construction',
        service_provided: 'Electrical services',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: '',
        contract_yearly_amount: '',
        notes: ''
      };

      const sanitized = sanitizeFormData(formData);
      
      expect(sanitized.contract_monthly_amount).toBeNull();
      expect(sanitized.contract_yearly_amount).toBeNull();
      expect(sanitized.notes).toBeNull();
    });
  });

  describe('Auto-calculation', () => {
    it('should auto-calculate yearly amount from monthly amount', () => {
      expect(autoCalculateYearlyAmount('1000')).toBe('12000.00');
      expect(autoCalculateYearlyAmount('1500.50')).toBe('18006.00');
      expect(autoCalculateYearlyAmount('')).toBe('');
      expect(autoCalculateYearlyAmount('invalid')).toBe('');
      expect(autoCalculateYearlyAmount('-100')).toBe('');
    });
  });
});

describe('useFormValidation Hook', () => {
  const TestComponent = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
    const {
      formData,
      errors,
      touched,
      isValid,
      handleChange,
      handleBlur,
      handleSubmit,
      getFieldError,
      getFieldValidationStatus
    } = useFormValidation({
      initialData: {
        contractor_name: '',
        service_provided: '',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '',
        end_date: '',
        contract_monthly_amount: '',
        contract_yearly_amount: '',
        notes: ''
      },
      validateOnChange: true,
      validateOnBlur: true,
      autoCalculateYearly: true
    });

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          name="contractor_name"
          value={formData.contractor_name}
          onChange={handleChange}
          onBlur={handleBlur}
          data-testid="contractor-name"
        />
        <div data-testid="contractor-name-error">
          {getFieldError('contractor_name')}
        </div>
        <div data-testid="contractor-name-status">
          {getFieldValidationStatus('contractor_name')}
        </div>
        
        <input
          name="contract_monthly_amount"
          type="number"
          value={formData.contract_monthly_amount}
          onChange={handleChange}
          onBlur={handleBlur}
          data-testid="monthly-amount"
        />
        <div data-testid="yearly-amount">
          {formData.contract_yearly_amount}
        </div>
        
        <button type="submit" disabled={!isValid} data-testid="submit-button">
          Submit
        </button>
      </form>
    );
  };

  it('should provide real-time validation feedback', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestComponent onSubmit={onSubmit} />);
    
    const nameInput = screen.getByTestId('contractor-name');
    const errorDiv = screen.getByTestId('contractor-name-error');
    const statusDiv = screen.getByTestId('contractor-name-status');
    
    // Initially neutral
    expect(statusDiv).toHaveTextContent('neutral');
    
    // Type invalid input
    await user.type(nameInput, 'A');
    await user.tab(); // Trigger blur
    
    await waitFor(() => {
      expect(errorDiv).toHaveTextContent('at least 2 characters');
      expect(statusDiv).toHaveTextContent('invalid');
    });
    
    // Fix the input
    await user.clear(nameInput);
    await user.type(nameInput, 'ABC Construction');
    await user.tab();
    
    await waitFor(() => {
      expect(errorDiv).toHaveTextContent('');
      expect(statusDiv).toHaveTextContent('valid');
    });
  });

  it('should auto-calculate yearly amount from monthly amount', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestComponent onSubmit={onSubmit} />);
    
    const monthlyInput = screen.getByTestId('monthly-amount');
    const yearlyDiv = screen.getByTestId('yearly-amount');
    
    await user.type(monthlyInput, '1000');
    
    await waitFor(() => {
      expect(yearlyDiv).toHaveTextContent('12000.00');
    });
  });

  it('should prevent form submission when invalid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    
    render(<TestComponent onSubmit={onSubmit} />);
    
    const submitButton = screen.getByTestId('submit-button');
    
    // Initially disabled due to validation
    expect(submitButton).toBeDisabled();
    
    await user.click(submitButton);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AddContractorModal Integration', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show validation errors on form submission', async () => {
    const user = userEvent.setup();
    
    render(<AddContractorModal {...defaultProps} />);
    
    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /add contractor/i });
    await user.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/contractor name.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/service description.*required/i)).toBeInTheDocument();
    });
  });

  it('should provide real-time validation feedback', async () => {
    const user = userEvent.setup();
    
    render(<AddContractorModal {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/contractor name/i);
    
    // Type invalid input
    await user.type(nameInput, 'A');
    await user.tab();
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
    
    // Fix the input
    await user.clear(nameInput);
    await user.type(nameInput, 'ABC Construction');
    await user.tab();
    
    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/at least 2 characters/i)).not.toBeInTheDocument();
    });
  });

  it('should auto-calculate yearly amount from monthly amount', async () => {
    const user = userEvent.setup();
    
    render(<AddContractorModal {...defaultProps} />);
    
    const monthlyInput = screen.getByLabelText(/monthly amount/i);
    const yearlyInput = screen.getByLabelText(/yearly amount/i);
    
    await user.type(monthlyInput, '1500');
    
    await waitFor(() => {
      expect(yearlyInput).toHaveValue('18000.00');
    });
  });
});

describe('EditContractorModal Integration', () => {
  const mockContractor: Contractor = {
    id: 1,
    contractor_name: 'ABC Construction',
    service_provided: 'Electrical maintenance and repair services',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 1500,
    contract_yearly_amount: 18000,
    notes: 'Test notes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    contractor: mockContractor
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should populate form with existing contractor data', () => {
    render(<EditContractorModal {...defaultProps} />);
    
    expect(screen.getByDisplayValue('ABC Construction')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Electrical maintenance and repair services')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Active')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('18000')).toBeInTheDocument();
  });

  it('should detect and show changes', async () => {
    const user = userEvent.setup();
    
    render(<EditContractorModal {...defaultProps} />);
    
    const nameInput = screen.getByDisplayValue('ABC Construction');
    
    // Make a change
    await user.clear(nameInput);
    await user.type(nameInput, 'XYZ Construction');
    
    // Should show unsaved changes indicator
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  it('should validate changes in real-time', async () => {
    const user = userEvent.setup();
    
    render(<EditContractorModal {...defaultProps} />);
    
    const nameInput = screen.getByDisplayValue('ABC Construction');
    
    // Make invalid change
    await user.clear(nameInput);
    await user.type(nameInput, 'A');
    await user.tab();
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });
});