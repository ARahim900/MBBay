/**
 * Contractor Export Utilities
 * Provides functionality for exporting contractor data in various formats
 * 
 * Requirements covered:
 * - 2.5: Export and reporting functionality
 * - 6.4: Data export with proper formatting
 * - 10.4: Secure data handling during export
 */

import type { 
  Contractor, 
  ContractorFilters, 
  ContractorSummary,
  ExpiringContract,
  ServiceContract,
  ContractorExportOptions 
} from '../types/contractor';

export interface ExportData {
  contractors: Contractor[];
  summary: ContractorSummary;
  expiringContracts: ExpiringContract[];
  contractsByService: ServiceContract[];
  filters?: ContractorFilters;
  exportMetadata: {
    exportedAt: string;
    exportedBy: string;
    totalRecords: number;
    filteredRecords: number;
    format: string;
  };
}

export interface ComplianceReportData {
  reportTitle: string;
  reportDate: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalContracts: number;
    activeContracts: number;
    expiredContracts: number;
    expiringContracts: number;
    complianceRate: number;
    totalValue: number;
  };
  contractDetails: Array<{
    contractorName: string;
    serviceProvided: string;
    contractType: string;
    status: string;
    startDate: string;
    endDate: string;
    yearlyAmount: number | null;
    daysUntilExpiry?: number;
    complianceStatus: 'Compliant' | 'Expiring Soon' | 'Expired' | 'Pending Review';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  }>;
  expirationAnalysis: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  serviceBreakdown: Array<{
    service: string;
    contractCount: number;
    totalValue: number;
    averageValue: number;
  }>;
  recommendations: string[];
}

/**
 * Export contractor data to CSV format
 */
