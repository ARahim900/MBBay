/**
 * Custom Hook for Form Validation
 * 
 * Provides real-time validation feedback with proper error states
 * and business rule enforcement for contractor forms.
 * 
 * Requirements: 6.4, 10.4
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  validateField,
  validateForm,
  shouldValidateRealTime,
  formatValidationErrors,
  sanitizeFormData,
  autoCalculateYearlyAmount,
  debounceValidation,
  type ContractorValidationSchema
} from '../utils/contractor-validation';
import type { ValidationError, FormValidationResult } from '../types/contractor';

export interface UseFormValidationOptions {
  initialData?: any;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceDelay?: number;
  autoCalculateYearly?: boolean;
}

export interface UseFormValidationReturn {
  // Form data
  formData: any;
  setFormData: (data: any) => void;
  updateField: (fieldName: string, value: any) => void;
  resetForm: (newData?: any) => void;
  
  // Validation state
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isValidating: boolean;
  
  // Validation methods
  validateField: (fieldName: string) => Promise<string | null>;
  validateForm: () => Promise<FormValidationResult>;
  clearErrors: (fieldNames?: string[]) => void;
  clearTouched: (fieldNames?: string[]) => void;
  
  // Field state helpers
  getFieldError: (fieldName: string) => string | null;
  isFieldTouched: (fieldName: string) => boolean;
  isFieldValid: (fieldName: string) => boolean;
  getFieldValidationStatus: (fieldName: string) => 'valid' | 'invalid' | 'neutral';
  
  // Form handlers
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSubmit: (data: any) => Promise<void> | void) => (e: React.FormEvent) => Promise<void>;
  
  // Utility methods
  getSanitizedData: () => any;
  hasChanges: (originalData?: any) => boolean;
}

export const useFormValidation = (options: UseFormValidationOptions = {}): UseFormValidationReturn => {
  const {
    initialData = {},
    validateOnChange = true,
    validateOnBlur = true,
    debounceDelay = 300,
    autoCalculateYearly = true
  } = options;

  // Form state
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);

  // Refs for debouncing and cleanup
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const initialDataRef = useRef(initialData);

  // Update initial data ref when it changes
  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  // Computed values
  const isValid = Object.keys(errors).length === 0;

  // Clear validation timeout for a field
  const clearValidationTimeout = useCallback((fieldName: string) => {
    if (validationTimeouts.current[fieldName]) {
      clearTimeout(validationTimeouts.current[fieldName]);
      delete validationTimeouts.current[fieldName];
    }
  }, []);

  // Validate a single field
  const validateSingleField = useCallback(async (fieldName: string): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      const error = validateField(
        fieldName as keyof ContractorValidationSchema,
        formData[fieldName],
        formData
      );
      
      const errorMessage = error ? error.message : null;
      
      setErrors(prev => {
        const newErrors = { ...prev };
        if (errorMessage) {
          newErrors[fieldName] = errorMessage;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
      
      return errorMessage;
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  // Validate entire form
  const validateEntireForm = useCallback(async (): Promise<FormValidationResult> => {
    setIsValidating(true);
    
    try {
      const result = validateForm(formData);
      const formattedErrors = formatValidationErrors(result.errors);
      
      setErrors(formattedErrors);
      
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [formData]);

  // Update a single field
  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // Auto-calculate yearly amount from monthly amount
      if (autoCalculateYearly && fieldName === 'contract_monthly_amount' && value) {
        const yearlyAmount = autoCalculateYearlyAmount(value);
        if (yearlyAmount) {
          newData.contract_yearly_amount = yearlyAmount;
        }
      }
      
      return newData;
    });

    // Mark field as touched
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Clear existing error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    // Real-time validation with debouncing
    if (validateOnChange && shouldValidateRealTime(fieldName as keyof ContractorValidationSchema)) {
      clearValidationTimeout(fieldName);
      
      validationTimeouts.current[fieldName] = setTimeout(() => {
        validateSingleField(fieldName);
      }, debounceDelay);
    }
  }, [autoCalculateYearly, validateOnChange, debounceDelay, clearValidationTimeout, validateSingleField]);

  // Reset form
  const resetForm = useCallback((newData?: any) => {
    const dataToUse = newData || initialData;
    setFormData(dataToUse);
    setErrors({});
    setTouched({});
    
    // Clear all validation timeouts
    Object.keys(validationTimeouts.current).forEach(clearValidationTimeout);
  }, [initialData, clearValidationTimeout]);

  // Clear errors
  const clearErrors = useCallback((fieldNames?: string[]) => {
    if (fieldNames) {
      setErrors(prev => {
        const newErrors = { ...prev };
        fieldNames.forEach(fieldName => {
          delete newErrors[fieldName];
        });
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // Clear touched state
  const clearTouched = useCallback((fieldNames?: string[]) => {
    if (fieldNames) {
      setTouched(prev => {
        const newTouched = { ...prev };
        fieldNames.forEach(fieldName => {
          delete newTouched[fieldName];
        });
        return newTouched;
      });
    } else {
      setTouched({});
    }
  }, []);

  // Field state helpers
  const getFieldError = useCallback((fieldName: string): string | null => {
    return errors[fieldName] || null;
  }, [errors]);

  const isFieldTouched = useCallback((fieldName: string): boolean => {
    return touched[fieldName] || false;
  }, [touched]);

  const isFieldValid = useCallback((fieldName: string): boolean => {
    return isFieldTouched(fieldName) && !getFieldError(fieldName);
  }, [isFieldTouched, getFieldError]);

  const getFieldValidationStatus = useCallback((fieldName: string): 'valid' | 'invalid' | 'neutral' => {
    if (!isFieldTouched(fieldName)) return 'neutral';
    return getFieldError(fieldName) ? 'invalid' : 'valid';
  }, [isFieldTouched, getFieldError]);

  // Form handlers
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    let processedValue = value;
    if (type === 'number') {
      processedValue = value === '' ? '' : value;
    }
    
    updateField(name, processedValue);
  }, [updateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validateSingleField(name);
    }
  }, [validateOnBlur, validateSingleField]);

  const handleSubmit = useCallback((onSubmit: (data: any) => Promise<void> | void) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mark all fields as touched
      const allFieldNames = Object.keys(formData);
      setTouched(prev => {
        const newTouched = { ...prev };
        allFieldNames.forEach(fieldName => {
          newTouched[fieldName] = true;
        });
        return newTouched;
      });
      
      // Validate entire form
      const validationResult = await validateEntireForm();
      
      if (validationResult.isValid) {
        const sanitizedData = sanitizeFormData(formData);
        await onSubmit(sanitizedData);
      }
    };
  }, [formData, validateEntireForm]);

  // Utility methods
  const getSanitizedData = useCallback(() => {
    return sanitizeFormData(formData);
  }, [formData]);

  const hasChanges = useCallback((originalData?: any) => {
    const compareData = originalData || initialDataRef.current;
    return JSON.stringify(formData) !== JSON.stringify(compareData);
  }, [formData]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeouts.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  return {
    // Form data
    formData,
    setFormData,
    updateField,
    resetForm,
    
    // Validation state
    errors,
    touched,
    isValid,
    isValidating,
    
    // Validation methods
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    clearErrors,
    clearTouched,
    
    // Field state helpers
    getFieldError,
    isFieldTouched,
    isFieldValid,
    getFieldValidationStatus,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Utility methods
    getSanitizedData,
    hasChanges
  };
};

export default useFormValidation;