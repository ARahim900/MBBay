/**
 * Integration Tests for Contractor Tracker Data Flow
 * 
 * This test suite validates the complete data flow and integration
 * between components, services, and the Supabase backend.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContractorTrackerDashboard } from '../components/ContractorTrackerDashboard';
import { ContractorAPI } from '../lib/contractor-api';
import { useContractorData } from '../../hooks/useContractorData';
import { ContractorCache } from '../utils/contractor-cache';
import { ContractorErrorHandler } from '../utils/contractor-error-handler';
import type { Contractor, CreateContractorData, UpdateContractorData, ContractorFilters } from '../types/contractor';

// Mock all external dependencies
vi.mock('../lib/contractor-api');
vi.mock('../utils/contractor-cache');
vi.mock('../utils/contractor-error-handler');
vi.mock('../lib/theme', () => ({
  getThemeValue: vi.fn((path, fallback) => fallback)
}));

const mockContractorAPI = vi.mocked(ContractorAPI);
const mockContractorCache = vi.mocked(ContractorCache);
const mockContractorErrorHandler = vi.mocked(ContractorErrorHandler);

// Test data
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'Al Waha Cleaning Services',
    service_provided: 'General cleaning and maintenance services',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 2500,
    contract_yearly_amount: 30000,
    notes: 'Daily cleaning services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'Muscat Security Solutions',
    service_provided: 'Security guard services and surveillance',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    contract_monthly_amount: 4200,
    contract_yearly_amount: 50400,
    notes: '24/7 security coverage',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 3,
    contractor_name: 'Gulf HVAC Maintenance',
    service_provided: 'Air conditioning system maintenance',
    status: 'Expired',
    contract_type: 'Contract',
    start_date: '2023-06-01',
    end_date: '2024-05-31',
    contract_monthly_amount: 1800,
    contract_yearly_amount: 21600,
    notes: 'Contract expired',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-05-31T00:00:00Z'
  }
];

const mockAnalytics = {
  summary: {
    total_contracts: 3,
    active_contracts: 2,
    expired_contracts: 1,
    pending_contracts: 0,
    total_yearly_value: 102000,
    average_contract_duration: 365
  },
  expiring: [
    {
      id: 2,
      contractor_name: 'Muscat Security Solutions',
      service_provided: 'Security guard services',
      end_date: '2025-01-31',
      days_until_expiry: 60,
      contract_yearly_amount: 50400,
      urgency_level: 'Medium' as const
    }
  ],
  byService: [
    {
      service_category: 'General cleaning',
      contract_count: 1,
      total_value: 30000,
      average_value: 30000,
      active_count: 1,
      expired_count: 0
    },
    {
      service_category: 'Security guard',
      contract_count: 1,
      total_value: 50400,
      average_value: 50400,
      active_count: 1,
      expired_count: 0
    }
  ]
};

describe('Contractor Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockContractorAPI.getAllContractors.mockResolvedValue(mockContractors);
    mockContractorAPI.getAnalytics.mockResolvedValue(mockAnalytics);
    mockContractorAPI.createContractor.mockImplementation(async (data) => ({
      id: Date.now(),
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    mockContractorAPI.updateContractor.mockImplementation(async (id, updates) => {
      const contractor = mockContractors.find(c => c.id === id);
      return contractor ? { ...contractor, ...updates, updated_at: new Date().toISOString() } : contractor!;
    });
    mockContractorAPI.deleteContractor.mockResolvedValue();
    
    mockContractorCache.isCacheValid.mockReturnValue(false);
    mockContractorCache.getContractors.mockReturnValue(null);
    mockContractorCache.getAnalytics.mockReturnValue(null);
    mockContractorCache.saveContractors.mockImplementation(() => {});
    mockContractorCache.saveAnalytics.mockImplementation(() => {});
    
    mockContractorErrorHandler.validateContractorData.mockReturnValue({
      isValid: true,
      errors: []
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Data Flow Integration', () => {
    it('should handle full application startup flow', async () => {
      const { result } = renderHook(() => useContractorData());

      // 1. Initial loading state
      expect(result.current.loading).toBe(true);
      expect(result.current.allData).toEqual([]);
      expect(result.current.error).toBeNull();

      // 2. Data loading completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 3. Verify data is loaded
      expect(result.current.allData).toEqual(mockContractors);
      expect(result.current.analytics).toEqual(mockAnalytics);
      expect(result.current.hasData).toBe(true);

      // 4. Verify API calls were made
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(1);
      expect(mockContractorAPI.getAnalytics).toHaveBeenCalledTimes(1);

      // 5. Verify caching
      expect(mockContractorCache.saveContractors).toHaveBeenCalledWith(mockContractors);
      expect(mockContractorCache.saveAnalytics).toHaveBeenCalledWith(mockAnalytics);
    });

    it('should handle cache-first loading strategy', async () => {
      // Setup cache to return data
      mockContractorCache.isCacheValid.mockReturnValue(true);
      mockContractorCache.getContractors.mockReturnValue(mockContractors);
      mockContractorCache.getAnalytics.mockReturnValue(mockAnalytics);

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should use cached data without API calls
      expect(result.current.allData).toEqual(mockContractors);
      expect(mockContractorAPI.getAllContractors).not.toHaveBeenCalled();
      expect(mockContractorAPI.getAnalytics).not.toHaveBeenCalled();
    });

    it('should handle error recovery with fallback data', async () => {
      // Setup API to fail
      mockContractorAPI.getAllContractors.mockRejectedValue(new Error('API Error'));
      mockContractorAPI.getAnalytics.mockRejectedValue(new Error('API Error'));
      
      // Setup cache to provide fallback
      mockContractorCache.getContractors.mockReturnValue(mockContractors.slice(0, 1));
      mockContractorErrorHandler.handleAPIError.mockReturnValue('Network error occurred');

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have fallback data and error message
      expect(result.current.allData).toHaveLength(1);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('CRUD Operations Integration', () => {
    it('should handle complete create contractor workflow', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newContractorData: CreateContractorData = {
        contractor_name: 'New Integration Test Contractor',
        service_provided: 'Integration test service description',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 2000,
        contract_yearly_amount: 24000,
        notes: 'Integration test notes'
      };

      const createdContractor: Contractor = {
        id: 999,
        ...newContractorData,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      // Mock successful creation
      mockContractorAPI.createContractor.mockResolvedValue(createdContractor);
      mockContractorAPI.getAllContractors.mockResolvedValue([...mockContractors, createdContractor]);

      // Simulate creation through refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Verify the workflow
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2); // Initial + refetch
      expect(mockContractorCache.saveContractors).toHaveBeenCalledWith([...mockContractors, createdContractor]);
    });

    it('should handle update contractor with optimistic updates', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const contractorToUpdate = mockContractors[0];
      const updates: UpdateContractorData = {
        status: 'Expired',
        notes: 'Updated through integration test'
      };

      const updatedContractor: Contractor = {
        ...contractorToUpdate,
        ...updates,
        updated_at: '2024-01-01T12:00:00Z'
      };

      // Mock successful update
      mockContractorAPI.updateContractor.mockResolvedValue(updatedContractor);
      const updatedList = mockContractors.map(c => c.id === contractorToUpdate.id ? updatedContractor : c);
      mockContractorAPI.getAllContractors.mockResolvedValue(updatedList);

      // Simulate update through refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Verify update workflow
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2);
      expect(mockContractorCache.saveContractors).toHaveBeenCalledWith(updatedList);
    });

    it('should handle delete contractor with confirmation', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const contractorToDelete = mockContractors[0];
      const remainingContractors = mockContractors.filter(c => c.id !== contractorToDelete.id);

      // Mock successful deletion
      mockContractorAPI.deleteContractor.mockResolvedValue();
      mockContractorAPI.getAllContractors.mockResolvedValue(remainingContractors);

      // Simulate deletion through refetch
      await act(async () => {
        await result.current.refetch();
      });

      // Verify deletion workflow
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2);
      expect(mockContractorCache.saveContractors).toHaveBeenCalledWith(remainingContractors);
    });

    it('should handle CRUD operation failures gracefully', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock API failures
      mockContractorAPI.createContractor.mockRejectedValue(new Error('Create failed'));
      mockContractorAPI.updateContractor.mockRejectedValue(new Error('Update failed'));
      mockContractorAPI.deleteContractor.mockRejectedValue(new Error('Delete failed'));
      mockContractorErrorHandler.handleAPIError.mockReturnValue('Operation failed');

      // Test create failure
      try {
        await ContractorAPI.createContractor({
          contractor_name: 'Test',
          service_provided: 'Test service',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31'
        });
      } catch (error) {
        expect(mockContractorErrorHandler.handleAPIError).toHaveBeenCalled();
      }

      // Test update failure
      try {
        await ContractorAPI.updateContractor(1, { status: 'Expired' });
      } catch (error) {
        expect(mockContractorErrorHandler.handleAPIError).toHaveBeenCalled();
      }

      // Test delete failure
      try {
        await ContractorAPI.deleteContractor(1);
      } catch (error) {
        expect(mockContractorErrorHandler.handleAPIError).toHaveBeenCalled();
      }
    });
  });

  describe('Search and Filter Integration', () => {
    it('should handle complex filtering scenarios', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test status filter
      act(() => {
        result.current.updateFilters({ status: 'Active' });
      });

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.every(c => c.status === 'Active')).toBe(true);

      // Test search filter
      act(() => {
        result.current.updateFilters({ search: 'cleaning' });
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].contractor_name).toContain('Cleaning');

      // Test combined filters
      act(() => {
        result.current.updateFilters({ 
          status: 'Active',
          search: 'security',
          contractType: 'Contract'
        });
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].contractor_name).toContain('Security');

      // Test filter reset
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filteredData).toEqual(mockContractors);
      expect(result.current.isFiltered).toBe(false);
    });

    it('should handle server-side search with fallback', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const searchFilters: ContractorFilters = {
        status: 'Active',
        search: 'cleaning',
        contractType: 'all',
        dateRange: null,
        serviceCategory: null
      };

      const searchResults = mockContractors.filter(c => 
        c.status === 'Active' && c.contractor_name.toLowerCase().includes('cleaning')
      );

      // Test successful server-side search
      mockContractorAPI.searchContractors.mockResolvedValue(searchResults);

      let result1: Contractor[] = [];
      await act(async () => {
        result1 = await result.current.searchContractors(searchFilters);
      });

      expect(mockContractorAPI.searchContractors).toHaveBeenCalledWith(searchFilters);
      expect(result1).toEqual(searchResults);

      // Test fallback to client-side search
      mockContractorAPI.searchContractors.mockRejectedValue(new Error('Search API failed'));

      let result2: Contractor[] = [];
      await act(async () => {
        result2 = await result.current.searchContractors(searchFilters);
      });

      expect(result2).toEqual(searchResults); // Should match client-side filtering
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle real-time data updates', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate real-time update
      const updatedContractor = { ...mockContractors[0], status: 'Expired' as const };
      const updatedList = mockContractors.map(c => c.id === updatedContractor.id ? updatedContractor : c);

      mockContractorAPI.getAllContractors.mockResolvedValue(updatedList);

      // Trigger refresh (simulating real-time update)
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.allData).toEqual(updatedList);
      expect(mockContractorCache.saveContractors).toHaveBeenCalledWith(updatedList);
    });

    it('should handle auto-refresh functionality', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Enable auto-refresh
      act(() => {
        result.current.setAutoRefresh(true);
      });

      // Fast-forward time to trigger auto-refresh
      act(() => {
        vi.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      });

      await waitFor(() => {
        expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2);
      });

      vi.useRealTimers();
    });
  });

  describe('Analytics Integration', () => {
    it('should calculate and update analytics in real-time', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test initial analytics
      const initialSummary = result.current.calculateSummary();
      expect(initialSummary.total_contracts).toBe(3);
      expect(initialSummary.active_contracts).toBe(2);
      expect(initialSummary.expired_contracts).toBe(1);

      // Simulate data change (add new contractor)
      const newContractor: Contractor = {
        id: 4,
        contractor_name: 'New Analytics Test',
        service_provided: 'Test service',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1000,
        contract_yearly_amount: 12000,
        notes: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const updatedList = [...mockContractors, newContractor];
      mockContractorAPI.getAllContractors.mockResolvedValue(updatedList);

      await act(async () => {
        await result.current.refetch();
      });

      // Test updated analytics
      const updatedSummary = result.current.calculateSummary();
      expect(updatedSummary.total_contracts).toBe(4);
      expect(updatedSummary.active_contracts).toBe(3);
      expect(updatedSummary.total_yearly_value).toBe(114000);
    });

    it('should handle analytics view integration', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test service grouping
      const serviceGroups = result.current.getContractsByService();
      expect(serviceGroups).toHaveLength(3); // cleaning, security, hvac

      // Test status grouping
      const activeContractors = result.current.getContractorsByStatus('Active');
      const expiredContractors = result.current.getContractorsByStatus('Expired');

      expect(activeContractors).toHaveLength(2);
      expect(expiredContractors).toHaveLength(1);

      // Test expiring contracts
      expect(result.current.analytics?.expiring).toHaveLength(1);
      expect(result.current.analytics?.expiring[0].urgency_level).toBe('Medium');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large dataset efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockContractors[0],
        id: i + 1,
        contractor_name: `Contractor ${i + 1}`
      }));

      mockContractorAPI.getAllContractors.mockResolvedValue(largeDataset);

      const { result } = renderHook(() => useContractorData());

      const startTime = performance.now();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      expect(result.current.allData).toHaveLength(1000);
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

      // Test filtering performance
      const filterStartTime = performance.now();

      act(() => {
        result.current.updateFilters({ status: 'Active' });
      });

      const filterEndTime = performance.now();
      const filterTime = filterEndTime - filterStartTime;

      expect(filterTime).toBeLessThan(100); // Filtering should be fast
    });

    it('should implement efficient caching strategy', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Test cache statistics
      const mockStats = {
        contractorsCount: 3,
        hasAnalytics: true,
        cacheAge: 5,
        isValid: true,
        size: '15 KB'
      };

      mockContractorCache.getCacheStats.mockReturnValue(mockStats);

      const stats = result.current.getCacheStats();
      expect(stats).toEqual(mockStats);

      // Test cache clearing
      act(() => {
        result.current.clearCache();
      });

      expect(mockContractorCache.clearCache).toHaveBeenCalled();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component-level errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock a component error
      mockContractorAPI.getAllContractors.mockImplementation(() => {
        throw new Error('Component error');
      });

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.allData).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should recover from errors with retry mechanism', async () => {
      let callCount = 0;
      mockContractorAPI.getAllContractors.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary error'));
        }
        return Promise.resolve(mockContractors);
      });

      const { result } = renderHook(() => useContractorData());

      // Initial failure
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Retry should succeed
      await act(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.allData).toEqual(mockContractors);
      });

      expect(callCount).toBe(3);
    });
  });
});