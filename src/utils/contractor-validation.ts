/**
 * Comprehensive Form Validation for Contractor Forms
 * 
 * This utility provides client-side validation for all contractor form fields
 * with real-time validation feedback and business rule enforcement.
 * 
 * Requirements: 6.4, 10.4
 */

import type { ValidationError, FormValidationResult } from '../types/contractor';

// Validation schema configuration
export interface ContractorValidationSchema {
  contractor_name: FieldValidationRule;
  service_provided: FieldValidationRule;
  status: FieldValidationRule;
  contract_type: FieldValidationRule;
  start_date: FieldValidationRule;
  end_date: FieldValidationRule;
  contract_monthly_amount: FieldValidationRule;
  contract_yearly_amount: FieldValidationRule;
  notes: FieldValidationRule;
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  type?: 'string' | 'number' | 'date' | 'email' | 'url';
  customValidator?: (value: any, formData?: any) => string | null;
  message?: string;
  realTimeValidation?: boolean;
}

// Validation schema with business rules
export const contractorValidationSchema: ContractorValidationSchema = {
  contractor_name: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s&.-]+$/,
    type: 'string',
    message: 'Contractor name must be 2-255 characters and contain only letters, numbers, spaces, and basic punctuation',
    realTimeValidation: true
  },
  service_provided: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    type: 'string',
    message: 'Service description must be 10-1000 characters',
    realTimeValidation: true
  },
  status: {
    required: true,
    type: 'string',
    customValidator: (value) => {
      const validStatuses = ['Active', 'Expired', 'Pending'];
      return validStatuses.includes(value) ? null : 'Status must be Active, Expired, or Pending';
    },
    message: 'Status is required',
    realTimeValidation: false
  },
  contract_type: {
    required: true,
    type: 'string',
    customValidator: (value) => {
      const validTypes = ['Contract', 'PO'];
      return validTypes.includes(value) ? null : 'Contract type must be Contract or PO';
    },
    message: 'Contract type is required',
    realTimeValidation: false
  },
  start_date: {
    required: true,
    type: 'date',
    customValidator: (value) => {
      if (!value) return 'Start date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Start date must be a valid date';
      
      // Business rule: Start date cannot be more than 10 years in the past
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      if (date < tenYearsAgo) {
        return 'Start date cannot be more than 10 years in the past';
      }
      
      return null;
    },
    message: 'Start date is required',
    realTimeValidation: true
  },
  end_date: {
    required: true,
    type: 'date',
    customValidator: (value, formData) => {
      if (!value) return 'End date is required';
      const endDate = new Date(value);
      if (isNaN(endDate.getTime())) return 'End date must be a valid date';
      
      if (formData?.start_date) {
        const startDate = new Date(formData.start_date);
        if (!isNaN(startDate.getTime()) && endDate <= startDate) {
          return 'End date must be after start date';
        }
        
        // Business rule: Contract duration cannot exceed 20 years
        const maxDuration = new Date(startDate);
        maxDuration.setFullYear(maxDuration.getFullYear() + 20);
        if (endDate > maxDuration) {
          return 'Contract duration cannot exceed 20 years';
        }
        
        // Business rule: Minimum contract duration is 1 day
        const minDuration = new Date(startDate);
        minDuration.setDate(minDuration.getDate() + 1);
        if (endDate < minDuration) {
          return 'Contract duration must be at least 1 day';
        }
      }
      
      return null;
    },
    message: 'End date is required and must be after start date',
    realTimeValidation: true
  },
  contract_monthly_amount: {
    required: false,
    type: 'number',
    min: 0,
    max: 10000000,
    customValidator: (value) => {
      if (value === null || value === undefined || value === '') return null;
      
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return 'Monthly amount must be a valid number';
      if (numValue < 0) return 'Monthly amount cannot be negative';
      if (numValue > 10000000) return 'Monthly amount cannot exceed 10,000,000 OMR';
      
      // Business rule: Amounts should have at most 2 decimal places
      if (numValue % 0.01 !== 0) {
        return 'Monthly amount can have at most 2 decimal places';
      }
      
      return null;
    },
    message: 'Monthly amount must be a valid positive number with at most 2 decimal places',
    realTimeValidation: true
  },
  contract_yearly_amount: {
    required: false,
    type: 'number',
    min: 0,
    max: 120000000,
    customValidator: (value, formData) => {
      if (value === null || value === undefined || value === '') return null;
      
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return 'Yearly amount must be a valid number';
      if (numValue < 0) return 'Yearly amount cannot be negative';
      if (numValue > 120000000) return 'Yearly amount cannot exceed 120,000,000 OMR';
      
      // Business rule: Amounts should have at most 2 decimal places
      if (numValue % 0.01 !== 0) {
        return 'Yearly amount can have at most 2 decimal places';
      }
      
      // Business rule: If both monthly and yearly amounts are provided, yearly should be 12x monthly (with tolerance)
      if (formData?.contract_monthly_amount) {
        const monthlyValue = typeof formData.contract_monthly_amount === 'string' 
          ? parseFloat(formData.contract_monthly_amount) 
          : formData.contract_monthly_amount;
        
        if (!isNaN(monthlyValue) && monthlyValue > 0) {
          const expectedYearly = monthlyValue * 12;
          const tolerance = expectedYearly * 0.01; // 1% tolerance
          
          if (Math.abs(numValue - expectedYearly) > tolerance) {
            return `Yearly amount should be approximately ${expectedYearly.toFixed(2)} OMR (12x monthly amount)`;
          }
        }
      }
      
      return null;
    },
    message: 'Yearly amount must be a valid positive number with at most 2 decimal places',
    realTimeValidation: true
  },
  notes: {
    required: false,
    maxLength: 2000,
    type: 'string',
    message: 'Notes must be less than 2000 characters',
    realTimeValidation: false
  }
};