export const exportToCSV = (
  contractors: Contractor[],
  options: Partial<ContractorExportOptions> = {}
): string => {
  const includeFields = options.includeFields || [
    'id',
    'contractor_name',
    'service_provided',
    'status',
    'contract_type',
    'start_date',
    'end_date',
    'contract_monthly_amount',
    'contract_yearly_amount',
    'notes'
  ];

  // Create CSV header
  const headers = includeFields.map(field => {
    switch (field) {
      case 'contractor_name': return 'Contractor Name';
      case 'service_provided': return 'Service Provided';
      case 'contract_type': return 'Contract Type';
      case 'start_date': return 'Start Date';
      case 'end_date': return 'End Date';
      case 'contract_monthly_amount': return 'Monthly Amount (OMR)';
      case 'contract_yearly_amount': return 'Yearly Amount (OMR)';
      case 'created_at': return 'Created At';
      case 'updated_at': return 'Updated At';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  });

  // Create CSV rows
  const rows = contractors.map(contractor => {
    return includeFields.map(field => {
      const value = contractor[field as keyof Contractor];
      
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle dates
      if (field.includes('date') && typeof value === 'string') {
        return new Date(value).toLocaleDateString();
      }
      
      // Handle numbers
      if (typeof value === 'number') {
        return value.toString();
      }
      
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return String(value);
    });
  });

  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  return csvContent;
};

/**
 * Export contractor data to JSON format
 */
export const exportToJSON = (
  exportData: ExportData,
  pretty: boolean = true
): string => {
  return JSON.stringify(exportData, null, pretty ? 2 : 0);
};

/**
 * Generate compliance report
 */
export const generateComplianceReport = (
  contractors: Contractor[],
  expiringContracts: ExpiringContract[],
  contractsByService: ServiceContract[],
  summary: ContractorSummary,
  reportPeriod?: { startDate: string; endDate: string }
): ComplianceReportData => {
  const now = new Date();
  const defaultPeriod = reportPeriod || {
    startDate: new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0]
  };

  // Calculate compliance metrics
  const totalContracts = contractors.length;
  const activeContracts = contractors.filter(c => c.status === 'Active').length;
  const expiredContracts = contractors.filter(c => c.status === 'Expired').length;
  const expiringCount = expiringContracts.length;
  
  // Compliance rate: (Active contracts / Total contracts) * 100
  const complianceRate = totalContracts > 0 ? (activeContracts / totalContracts) * 100 : 0;

  // Calculate total value
  const totalValue = contractors.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);

  // Generate contract details with compliance status
  const contractDetails = contractors.map(contractor => {
    const endDate = new Date(contractor.end_date);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let complianceStatus: 'Compliant' | 'Expiring Soon' | 'Expired' | 'Pending Review';
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';

    // Base compliance status on the actual contract status first
    if (contractor.status === 'Expired') {
      complianceStatus = 'Expired';
      riskLevel = 'Critical';
    } else if (contractor.status === 'Pending') {
      complianceStatus = 'Pending Review';
      riskLevel = 'Medium';
    } else if (contractor.status === 'Active') {
      // For active contracts, check if they're actually expired based on end date
      if (daysUntilExpiry <= 0) {
        complianceStatus = 'Expired';
        riskLevel = 'Critical';
      } else if (daysUntilExpiry <= 30) {
        complianceStatus = 'Expiring Soon';
        if (daysUntilExpiry <= 7) riskLevel = 'Critical';
        else if (daysUntilExpiry <= 14) riskLevel = 'High';
        else riskLevel = 'Medium';
      } else {
        complianceStatus = 'Compliant';
        riskLevel = 'Low';
      }
    } else {
      complianceStatus = 'Pending Review';
      riskLevel = 'Medium';
    }

    return {
      contractorName: contractor.contractor_name,
      serviceProvided: contractor.service_provided,
      contractType: contractor.contract_type,
      status: contractor.status,
      startDate: new Date(contractor.start_date).toLocaleDateString(),
      endDate: new Date(contractor.end_date).toLocaleDateString(),
      yearlyAmount: contractor.contract_yearly_amount,
      daysUntilExpiry: contractor.status === 'Active' ? daysUntilExpiry : undefined,
      complianceStatus,
      riskLevel
    };
  });

  // Analyze expiration urgency levels
  const expirationAnalysis = {
    critical: expiringContracts.filter(c => c.urgency_level === 'Critical').length,
    high: expiringContracts.filter(c => c.urgency_level === 'High').length,
    medium: expiringContracts.filter(c => c.urgency_level === 'Medium').length,
    low: expiringContracts.filter(c => c.urgency_level === 'Low').length
  };

  // Service breakdown
  const serviceBreakdown = contractsByService.map(service => ({
    service: service.service_category,
    contractCount: service.contract_count,
    totalValue: service.total_value,
    averageValue: service.average_value
  }));

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (complianceRate < 80) {
    recommendations.push('Consider reviewing expired contracts and initiating renewal processes to improve compliance rate.');
  }
  
  if (expirationAnalysis.critical > 0) {
    recommendations.push(`${expirationAnalysis.critical} contracts require immediate attention (expiring within 7 days).`);
  }
  
  if (expirationAnalysis.high > 0) {
    recommendations.push(`${expirationAnalysis.high} contracts should be reviewed for renewal (expiring within 14 days).`);
  }
  
  if (expiredContracts > 0) {
    recommendations.push(`${expiredContracts} expired contracts should be reviewed and either renewed or terminated.`);
  }
  
  const highValueContracts = contractors.filter(c => (c.contract_yearly_amount || 0) > 50000);
  if (highValueContracts.length > 0) {
    recommendations.push(`${highValueContracts.length} high-value contracts (>OMR 50,000) require special attention for renewal planning.`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('All contracts appear to be in good standing. Continue monitoring expiration dates.');
  }

  return {
    reportTitle: 'Contractor Compliance Report',
    reportDate: now.toISOString(),
    reportPeriod: defaultPeriod,
    summary: {
      totalContracts,
      activeContracts,
      expiredContracts,
      expiringContracts: expiringCount,
      complianceRate: Math.round(complianceRate * 100) / 100,
      totalValue
    },
    contractDetails,
    expirationAnalysis,
    serviceBreakdown,
    recommendations
  };
};

/**
 * Filter contractors based on export options
 */
