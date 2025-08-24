import React, { useState, useMemo } from 'react';
import { 
  Download, 
  FileText, 
  Calendar, 
  Filter, 
  CheckSquare, 
  Square,
  AlertCircle,
  BarChart3,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui';
import { getThemeValue } from '../../lib/theme';
import type { 
  Contractor, 
  ContractorFilters, 
  ContractorSummary,
  ExpiringContract,
  ServiceContract,
  ContractorExportOptions 
} from '../../types/contractor';
import {
  exportToCSV,
  exportToJSON,
  generateComplianceReport,
  filterContractorsForExport,
  createExportData,
  downloadFile,
  generateFilename,
  validateExportOptions,
  getExportStatistics
} from '../../utils/contractor-export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractors: Contractor[];
  summary: ContractorSummary;
  expiringContracts: ExpiringContract[];
  contractsByService: ServiceContract[];
  currentFilters?: ContractorFilters;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  contractors,
  summary,
  expiringContracts,
  contractsByService,
  currentFilters
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'compliance'>('csv');
  const [includeFields, setIncludeFields] = useState<(keyof Contractor)[]>([
    'contractor_name',
    'service_provided',
    'status',
    'contract_type',
    'start_date',
    'end_date',
    'contract_yearly_amount'
  ]);
  const [useCurrentFilters, setUseCurrentFilters] = useState(true);
  const [customDateRange, setCustomDateRange] = useState<{
    enabled: boolean;
    start: string;
    end: string;
  }>({
    enabled: false,
    start: '',
    end: ''
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Available fields for export
  const availableFields: Array<{
    key: keyof Contractor;
    label: string;
    description: string;
  }> = [
    { key: 'id', label: 'ID', description: 'Unique identifier' },
    { key: 'contractor_name', label: 'Contractor Name', description: 'Name of the contractor' },
    { key: 'service_provided', label: 'Service Provided', description: 'Description of services' },
    { key: 'status', label: 'Status', description: 'Contract status (Active/Expired/Pending)' },
    { key: 'contract_type', label: 'Contract Type', description: 'Contract or PO' },
    { key: 'start_date', label: 'Start Date', description: 'Contract start date' },
    { key: 'end_date', label: 'End Date', description: 'Contract end date' },
    { key: 'contract_monthly_amount', label: 'Monthly Amount', description: 'Monthly contract value' },
    { key: 'contract_yearly_amount', label: 'Yearly Amount', description: 'Annual contract value' },
    { key: 'notes', label: 'Notes', description: 'Additional notes' },
    { key: 'created_at', label: 'Created At', description: 'Record creation date' },
    { key: 'updated_at', label: 'Updated At', description: 'Last update date' }
  ];

  // Calculate filtered data for preview
  const filteredContractors = useMemo(() => {
    const filters = useCurrentFilters ? currentFilters : undefined;
    const dateRange = customDateRange.enabled ? {
      start: customDateRange.start,
      end: customDateRange.end
    } : undefined;

    return filterContractorsForExport(contractors, filters, dateRange);
  }, [contractors, currentFilters, useCurrentFilters, customDateRange]);

  // Export statistics
  const exportStats = useMemo(() => {
    return getExportStatistics(filteredContractors);
  }, [filteredContractors]);

  // Handle field selection
  const handleFieldToggle = (field: keyof Contractor) => {
    setIncludeFields(prev => 
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  // Select all fields
  const handleSelectAllFields = () => {
    setIncludeFields(availableFields.map(f => f.key));
  };

  // Clear all fields
  const handleClearAllFields = () => {
    setIncludeFields([]);
  };

  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportError(null);

      // Validate export options
      const exportOptions: ContractorExportOptions = {
        format: exportFormat as 'csv' | 'json',
        includeFields,
        filters: useCurrentFilters ? currentFilters : undefined,
        dateRange: customDateRange.enabled ? {
          start: customDateRange.start,
          end: customDateRange.end
        } : undefined
      };

      const validationErrors = validateExportOptions(exportOptions);
      if (validationErrors.length > 0) {
        setExportError(validationErrors.join(' '));
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'compliance') {
        // Generate compliance report
        const reportData = generateComplianceReport(
          filteredContractors,
          expiringContracts,
          contractsByService,
          summary,
          customDateRange.enabled ? {
            startDate: customDateRange.start,
            endDate: customDateRange.end
          } : undefined
        );

        content = JSON.stringify(reportData, null, 2);
        filename = generateFilename('contractor-compliance-report', 'json');
        mimeType = 'application/json';
      } else if (exportFormat === 'csv') {
        // Generate CSV
        content = exportToCSV(filteredContractors, exportOptions);
        filename = generateFilename('contractor-data', 'csv');
        mimeType = 'text/csv';
      } else {
        // Generate JSON
        const exportData = createExportData(
          filteredContractors,
          summary,
          expiringContracts,
          contractsByService,
          useCurrentFilters ? currentFilters : undefined,
          'json'
        );
        content = exportToJSON(exportData, true);
        filename = generateFilename('contractor-data', 'json');
        mimeType = 'application/json';
      }

      // Download the file
      downloadFile(content, filename, mimeType);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setExportError(null);
      setIsExporting(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Contractor Data">
      <div className="space-y-6">
        {/* Export Format Selection */}
        <div className="space-y-3">
          <h4 
            className="font-medium dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Export Format
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                exportFormat === 'csv'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet 
                  className="h-5 w-5"
                  style={{ color: getThemeValue('colors.status.success', '#10b981') }}
                />
                <div>
                  <div 
                    className="font-medium dark:text-white"
                    style={{ 
                      fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                      color: getThemeValue('colors.textPrimary', '#111827')
                    }}
                  >
                    CSV
                  </div>
                  <div 
                    className="text-xs text-gray-500 dark:text-gray-400"
                    style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                  >
                    Spreadsheet format
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('json')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                exportFormat === 'json'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileJson 
                  className="h-5 w-5"
                  style={{ color: getThemeValue('colors.primary', '#2D9CDB') }}
                />
                <div>
                  <div 
                    className="font-medium dark:text-white"
                    style={{ 
                      fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                      color: getThemeValue('colors.textPrimary', '#111827')
                    }}
                  >
                    JSON
                  </div>
                  <div 
                    className="text-xs text-gray-500 dark:text-gray-400"
                    style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                  >
                    Structured data
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setExportFormat('compliance')}
              className={`p-4 border rounded-lg text-left transition-colors ${
                exportFormat === 'compliance'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 
                  className="h-5 w-5"
                  style={{ color: getThemeValue('colors.extended.purple', '#8b5cf6') }}
                />
                <div>
                  <div 
                    className="font-medium dark:text-white"
                    style={{ 
                      fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                      color: getThemeValue('colors.textPrimary', '#111827')
                    }}
                  >
                    Compliance Report
                  </div>
                  <div 
                    className="text-xs text-gray-500 dark:text-gray-400"
                    style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                  >
                    Full analysis
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Field Selection (only for CSV/JSON) */}
        {exportFormat !== 'compliance' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 
                className="font-medium dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.textPrimary', '#111827'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Include Fields ({includeFields.length} selected)
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllFields}
                  className="text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllFields}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
              {availableFields.map(field => (
                <label
                  key={field.key}
                  className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded"
                >
                  <button
                    type="button"
                    onClick={() => handleFieldToggle(field.key)}
                    className="mt-0.5"
                  >
                    {includeFields.includes(field.key) ? (
                      <CheckSquare 
                        className="h-4 w-4"
                        style={{ color: getThemeValue('colors.primary', '#2D9CDB') }}
                      />
                    ) : (
                      <Square className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="font-medium dark:text-white"
                      style={{ 
                        fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                        color: getThemeValue('colors.textPrimary', '#111827')
                      }}
                    >
                      {field.label}
                    </div>
                    <div 
                      className="text-xs text-gray-500 dark:text-gray-400"
                      style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                    >
                      {field.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Filter Options */}
        <div className="space-y-3">
          <h4 
            className="font-medium dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Filter Options
          </h4>
          
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useCurrentFilters}
              onChange={(e) => setUseCurrentFilters(e.target.checked)}
              className="rounded"
            />
            <div>
              <div 
                className="font-medium dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.textPrimary', '#111827')
                }}
              >
                Use Current Filters
              </div>
              <div 
                className="text-xs text-gray-500 dark:text-gray-400"
                style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
              >
                Apply the currently active search and filter settings
              </div>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={customDateRange.enabled}
              onChange={(e) => setCustomDateRange(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded mt-1"
            />
            <div className="flex-1">
              <div 
                className="font-medium dark:text-white mb-2"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.textPrimary', '#111827')
                }}
              >
                Custom Date Range
              </div>
              {customDateRange.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label 
                      className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                      style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                      style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Export Preview */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-lg p-4">
          <h4 
            className="font-medium mb-3 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Export Preview
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <div 
                className="text-gray-500 dark:text-gray-400"
                style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
              >
                Total Records
              </div>
              <div 
                className="font-semibold dark:text-white"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                {exportStats.totalRecords}
              </div>
            </div>
            <div>
              <div 
                className="text-gray-500 dark:text-gray-400"
                style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
              >
                Active
              </div>
              <div 
                className="font-semibold"
                style={{ color: getThemeValue('colors.status.success', '#10b981') }}
              >
                {exportStats.activeContracts}
              </div>
            </div>
            <div>
              <div 
                className="text-gray-500 dark:text-gray-400"
                style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
              >
                Expired
              </div>
              <div 
                className="font-semibold"
                style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
              >
                {exportStats.expiredContracts}
              </div>
            </div>
            <div>
              <div 
                className="text-gray-500 dark:text-gray-400"
                style={{ fontSize: getThemeValue('typography.tooltipSize', '0.75rem') }}
              >
                Total Value
              </div>
              <div 
                className="font-semibold dark:text-white"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                OMR {exportStats.totalValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {exportError && (
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle 
              className="h-5 w-5 mt-0.5"
              style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
            />
            <div>
              <div 
                className="font-medium"
                style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
              >
                Export Error
              </div>
              <div 
                className="text-sm mt-1"
                style={{ 
                  color: getThemeValue('colors.status.error', '#ef4444'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem')
                }}
              >
                {exportError}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || (exportFormat !== 'compliance' && includeFields.length === 0)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};