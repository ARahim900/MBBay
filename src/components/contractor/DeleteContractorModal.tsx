import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Modal, Button } from '../ui';
import { ContractorAPI } from '../../lib/contractor-api';
import { ContractorErrorHandler } from '../../utils/contractor-error-handler';
import type { Contractor } from '../../types/contractor';
import { getThemeValue } from '../../lib/theme';

interface DeleteContractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractor: Contractor | null;
  onSuccess: (contractorId: number) => void;
}

export const DeleteContractorModal: React.FC<DeleteContractorModalProps> = ({
  isOpen,
  onClose,
  contractor,
  onSuccess
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (!contractor) return;

    // Require confirmation text for safety
    if (confirmationText.toLowerCase() !== 'delete') {
      setDeleteError('Please type "delete" to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await ContractorAPI.deleteContractor(contractor.id);
      
      // Notify parent component of successful deletion
      onSuccess(contractor.id);
      onClose();
      
      // Reset state
      setConfirmationText('');
    } catch (error) {
      console.error('Error deleting contractor:', error);
      const errorMessage = ContractorErrorHandler.handleAPIError(error as Error, 'deleting contractor');
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      setDeleteError(null);
      onClose();
    }
  };

  const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
    if (deleteError) {
      setDeleteError(null);
    }
  };

  if (!contractor) return null;

  const isConfirmationValid = confirmationText.toLowerCase() === 'delete';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Contractor"
      size="md"
      closeOnOverlayClick={!isDeleting}
    >
      <div className="p-6 space-y-6">
        {/* Warning Header */}
        <div 
          className="border rounded-lg p-4"
          style={{
            backgroundColor: `${getThemeValue('colors.status.error', '#ef4444')}08`,
            borderColor: `${getThemeValue('colors.status.error', '#ef4444')}33`
          }}
        >
          <div 
            className="flex items-center gap-3 mb-3"
            style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
          >
            <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            <div>
              <h3 
                className="font-semibold"
                style={{ 
                  fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Permanent Deletion Warning
              </h3>
              <p 
                className="text-sm mt-1"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                This action cannot be undone
              </p>
            </div>
          </div>
          
          <div 
            className="text-sm space-y-2"
            style={{ 
              color: getThemeValue('colors.status.error', '#ef4444'),
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <p>You are about to permanently delete this contractor record:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>All contractor information will be lost</li>
              <li>Contract history will be removed</li>
              <li>Financial records will be deleted</li>
              <li>This action cannot be reversed</li>
            </ul>
          </div>
        </div>

        {/* Contractor Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 
            className="font-medium mb-3 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.base', '1rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
              color: getThemeValue('colors.textPrimary', '#111827')
            }}
          >
            Contractor Details
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium dark:text-white">{contractor.contractor_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Service:</span>
              <span className="font-medium dark:text-white max-w-xs text-right truncate">
                {contractor.service_provided}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  contractor.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : contractor.status === 'Expired'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                }`}
              >
                {contractor.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Contract Type:</span>
              <span className="font-medium dark:text-white">{contractor.contract_type}</span>
            </div>
            {contractor.contract_yearly_amount && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Annual Value:</span>
                <span className="font-medium dark:text-white">
                  OMR {contractor.contract_yearly_amount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Contract Period:</span>
              <span className="font-medium dark:text-white">
                {new Date(contractor.start_date).toLocaleDateString()} - {new Date(contractor.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {deleteError && (
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
              <span className="font-medium">Deletion Failed</span>
            </div>
            <p className="text-sm">{deleteError}</p>
          </div>
        )}

        {/* Confirmation Input */}
        <div className="space-y-3">
          <div>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Type <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-red-600 dark:text-red-400 font-mono">delete</code> to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={handleConfirmationChange}
              placeholder="Type 'delete' here"
              disabled={isDeleting}
              className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                deleteError && !isConfirmationValid ? 'border-red-500' : 'border-gray-300'
              }`}
              style={{
                borderRadius: getThemeValue('borderRadius.md', '0.375rem'),
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            />
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>This confirmation is required to prevent accidental deletions.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isDeleting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={isDeleting || !isConfirmationValid}
            className="min-w-[120px]"
            style={{
              backgroundColor: isConfirmationValid ? getThemeValue('colors.status.error', '#ef4444') : undefined,
              opacity: isConfirmationValid ? 1 : 0.5
            }}
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Contractor
              </div>
            )}
          </Button>
        </div>

        {/* Additional Safety Notice */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          <p>
            <strong>Note:</strong> Consider setting the contractor status to "Expired" instead of deleting 
            if you want to maintain historical records.
          </p>
        </div>
      </div>
    </Modal>
  );
};