export const filterContractorsForExport = (
  contractors: Contractor[],
  filters?: ContractorFilters,
  dateRange?: { start: string; end: string }
): Contractor[] => {
  let filtered = [...contractors];

  // Apply filters if provided
  if (filters) {
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.contractor_name.toLowerCase().includes(searchLower) ||
        c.service_provided.toLowerCase().includes(searchLower) ||
        (c.notes && c.notes.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.contractType !== 'all') {
      filtered = filtered.filter(c => c.contract_type === filters.contractType);
    }
    
    if (filters.serviceCategory) {
      filtered = filtered.filter(c => 
        c.service_provided.toLowerCase().includes(filters.serviceCategory.toLowerCase())
      );
    }
  }

  // Apply date range filter
  if (dateRange) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    filtered = filtered.filter(c => {
      const contractStart = new Date(c.start_date);
      const contractEnd = new Date(c.end_date);
      
      // Include contracts that overlap with the date range
      return (
        (contractStart >= startDate && contractStart <= endDate) ||
        (contractEnd >= startDate && contractEnd <= endDate) ||
        (contractStart <= startDate && contractEnd >= endDate)
      );
    });
  }

  return filtered;
};

/**
 * Create export data structure
 */
export const createExportData = (
  contractors: Contractor[],
  summary: ContractorSummary,
  expiringContracts: ExpiringContract[],
  contractsByService: ServiceContract[],
  filters?: ContractorFilters,
  format: string = 'json'
): ExportData => {
  return {
    contractors,
    summary,
    expiringContracts,
    contractsByService,
    filters,
    exportMetadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'Contractor Tracker System',
      totalRecords: contractors.length,
      filteredRecords: contractors.length,
      format
    }
  };
};

/**
 * Download file helper
 */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Generate filename with timestamp
 */
export const generateFilename = (
  prefix: string,
  extension: string,
  includeTimestamp: boolean = true
): string => {
  const timestamp = includeTimestamp 
    ? new Date().toISOString().split('T')[0] 
    : '';
  
  return includeTimestamp 
    ? `${prefix}-${timestamp}.${extension}`
    : `${prefix}.${extension}`;
};

/**
 * Validate export options
 */
export const validateExportOptions = (options: ContractorExportOptions): string[] => {
  const errors: string[] = [];
  
  if (!options.format || !['csv', 'json', 'xlsx'].includes(options.format)) {
    errors.push('Invalid export format. Must be csv, json, or xlsx.');
  }
  
  if (!options.includeFields || options.includeFields.length === 0) {
    errors.push('At least one field must be included in the export.');
  }
  
  if (options.dateRange) {
    const startDate = new Date(options.dateRange.start);
    const endDate = new Date(options.dateRange.end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      errors.push('Invalid date range provided.');
    } else if (startDate > endDate) {
      errors.push('Start date must be before end date.');
    }
  }
  
  return errors;
};

/**
 * Get export statistics
 */
export const getExportStatistics = (contractors: Contractor[]): {
  totalRecords: number;
  activeContracts: number;
  expiredContracts: number;
  pendingContracts: number;
  totalValue: number;
  averageValue: number;
  dateRange: { earliest: string; latest: string };
} => {
  const totalRecords = contractors.length;
  const activeContracts = contractors.filter(c => c.status === 'Active').length;
  const expiredContracts = contractors.filter(c => c.status === 'Expired').length;
  const pendingContracts = contractors.filter(c => c.status === 'Pending').length;
  
  const totalValue = contractors.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);
  const averageValue = totalRecords > 0 ? totalValue / totalRecords : 0;
  
  const dates = contractors.map(c => new Date(c.start_date).getTime()).filter(d => !isNaN(d));
  const earliest = dates.length > 0 ? new Date(Math.min(...dates)).toISOString().split('T')[0] : '';
  const latest = dates.length > 0 ? new Date(Math.max(...dates)).toISOString().split('T')[0] : '';
  
  return {
    totalRecords,
    activeContracts,
    expiredContracts,
    pendingContracts,
    totalValue,
    averageValue,
    dateRange: { earliest, latest }
  };
};