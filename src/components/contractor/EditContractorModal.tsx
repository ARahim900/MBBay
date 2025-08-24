import React, { useState, useEffect } from 'react';
import { Save, Edit, DollarSign, Calendar, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { Modal, Button } from '../ui';
import { ContractorAPI } from '../../lib/contractor-api';
import { ContractorErrorHandler } from '../../utils/contractor-error-handler';
import type { Contractor, UpdateContractorData } from '../../types/contractor';
import { getThemeValue } from '../../lib/theme';

interface EditContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractor: Contractor | null;
  onSuccess: (contractor: Contractor) => void;
}

interface FormData {
  contractor_name: string;
  service_provided: string;
  status: 'Active' | 'Expired' | 'Pending';
  contract_type: 'Contract' | 'PO';
  start_date: string;
  end_date: string;
  contract_monthly_amount: string;
  contract_yearly_amount: string;
  notes: string;
}

export const EditContractorModal: React.FC<EditContractorModalProps> = ({
  isOpen,
  onClose,
  contractor,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    contractor_name: '',
    service_provided: '',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '',
    end_date: '',
    contract_monthly_amount: '',
    contract_yearly_amount: '',
    notes: ''
  });

  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form when contractor data is available
  useEffect(() => {
    if (contractor && isOpen) {
      const initialData: FormData = {
        contractor_name: contractor.contractor_name,
        service_provided: contractor.service_provided,
        status: contractor.status,
        contract_type: contractor.contract_type,
        start_date: contractor.start_date,
        end_date: contractor.end_date,
        contract_monthly_amount: contractor.contract_monthly_amount?.toString() || '',
        contract_yearly_amount: contractor.contract_yearly_amount?.toString() || '',
        notes: contractor.notes || ''
      };
      
      setFormData(initialData);
      setOriginalData(initialData);
      setErrors({});
      setSubmitError(null);
      setHasChanges(false);
    }
  }, [contractor, isOpen]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const hasFormChanges = Object.keys(formData).some(
        key => formData[key as keyof FormData] !== originalData[key as keyof FormData]
      );
      setHasChanges(hasFormChanges);
    }
  }, [formData, originalData]);

  // Auto-calculate yearly amount when monthly amount changes
  useEffect(() => {
    if (formData.contract_monthly_amount && !isNaN(parseFloat(formData.contract_monthly_amount))) {
      const monthlyAmount = parseFloat(formData.contract_monthly_amount);
      const yearlyAmount = (monthlyAmount * 12).toFixed(2);
      
      // Only update if it's different to avoid infinite loops
      if (formData.contract_yearly_amount !== yearlyAmount) {
        setFormData(prev => ({ ...prev, contract_yearly_amount: yearlyAmount }));
      }
    }
  }, [formData.contract_monthly_amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.contractor_name.trim()) {
      newErrors.contractor_name = 'Contractor name is required';
    } else if (formData.contractor_name.length < 2) {
      newErrors.contractor_name = 'Contractor name must be at least 2 characters';
    } else if (formData.contractor_name.length > 255) {
      newErrors.contractor_name = 'Contractor name must be less than 255 characters';
    } else if (!/^[a-zA-Z0-9\s&.-]+$/.test(formData.contractor_name)) {
      newErrors.contractor_name = 'Contractor name contains invalid characters';
    }

    if (!formData.service_provided.trim()) {
      newErrors.service_provided = 'Service description is required';
    } else if (formData.service_provided.length < 10) {
      newErrors.service_provided = 'Service description must be at least 10 characters';
    } else if (formData.service_provided.length > 1000) {
      newErrors.service_provided = 'Service description must be less than 1000 characters';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    // Numeric validation
    if (formData.contract_monthly_amount) {
      const monthlyAmount = parseFloat(formData.contract_monthly_amount);
      if (isNaN(monthlyAmount) || monthlyAmount < 0) {
        newErrors.contract_monthly_amount = 'Monthly amount must be a valid positive number';
      } else if (monthlyAmount > 10000000) {
        newErrors.contract_monthly_amount = 'Monthly amount must be less than 10,000,000 OMR';
      }
    }

    if (formData.contract_yearly_amount) {
      const yearlyAmount = parseFloat(formData.contract_yearly_amount);
      if (isNaN(yearlyAmount) || yearlyAmount < 0) {
        newErrors.contract_yearly_amount = 'Yearly amount must be a valid positive number';
      } else if (yearlyAmount > 120000000) {
        newErrors.contract_yearly_amount = 'Yearly amount must be less than 120,000,000 OMR';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contractor) return;
    
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create update data with only changed fields
      const updateData: UpdateContractorData = {};
      
      if (formData.contractor_name !== originalData?.contractor_name) {
        updateData.contractor_name = formData.contractor_name.trim();
      }
      if (formData.service_provided !== originalData?.service_provided) {
        updateData.service_provided = formData.service_provided.trim();
      }
      if (formData.status !== originalData?.status) {
        updateData.status = formData.status;
      }
      if (formData.contract_type !== originalData?.contract_type) {
        updateData.contract_type = formData.contract_type;
      }
      if (formData.start_date !== originalData?.start_date) {
        updateData.start_date = formData.start_date;
      }
      if (formData.end_date !== originalData?.end_date) {
        updateData.end_date = formData.end_date;
      }
      if (formData.contract_monthly_amount !== originalData?.contract_monthly_amount) {
        updateData.contract_monthly_amount = formData.contract_monthly_amount ? parseFloat(formData.contract_monthly_amount) : null;
      }
      if (formData.contract_yearly_amount !== originalData?.contract_yearly_amount) {
        updateData.contract_yearly_amount = formData.contract_yearly_amount ? parseFloat(formData.contract_yearly_amount) : null;
      }
      if (formData.notes !== originalData?.notes) {
        updateData.notes = formData.notes.trim() || null;
      }

      // Optimistic update - update UI immediately
      const optimisticContractor: Contractor = {
        ...contractor,
        contractor_name: formData.contractor_name.trim(),
        service_provided: formData.service_provided.trim(),
        status: formData.status,
        contract_type: formData.contract_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        contract_monthly_amount: formData.contract_monthly_amount ? parseFloat(formData.contract_monthly_amount) : null,
        contract_yearly_amount: formData.contract_yearly_amount ? parseFloat(formData.contract_yearly_amount) : null,
        notes: formData.notes.trim() || null,
        updated_at: new Date().toISOString()
      };

      // Update UI optimistically
      onSuccess(optimisticContractor);
      onClose();

      // Perform actual API update
      const updatedContractor = await ContractorAPI.updateContractor(contractor.id, updateData);
      
      // Update UI with actual response (in case of any differences)
      onSuccess(updatedContractor);
      
    } catch (error) {
      console.error('Error updating contractor:', error);
      const errorMessage = ContractorErrorHandler.handleAPIError(error as Error, 'updating contractor');
      setSubmitError(errorMessage);
      
      // Rollback optimistic update by refreshing with original data
      if (originalData) {
        setFormData(originalData);
        // Also rollback the UI by calling onSuccess with the original contractor
        onSuccess(contractor);
      }
      
      // Don't close the modal on error so user can see the error and retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setErrors({});
      setSubmitError(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          color: getThemeValue('colors.status.success', '#10b981'),
          backgroundColor: `${getThemeValue('colors.status.success', '#10b981')}08`,
          borderColor: `${getThemeValue('colors.status.success', '#10b981')}33`
        };
      case 'Expired':
        return {
          color: getThemeValue('colors.status.error', '#ef4444'),
          backgroundColor: `${getThemeValue('colors.status.error', '#ef4444')}08`,
          borderColor: `${getThemeValue('colors.status.error', '#ef4444')}33`
        };
      case 'Pending':
        return {
          color: getThemeValue('colors.status.warning', '#f59e0b'),
          backgroundColor: `${getThemeValue('colors.status.warning', '#f59e0b')}08`,
          borderColor: `${getThemeValue('colors.status.warning', '#f59e0b')}33`
        };
      default:
        return {
          color: getThemeValue('colors.gray.600', '#4b5563'),
          backgroundColor: getThemeValue('colors.gray.50', '#f9fafb'),
          borderColor: getThemeValue('colors.gray.200', '#e5e7eb')
        };
    }
  };

  if (!contractor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Contractor: ${contractor.contractor_name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Submit Error Alert */}
        {submitError && (
          <div 
            className="border rounded-lg p-4"
            style={{
              backgroundColor: `${getThemeValue('colors.status.error', '#ef4444')}08`,
              borderColor: `${getThemeValue('colors.status.error', '#ef4444')}33`,
              color: getThemeValue('colors.status.error', '#ef4444')
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Error Updating Contractor</span>
            </div>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Changes Indicator */}
        {hasChanges && (
          <div 
            className="border rounded-lg p-4"
            style={{
              backgroundColor: `${getThemeValue('colors.status.info', '#3b82f6')}08`,
              borderColor: `${getThemeValue('colors.status.info', '#3b82f6')}33`,
              color: getThemeValue('colors.status.info', '#3b82f6')
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                <span className="font-medium">Unsaved Changes</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
            <p className="text-sm mt-1">You have unsaved changes. Click "Update Contractor" to save them.</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <FileText className="h-5 w-5" style={{ color: getThemeValue('colors.primary', '#2D9CDB') }} />
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contractor Name *
              </label>
              <input
                type="text"
                name="contractor_name"
                value={formData.contractor_name}
                onChange={handleChange}
                placeholder="Enter contractor name"
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contractor_name ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              />
              {errors.contractor_name && (
                <p className="text-red-500 text-xs mt-1">{errors.contractor_name}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                style={{
                  ...getStatusColor(formData.status),
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                <option value="Active">Active - Currently providing services</option>
                <option value="Pending">Pending - Contract under review</option>
                <option value="Expired">Expired - Contract has ended</option>
              </select>
            </div>
          </div>

          <div>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Service Description *
            </label>
            <textarea
              name="service_provided"
              value={formData.service_provided}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the services provided by this contractor..."
              className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.service_provided ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            />
            {errors.service_provided && (
              <p className="text-red-500 text-xs mt-1">{errors.service_provided}</p>
            )}
          </div>
        </div>

        {/* Contract Details */}
        <div className="space-y-4">
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <Calendar className="h-5 w-5" style={{ color: getThemeValue('colors.status.warning', '#f59e0b') }} />
            Contract Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contract Type *
              </label>
              <select
                name="contract_type"
                value={formData.contract_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                <option value="Contract">Contract - Long-term agreement</option>
                <option value="PO">Purchase Order - One-time service</option>
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              />
              {errors.start_date && (
                <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              />
              {errors.end_date && (
                <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <DollarSign className="h-5 w-5" style={{ color: getThemeValue('colors.extended.purple', '#8b5cf6') }} />
            Financial Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Monthly Amount (OMR)
              </label>
              <input
                type="number"
                name="contract_monthly_amount"
                value={formData.contract_monthly_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contract_monthly_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              />
              {errors.contract_monthly_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.contract_monthly_amount}</p>
              )}
            </div>

            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Yearly Amount (OMR)
              </label>
              <input
                type="number"
                name="contract_yearly_amount"
                value={formData.contract_yearly_amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contract_yearly_amount ? 'border-red-500' : 'border-gray-300'
                }`}
                style={{
                  borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              />
              {errors.contract_yearly_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.contract_yearly_amount}</p>
              )}
              {formData.contract_monthly_amount && (
                <p className="text-xs text-gray-500 mt-1">
                  Auto-calculated from monthly amount
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            style={{
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional notes or comments about this contractor..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            style={{
              borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !hasChanges}
            className="min-w-[140px]"
            style={{
              backgroundColor: hasChanges ? getThemeValue('colors.primary', '#2D9CDB') : undefined,
              opacity: hasChanges ? 1 : 0.5
            }}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {hasChanges ? 'Update Contractor' : 'No Changes'}
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};