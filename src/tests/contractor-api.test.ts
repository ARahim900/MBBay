import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ContractorAPI } from '../lib/contractor-api';
import { ContractorErrorHandler } from '../utils/contractor-error-handler';
import { ContractorCache } from '../utils/contractor-cache';
import type { Contractor, CreateContractorData, UpdateContractorData } from '../types/contractor';

// Mock fetch globally
global.fetch = vi.fn();

describe('ContractorAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ContractorCache.clearCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAllContractors', () => {
    it('should fetch all contractors successfully', async () => {
      const mockContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Test Contractor',
          service_provided: 'Test Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: 'Test notes',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContractors
      });

      const result = await ContractorAPI.getAllContractors();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/contractor_tracker'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'apikey': expect.any(String),
            'Authorization': expect.stringContaining('Bearer'),
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual(mockContractors);
    });

    it('should return fallback data when API fails', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await ContractorAPI.getAllContractors();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('contractor_name');
    });
  });

  describe('getActiveContractors', () => {
    it('should fetch only active contractors', async () => {
      const mockActiveContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Active Contractor',
          service_provided: 'Active Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockActiveContractors
      });

      const result = await ContractorAPI.getActiveContractors();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=eq.Active'),
        expect.any(Object)
      );

      expect(result).toEqual(mockActiveContractors);
      expect(result.every(c => c.status === 'Active')).toBe(true);
    });
  });

  describe('createContractor', () => {
    it('should create a new contractor successfully', async () => {
      const newContractorData: CreateContractorData = {
        contractor_name: 'New Contractor',
        service_provided: 'New Service',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1500,
        contract_yearly_amount: 18000,
        notes: 'New contractor notes'
      };

      const createdContractor: Contractor = {
        id: 999,
        ...newContractorData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [createdContractor]
      });

      const result = await ContractorAPI.createContractor(newContractorData);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/rest/v1/contractor_tracker'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(newContractorData)
        })
      );

      expect(result).toEqual(createdContractor);
    });

    it('should throw error for invalid data', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => 'Validation error'
      });

      const invalidData = {
        contractor_name: '', // Invalid: empty name
        service_provided: 'Test',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      } as CreateContractorData;

      await expect(ContractorAPI.createContractor(invalidData)).rejects.toThrow();
    });
  });

  describe('updateContractor', () => {
    it('should update contractor successfully', async () => {
      const updates: UpdateContractorData = {
        status: 'Expired',
        notes: 'Updated notes'
      };

      const updatedContractor: Contractor = {
        id: 1,
        contractor_name: 'Test Contractor',
        service_provided: 'Test Service',
        status: 'Expired',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1000,
        contract_yearly_amount: 12000,
        notes: 'Updated notes',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [updatedContractor]
      });

      const result = await ContractorAPI.updateContractor(1, updates);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=eq.1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates)
        })
      );

      expect(result).toEqual(updatedContractor);
    });
  });

  describe('deleteContractor', () => {
    it('should delete contractor successfully', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => null
      });

      await expect(ContractorAPI.deleteContractor(1)).resolves.not.toThrow();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=eq.1'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('searchContractors', () => {
    it('should search contractors with filters', async () => {
      const mockResults: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Cleaning Service',
          service_provided: 'Office cleaning',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResults
      });

      const filters = {
        status: 'Active' as const,
        search: 'cleaning',
        contractType: 'all' as const,
        dateRange: null,
        serviceCategory: null
      };

      const result = await ContractorAPI.searchContractors(filters);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=eq.Active'),
        expect.any(Object)
      );

      expect(result).toEqual(mockResults);
    });
  });

  describe('exportToCSV', () => {
    it('should export contractors to CSV format', async () => {
      const mockContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Test Contractor',
          service_provided: 'Test Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: 'Test notes',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock the getAllContractors method
      vi.spyOn(ContractorAPI, 'getAllContractors').mockResolvedValue(mockContractors);

      const csvResult = await ContractorAPI.exportToCSV();

      expect(csvResult).toContain('ID,Contractor Name,Service Provided');
      expect(csvResult).toContain('1,"Test Contractor","Test Service"');
      expect(csvResult).toContain('Active,Contract');
    });
  });
});

describe('ContractorErrorHandler', () => {
  describe('handleAPIError', () => {
    it('should handle network errors', () => {
      const error = new Error('fetch failed');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toContain('Network connection error');
    });

    it('should handle authentication errors', () => {
      const error = new Error('401 Unauthorized');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toContain('Authentication error');
    });

    it('should handle server errors', () => {
      const error = new Error('500 Internal Server Error');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toContain('Server error');
    });
  });

  describe('validateContractorData', () => {
    it('should validate correct contractor data', () => {
      const validData = {
        contractor_name: 'Valid Contractor',
        service_provided: 'Valid service description that is long enough',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1000,
        contract_yearly_amount: 12000
      };

      const result = ContractorErrorHandler.validateContractorData(validData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch validation errors', () => {
      const invalidData = {
        contractor_name: 'A', // Too short
        service_provided: 'Short', // Too short
        status: 'Invalid', // Invalid status
        contract_type: 'Invalid', // Invalid type
        start_date: 'invalid-date',
        end_date: '2023-12-31', // Before start date
        contract_monthly_amount: -100 // Negative amount
      };

      const result = ContractorErrorHandler.validateContractorData(invalidData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Contractor name must be at least 2 characters long');
      expect(result.errors).toContain('Service description must be at least 10 characters long');
    });
  });
});

describe('ContractorCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveContractors and getContractors', () => {
    it('should save and retrieve contractors from cache', () => {
      const mockContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Cached Contractor',
          service_provided: 'Cached Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      ContractorCache.saveContractors(mockContractors);
      const retrieved = ContractorCache.getContractors();

      expect(retrieved).toEqual(mockContractors);
    });

    it('should return null for expired cache', () => {
      const mockContractors: Contractor[] = [];
      
      // Mock an old timestamp
      const oldTimestamp = Date.now() - (60 * 60 * 1000); // 1 hour ago
      const expiredCache = {
        data: mockContractors,
        timestamp: oldTimestamp,
        version: '1.0.0'
      };

      localStorage.setItem('contractor_data_cache', JSON.stringify(expiredCache));

      const retrieved = ContractorCache.getContractors();
      expect(retrieved).toBeNull();
    });
  });

  describe('updateContractorInCache', () => {
    it('should update existing contractor in cache', () => {
      const originalContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Original Name',
          service_provided: 'Original Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      ContractorCache.saveContractors(originalContractors);

      const updatedContractor: Contractor = {
        ...originalContractors[0],
        contractor_name: 'Updated Name',
        updated_at: '2024-01-01T12:00:00Z'
      };

      ContractorCache.updateContractorInCache(updatedContractor);

      const retrieved = ContractorCache.getContractors();
      expect(retrieved?.[0].contractor_name).toBe('Updated Name');
    });
  });

  describe('getCacheStats', () => {
    it('should return correct cache statistics', () => {
      const mockContractors: Contractor[] = [
        {
          id: 1,
          contractor_name: 'Test',
          service_provided: 'Test Service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: 1000,
          contract_yearly_amount: 12000,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      ContractorCache.saveContractors(mockContractors);

      const stats = ContractorCache.getCacheStats();

      expect(stats.contractorsCount).toBe(1);
      expect(stats.isValid).toBe(true);
      expect(stats.cacheAge).toBeGreaterThanOrEqual(0);
      expect(stats.size).toContain('KB');
    });
  });
});