/**
 * Validate a single field
 */
export const validateField = (
  fieldName: keyof ContractorValidationSchema,
  value: any,
  formData?: any
): ValidationError | null => {
  const rule = contractorValidationSchema[fieldName];
  if (!rule) return null;

  // Required field validation
  if (rule.required && (value === null || value === undefined || value === '')) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} is required`,
      value
    };
  }

  // Skip other validations if field is empty and not required
  if (!rule.required && (value === null || value === undefined || value === '')) {
    return null;
  }

  // Type validation
  if (rule.type === 'number') {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return {
        field: fieldName,
        message: `${fieldName} must be a valid number`,
        value
      };
    }
    value = numValue;
  }

  // String length validation
  if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${rule.minLength} characters`,
      value
    };
  }

  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} must be less than ${rule.maxLength} characters`,
      value
    };
  }

  // Number range validation
  if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${rule.min}`,
      value
    };
  }

  if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
    return {
      field: fieldName,
      message: `${fieldName} must be at most ${rule.max}`,
      value
    };
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return {
      field: fieldName,
      message: rule.message || `${fieldName} format is invalid`,
      value
    };
  }

  // Custom validation
  if (rule.customValidator) {
    const customError = rule.customValidator(value, formData);
    if (customError) {
      return {
        field: fieldName,
        message: customError,
        value
      };
    }
  }

  return null;
};

/**
 * Validate entire form data
 */
