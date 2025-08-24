import React, { useState } from 'react';
import { AlertTriangle, Server, User, GitMerge, Clock } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Contractor } from '../../types/contractor';
import type { ConflictDetails } from '../../utils/contractor-conflict-resolver';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverData: Contractor;
  clientData: Contractor;
  conflicts: ConflictDetails[];
  onResolve: (resolvedContractor: Contractor, strategy: string) => void;
  onCancel: () => void;
}

/**
 * ConflictResolutionModal - Interactive conflict resolution interface
 * Allows users to manually resolve data conflicts between server and client
 */
export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  serverData,
  clientData,
  conflicts,
  onResolve,
  onCancel
}) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'server' | 'client' | 'manual'>('server');
  const [manualResolution, setManualResolution] = useState<Partial<Contractor>>({});
  const [showDetails, setShowDetails] = useState(false);

  // Get only fields with actual conflicts
  const conflictFields = conflicts.filter(c => c.hasConflict);

  // Handle strategy selection
  const handleStrategyChange = (strategy: 'server' | 'client' | 'manual') => {
    setSelectedStrategy(strategy);
    
    if (strategy === 'manual') {
      // Initialize manual resolution with server data
      setManualResolution({ ...serverData });
    } else {
      setManualResolution({});
    }
  };

  // Handle manual field selection
  const handleFieldChange = (field: keyof Contractor, value: any) => {
    setManualResolution(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle resolution
  const handleResolve = () => {
    let resolvedContractor: Contractor;
    let strategy: string;

    switch (selectedStrategy) {
      case 'server':
        resolvedContractor = serverData;
        strategy = 'server-wins';
        break;
      case 'client':
        resolvedContractor = {
          ...clientData,
          id: serverData.id,
          created_at: serverData.created_at,
          updated_at: serverData.updated_at
        };
        strategy = 'client-wins';
        break;
      case 'manual':
        resolvedContractor = {
          ...serverData,
          ...manualResolution
        };
        strategy = 'manual-resolution';
        break;
      default:
        resolvedContractor = serverData;
        strategy = 'server-wins';
    }

    onResolve(resolvedContractor, strategy);
  };

  // Format field value for display
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toLocaleString();
    if (typeof value === 'string' && value.includes('T')) {
      // Likely a date
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    return String(value);
  };

  // Get field display name
  const getFieldDisplayName = (field: keyof Contractor): string => {
    const fieldNames: Record<keyof Contractor, string> = {
      id: 'ID',
      contractor_name: 'Contractor Name',
      service_provided: 'Service Description',
      status: 'Status',
      contract_type: 'Contract Type',
      start_date: 'Start Date',
      end_date: 'End Date',
      contract_monthly_amount: 'Monthly Amount',
      contract_yearly_amount: 'Yearly Amount',
      notes: 'Notes',
      created_at: 'Created At',
      updated_at: 'Updated At'
    };
    return fieldNames[field] || field;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Data Conflict Detected
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The contractor "{serverData.contractor_name}" has been modified by another user. 
              Please choose how to resolve the conflicts.
            </p>
          </div>
        </div>

        {/* Conflict Summary */}
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {conflictFields.length} field(s) have conflicts
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Fields: {conflictFields.map(c => getFieldDisplayName(c.field)).join(', ')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-yellow-700 dark:text-yellow-300"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>
        </div>

        {/* Resolution Strategy Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Choose Resolution Strategy
          </h3>
          
          <div className="space-y-3">
            {/* Server Wins */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="strategy"
                value="server"
                checked={selectedStrategy === 'server'}
                onChange={() => handleStrategyChange('server')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Use Server Version
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Keep the version from the database (recommended for consistency)
                </p>
              </div>
            </label>

            {/* Client Wins */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="strategy"
                value="client"
                checked={selectedStrategy === 'client'}
                onChange={() => handleStrategyChange('client')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Use Your Version
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Keep your local changes and overwrite the server version
                </p>
              </div>
            </label>

            {/* Manual Resolution */}
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <input
                type="radio"
                name="strategy"
                value="manual"
                checked={selectedStrategy === 'manual'}
                onChange={() => handleStrategyChange('manual')}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Manual Resolution
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Choose which value to use for each conflicted field
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Conflict Details */}
        {showDetails && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Conflict Details
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {conflictFields.map((conflict) => (
                <div key={conflict.field} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm text-gray-900 dark:text-white mb-2">
                    {getFieldDisplayName(conflict.field)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                        <Server className="w-3 h-3" />
                        <span className="font-medium">Server Version</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                        {formatFieldValue(conflict.serverValue)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mb-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">Your Version</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-gray-900 rounded border">
                        {formatFieldValue(conflict.clientValue)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Resolution Fields */}
        {selectedStrategy === 'manual' && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Choose Values for Conflicted Fields
            </h3>
            
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {conflictFields.map((conflict) => (
                <div key={conflict.field} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                    {getFieldDisplayName(conflict.field)}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`field-${conflict.field}`}
                        checked={manualResolution[conflict.field] === conflict.serverValue}
                        onChange={() => handleFieldChange(conflict.field, conflict.serverValue)}
                      />
                      <Server className="w-3 h-3 text-blue-500" />
                      <span className="text-sm">Server: {formatFieldValue(conflict.serverValue)}</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`field-${conflict.field}`}
                        checked={manualResolution[conflict.field] === conflict.clientValue}
                        onChange={() => handleFieldChange(conflict.field, conflict.clientValue)}
                      />
                      <User className="w-3 h-3 text-green-500" />
                      <span className="text-sm">Client: {formatFieldValue(conflict.clientValue)}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp Info */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              Server last updated: {new Date(serverData.updated_at).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>
              Your version from: {new Date(clientData.updated_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            variant="primary"
            onClick={handleResolve}
          >
            Resolve Conflict
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConflictResolutionModal;