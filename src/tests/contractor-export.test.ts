/**
 * Test suite for contractor export functionality
 * Tests CSV export, JSON export, compliance reporting, and filtering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportToCSV,
  exportToJSON,
  generateComplianceReport,
  filterContractorsForExport,
  createExportData,
  validateExportOptions,
  getExportStatistics,
  generateFilename
} from '../utils/contractor-export';
import type { 
  Contractor, 
  ContractorFilters, 
  ContractorSummary,
  ExpiringContract,
  ServiceContract,
  ContractorExportOptions 
} from '../types/contractor';

// Mock data for testing
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'ABC Construction',
    service_provided: 'Building Maintenance',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 5000,
    contract_yearly_amount: 60000,
    notes: 'Primary maintenance contractor',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'XYZ Security',
    service_provided: 'Security Services',
    status: 'Active',
    contract_type: 'PO',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    contract_monthly_amount: 8000,
    contract_yearly_amount: 96000,
    notes: 'Security and surveillance',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 3,
    contractor_name: 'DEF Cleaning',
    service_provided: 'Cleaning Services',
    status: 'Expired',
    contract_type: 'Contract',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    contract_monthly_amount: 3000,
    contract_yearly_amount: 36000,
    notes: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-12-31T00:00:00Z'
  }
];

const mockSummary: ContractorSummary = {
  total_contracts: 3,
  active_contracts: 2,
  expired_contracts: 1,
  pending_contracts: 0,
  total_yearly_value: 192000,
  average_contract_duration: 365
};

const mockExpiringContracts: ExpiringContract[] = [
  {
    id: 1,
    contractor_name: 'ABC Construction',
    service_provided: 'Building Maintenance',
    end_date: '2024-12-31',
    days_until_expiry: 30,
    contract_yearly_amount: 60000,
    urgency_level: 'Medium'
  }
];

const mockContractsByService: ServiceContract[] = [
  {
    service_category: 'Building Maintenance',
    contract_count: 1,
    total_value: 60000,
    average_value: 60000,
    active_count: 1,
    expired_count: 0
  },
  {
    service_category: 'Security Services',
    contract_count: 1,
    total_value: 96000,
    average_value: 96000,
    active_count: 1,
    expired_count: 0
  }
];

describe('Contractor Export Utilities', () => {
  describe('exportToCSV', () => {
    it('should export contractors to CSV format', () => {
      const csv = exportToCSV(mockContractors);
      
      expect(csv).toContain('Contractor Name,Service Provided,Status');
      expect(csv).toContain('ABC Construction,Building Maintenance,Active');
      expect(csv).toContain('XYZ Security,Security Services,Active');
      expect(csv).toContain('DEF Cleaning,Cleaning Services,Expired');
    });

    it('should handle custom field selection', () => {
      const options: Partial<ContractorExportOptions> = {
        includeFields: ['contractor_name', 'status', 'contract_yearly_amount']
      };
      
      const csv = exportToCSV(mockContractors, options);
      
      expect(csv).toContain('Contractor Name,Status,Yearly Amount (OMR)');
      expect(csv).toContain('ABC Construction,Active,60000');
      expect(csv).not.toContain('Service Provided');
    });

    it('should handle null values correctly', () => {
      const csv = exportToCSV(mockContractors);
      
      // DEF Cleaning has null notes - should show as empty string at the end
      const lines = csv.split('\n');
      const defCleaningLine = lines.find(line => line.includes('DEF Cleaning'));
      expect(defCleaningLine).toBeDefined();
      expect(defCleaningLine).toMatch(/,$/) // Should end with comma for empty notes field
    });

    it('should escape CSV special characters', () => {
      const contractorWithComma: Contractor = {
        ...mockContractors[0],
        service_provided: 'Building, Maintenance, and Repair'
      };
      
      const csv = exportToCSV([contractorWithComma]);
      expect(csv).toContain('"Building, Maintenance, and Repair"');
    });
  });

  describe('exportToJSON', () => {
    it('should export data to JSON format', () => {
      const exportData = createExportData(
        mockContractors,
        mockSummary,
        mockExpiringContracts,
        mockContractsByService
      );
      
      const json = exportToJSON(exportData);
      const parsed = JSON.parse(json);
      
      expect(parsed.contractors).toHaveLength(3);
      expect(parsed.summary.total_contracts).toBe(3);
      expect(parsed.expiringContracts).toHaveLength(1);
      expect(parsed.contractsByService).toHaveLength(2);
      expect(parsed.exportMetadata).toBeDefined();
    });

    it('should format JSON with proper indentation', () => {
      const exportData = createExportData(
        mockContractors,
        mockSummary,
        mockExpiringContracts,
        mockContractsByService
      );
      
      const json = exportToJSON(exportData, true);
      expect(json).toContain('  "contractors": [');
      expect(json).toContain('    {');
    });
  });

  describe('generateComplianceReport', () => {
    it('should generate a comprehensive compliance report', () => {
      const report = generateComplianceReport(
        mockContractors,
        mockExpiringContracts,
        mockContractsByService,
        mockSummary
      );
      
      expect(report.reportTitle).toBe('Contractor Compliance Report');
      expect(report.summary.totalContracts).toBe(3);
      expect(report.summary.activeContracts).toBe(2);
      expect(report.summary.expiredContracts).toBe(1);
      expect(report.summary.complianceRate).toBeCloseTo(66.67, 2);
      expect(report.contractDetails).toHaveLength(3);
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    it('should calculate compliance status correctly', () => {
      const report = generateComplianceReport(
        mockContractors,
        mockExpiringContracts,
        mockContractsByService,
        mockSummary
      );
      
      // Find contracts by their actual status
      const expiredContract = report.contractDetails.find(c => c.status === 'Expired');
      
      // Expired contract should have correct status and risk
      expect(expiredContract?.complianceStatus).toBe('Expired');
      expect(expiredContract?.riskLevel).toBe('Critical');
      
      // Check that we have the expected number of contract details
      expect(report.contractDetails).toHaveLength(3);
      
      // Verify that each contract has a compliance status and risk level
      report.contractDetails.forEach(contract => {
        expect(contract.complianceStatus).toBeDefined();
        expect(contract.riskLevel).toBeDefined();
        expect(['Compliant', 'Expiring Soon', 'Expired', 'Pending Review']).toContain(contract.complianceStatus);
        expect(['Low', 'Medium', 'High', 'Critical']).toContain(contract.riskLevel);
      });
    });

    it('should provide relevant recommendations', () => {
      const report = generateComplianceReport(
        mockContractors,
        mockExpiringContracts,
        mockContractsByService,
        mockSummary
      );
      
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      // Should recommend reviewing expired contracts
      const hasExpiredRecommendation = report.recommendations.some(r => 
        r.includes('expired contracts')
      );
      expect(hasExpiredRecommendation).toBe(true);
    });

    it('should analyze expiration urgency levels', () => {
      const report = generateComplianceReport(
        mockContractors,
        mockExpiringContracts,
        mockContractsByService,
        mockSummary
      );
      
      expect(report.expirationAnalysis).toBeDefined();
      expect(report.expirationAnalysis.medium).toBe(1); // One medium urgency contract
      expect(report.expirationAnalysis.critical).toBe(0);
    });
  });

  describe('filterContractorsForExport', () => {
    it('should filter by status', () => {
      const filters: ContractorFilters = {
        status: 'Active',
        search: '',
        contractType: 'all',
        dateRange: null,
        serviceCategory: null
      };
      
      const filtered = filterContractorsForExport(mockContractors, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(c => c.status === 'Active')).toBe(true);
    });

    it('should filter by search term', () => {
      const filters: ContractorFilters = {
        status: 'all',
        search: 'security',
        contractType: 'all',
        dateRange: null,
        serviceCategory: null
      };
      
      const filtered = filterContractorsForExport(mockContractors, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].contractor_name).toBe('XYZ Security');
    });

    it('should filter by contract type', () => {
      const filters: ContractorFilters = {
        status: 'all',
        search: '',
        contractType: 'Contract',
        dateRange: null,
        serviceCategory: null
      };
      
      const filtered = filterContractorsForExport(mockContractors, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(c => c.contract_type === 'Contract')).toBe(true);
    });

    it('should filter by date range', () => {
      const dateRange = {
        start: '2024-01-01',
        end: '2024-12-31'
      };
      
      const filtered = filterContractorsForExport(mockContractors, undefined, dateRange);
      
      // Should include contracts that overlap with 2024
      expect(filtered).toHaveLength(2);
      expect(filtered.some(c => c.contractor_name === 'ABC Construction')).toBe(true);
      expect(filtered.some(c => c.contractor_name === 'XYZ Security')).toBe(true);
    });

    it('should combine multiple filters', () => {
      const filters: ContractorFilters = {
        status: 'Active',
        search: '',
        contractType: 'Contract',
        dateRange: null,
        serviceCategory: null
      };
      
      const filtered = filterContractorsForExport(mockContractors, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].contractor_name).toBe('ABC Construction');
    });
  });

  describe('validateExportOptions', () => {
    it('should validate valid export options', () => {
      const options: ContractorExportOptions = {
        format: 'csv',
        includeFields: ['contractor_name', 'status'],
        filters: undefined,
        dateRange: undefined
      };
      
      const errors = validateExportOptions(options);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid format', () => {
      const options: ContractorExportOptions = {
        format: 'invalid' as any,
        includeFields: ['contractor_name'],
        filters: undefined,
        dateRange: undefined
      };
      
      const errors = validateExportOptions(options);
      expect(errors).toContain('Invalid export format. Must be csv, json, or xlsx.');
    });

    it('should detect missing fields', () => {
      const options: ContractorExportOptions = {
        format: 'csv',
        includeFields: [],
        filters: undefined,
        dateRange: undefined
      };
      
      const errors = validateExportOptions(options);
      expect(errors).toContain('At least one field must be included in the export.');
    });

    it('should validate date range', () => {
      const options: ContractorExportOptions = {
        format: 'csv',
        includeFields: ['contractor_name'],
        filters: undefined,
        dateRange: {
          start: '2024-12-31',
          end: '2024-01-01'
        }
      };
      
      const errors = validateExportOptions(options);
      expect(errors).toContain('Start date must be before end date.');
    });
  });

  describe('getExportStatistics', () => {
    it('should calculate export statistics correctly', () => {
      const stats = getExportStatistics(mockContractors);
      
      expect(stats.totalRecords).toBe(3);
      expect(stats.activeContracts).toBe(2);
      expect(stats.expiredContracts).toBe(1);
      expect(stats.pendingContracts).toBe(0);
      expect(stats.totalValue).toBe(192000);
      expect(stats.averageValue).toBe(64000);
      expect(stats.dateRange.earliest).toBe('2023-01-01');
      expect(stats.dateRange.latest).toBe('2024-02-01');
    });

    it('should handle empty data', () => {
      const stats = getExportStatistics([]);
      
      expect(stats.totalRecords).toBe(0);
      expect(stats.activeContracts).toBe(0);
      expect(stats.totalValue).toBe(0);
      expect(stats.averageValue).toBe(0);
      expect(stats.dateRange.earliest).toBe('');
      expect(stats.dateRange.latest).toBe('');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with timestamp', () => {
      const filename = generateFilename('contractor-data', 'csv', true);
      
      expect(filename).toMatch(/^contractor-data-\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate filename without timestamp', () => {
      const filename = generateFilename('contractor-data', 'csv', false);
      
      expect(filename).toBe('contractor-data.csv');
    });
  });

  describe('createExportData', () => {
    it('should create properly structured export data', () => {
      const exportData = createExportData(
        mockContractors,
        mockSummary,
        mockExpiringContracts,
        mockContractsByService,
        undefined,
        'json'
      );
      
      expect(exportData.contractors).toEqual(mockContractors);
      expect(exportData.summary).toEqual(mockSummary);
      expect(exportData.expiringContracts).toEqual(mockExpiringContracts);
      expect(exportData.contractsByService).toEqual(mockContractsByService);
      expect(exportData.exportMetadata.format).toBe('json');
      expect(exportData.exportMetadata.totalRecords).toBe(3);
      expect(exportData.exportMetadata.exportedAt).toBeDefined();
    });

    it('should include filters in export data', () => {
      const filters: ContractorFilters = {
        status: 'Active',
        search: 'test',
        contractType: 'Contract',
        dateRange: null,
        serviceCategory: null
      };
      
      const exportData = createExportData(
        mockContractors,
        mockSummary,
        mockExpiringContracts,
        mockContractsByService,
        filters,
        'csv'
      );
      
      expect(exportData.filters).toEqual(filters);
    });
  });
});

describe('Export Integration Tests', () => {
  it('should handle complete export workflow', () => {
    // Filter data
    const filters: ContractorFilters = {
      status: 'Active',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };
    
    const filteredContractors = filterContractorsForExport(mockContractors, filters);
    
    // Create export data
    const exportData = createExportData(
      filteredContractors,
      mockSummary,
      mockExpiringContracts,
      mockContractsByService,
      filters,
      'json'
    );
    
    // Export to JSON
    const json = exportToJSON(exportData);
    const parsed = JSON.parse(json);
    
    expect(parsed.contractors).toHaveLength(2); // Only active contracts
    expect(parsed.filters.status).toBe('Active');
    expect(parsed.exportMetadata.filteredRecords).toBe(2);
  });

  it('should generate compliance report with filtered data', () => {
    const activeContractors = mockContractors.filter(c => c.status === 'Active');
    
    const report = generateComplianceReport(
      activeContractors,
      mockExpiringContracts,
      mockContractsByService,
      mockSummary
    );
    
    expect(report.summary.totalContracts).toBe(2);
    expect(report.summary.expiredContracts).toBe(0);
    expect(report.summary.complianceRate).toBe(100);
    expect(report.contractDetails).toHaveLength(2);
    expect(report.contractDetails.every(c => c.status === 'Active')).toBe(true);
  });
});