export const validateForm = (formData: any): FormValidationResult => {
  const errors: ValidationError[] = [];

  // Validate each field
  Object.keys(contractorValidationSchema).forEach(fieldName => {
    const error = validateField(
      fieldName as keyof ContractorValidationSchema,
      formData[fieldName],
      formData
    );
    if (error) {
      errors.push(error);
    }
  });

  // Cross-field business rule validations
  const businessRuleErrors = validateBusinessRules(formData);
  errors.push(...businessRuleErrors);

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate business rules that span multiple fields
 */
export const validateBusinessRules = (formData: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Business rule: For PO contracts, end date should not be more than 1 year from start date
  if (formData.contract_type === 'PO' && formData.start_date && formData.end_date) {
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const oneYearLater = new Date(startDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      
      if (endDate > oneYearLater) {
        errors.push({
          field: 'end_date',
          message: 'Purchase Orders typically should not exceed 1 year duration',
          value: formData.end_date
        });
      }
    }
  }

  // Business rule: Active contracts should have end date in the future
  if (formData.status === 'Active' && formData.end_date) {
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!isNaN(endDate.getTime()) && endDate <= today) {
      errors.push({
        field: 'status',
        message: 'Active contracts should have an end date in the future',
        value: formData.status
      });
    }
  }

  // Business rule: Expired contracts should have end date in the past
  if (formData.status === 'Expired' && formData.end_date) {
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (!isNaN(endDate.getTime()) && endDate > today) {
      errors.push({
        field: 'status',
        message: 'Expired contracts should have an end date in the past',
        value: formData.status
      });
    }
  }

  // Business rule: If monthly amount is provided, yearly amount should also be provided (or auto-calculated)
  if (formData.contract_monthly_amount && !formData.contract_yearly_amount) {
    errors.push({
      field: 'contract_yearly_amount',
      message: 'Yearly amount should be provided when monthly amount is specified',
      value: formData.contract_yearly_amount
    });
  }

  return errors;
};

/**
 * Get validation error message for a specific field
 */
export const getFieldError = (
  fieldName: string,
  errors: ValidationError[]
): string | null => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
};

/**
 * Check if a field should show real-time validation
 */
export const shouldValidateRealTime = (fieldName: keyof ContractorValidationSchema): boolean => {
  const rule = contractorValidationSchema[fieldName];
  return rule?.realTimeValidation ?? false;
};

/**
 * Sanitize form data before submission
 */
export const sanitizeFormData = (formData: any): any => {
  const sanitized = { ...formData };

  // Trim string fields
  if (typeof sanitized.contractor_name === 'string') {
    sanitized.contractor_name = sanitized.contractor_name.trim();
  }
  if (typeof sanitized.service_provided === 'string') {
    sanitized.service_provided = sanitized.service_provided.trim();
  }
  if (typeof sanitized.notes === 'string') {
    sanitized.notes = sanitized.notes.trim() || null;
  }

  // Convert string numbers to numbers
  if (sanitized.contract_monthly_amount !== null && sanitized.contract_monthly_amount !== undefined && sanitized.contract_monthly_amount !== '') {
    sanitized.contract_monthly_amount = parseFloat(sanitized.contract_monthly_amount);
  } else {
    sanitized.contract_monthly_amount = null;
  }

  if (sanitized.contract_yearly_amount !== null && sanitized.contract_yearly_amount !== undefined && sanitized.contract_yearly_amount !== '') {
    sanitized.contract_yearly_amount = parseFloat(sanitized.contract_yearly_amount);
  } else {
    sanitized.contract_yearly_amount = null;
  }

  return sanitized;
};

/**
 * Auto-calculate yearly amount from monthly amount
 */
export const autoCalculateYearlyAmount = (monthlyAmount: string | number): string => {
  if (!monthlyAmount || monthlyAmount === '') return '';
  
  const monthly = typeof monthlyAmount === 'string' ? parseFloat(monthlyAmount) : monthlyAmount;
  if (isNaN(monthly) || monthly <= 0) return '';
  
  return (monthly * 12).toFixed(2);
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  const formatted: Record<string, string> = {};
  
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  
  return formatted;
};

/**
 * Check if form has validation errors
 */
export const hasValidationErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get field validation status for styling
 */
export const getFieldValidationStatus = (
  fieldName: string,
  errors: Record<string, string>,
  touched: Record<string, boolean> = {}
): 'valid' | 'invalid' | 'neutral' => {
  if (!touched[fieldName]) return 'neutral';
  return errors[fieldName] ? 'invalid' : 'valid';
};

/**
 * Debounce validation for real-time feedback
 */
export const debounceValidation = (
  callback: () => void,
  delay: number = 300
): (() => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, delay);
  };
};