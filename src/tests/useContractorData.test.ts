import { renderHook, act, waitFor } from '@testing-library/react';
import { useContractorData } from '../../hooks/useContractorData';
import { ContractorAPI } from '../lib/contractor-api';
import { ContractorCache } from '../utils/contractor-cache';
import type { Contractor, ContractorAnalytics } from '../types/contractor';

// Mock the dependencies
jest.mock('../lib/contractor-api');
jest.mock('../utils/contractor-cache');

const mockContractorAPI = ContractorAPI as jest.Mocked<typeof ContractorAPI>;
const mockContractorCache = ContractorCache as jest.Mocked<typeof ContractorCache>;

// Mock data
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

const mockAnalytics: ContractorAnalytics = {
  summary: {
    total_contracts: 3,
    active_contracts: 2,
    expired_contracts: 1,
    pending_contracts: 0,
    total_yearly_value: 102000,
    average_contract_duration: 365
  },
  expiring: [],
  byService: [
    {
      service_category: 'General cleaning',
      contract_count: 1,
      total_value: 30000,
      average_value: 30000,
      active_count: 1,
      expired_count: 0
    }
  ]
};

describe('useContractorData Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockContractorAPI.getAllContractors.mockResolvedValue(mockContractors);
    mockContractorAPI.getAnalytics.mockResolvedValue(mockAnalytics);
    mockContractorCache.isCacheValid.mockReturnValue(false);
    mockContractorCache.getContractors.mockReturnValue(null);
    mockContractorCache.getAnalytics.mockReturnValue(null);
    mockContractorCache.saveContractors.mockImplementation(() => {});
    mockContractorCache.saveAnalytics.mockImplementation(() => {});
  });

  describe('Initial Data Loading', () => {
    it('should load data successfully on mount', async () => {
      const { result } = renderHook(() => useContractorData());

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.allData).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allData).toEqual(mockContractors);
      expect(result.current.analytics).toEqual(mockAnalytics);
      expect(result.current.error).toBeNull();
      expect(result.current.hasData).toBe(true);
    });

    it('should use cached data when available and valid', async () => {
      mockContractorCache.isCacheValid.mockReturnValue(true);
      mockContractorCache.getContractors.mockReturnValue(mockContractors);
      mockContractorCache.getAnalytics.mockReturnValue(mockAnalytics);

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.allData).toEqual(mockContractors);
      expect(mockContractorAPI.getAllContractors).not.toHaveBeenCalled();
      expect(mockContractorAPI.getAnalytics).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'API Error';
      mockContractorAPI.getAllContractors.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.allData).toEqual([]);
    });
  });

  describe('Filtering Functionality', () => {
    it('should filter contractors by status', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ status: 'Active' });
      });

      expect(result.current.filteredData).toHaveLength(2);
      expect(result.current.filteredData.every(c => c.status === 'Active')).toBe(true);
    });

    it('should filter contractors by search term', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ search: 'cleaning' });
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].contractor_name).toBe('Al Waha Cleaning Services');
    });

    it('should filter contractors by contract type', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ contractType: 'Contract' });
      });

      expect(result.current.filteredData).toHaveLength(3);
      expect(result.current.filteredData.every(c => c.contract_type === 'Contract')).toBe(true);
    });

    it('should combine multiple filters', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ 
          status: 'Active',
          search: 'security'
        });
      });

      expect(result.current.filteredData).toHaveLength(1);
      expect(result.current.filteredData[0].contractor_name).toBe('Muscat Security Solutions');
    });

    it('should reset filters correctly', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.updateFilters({ status: 'Active', search: 'test' });
      });

      expect(result.current.isFiltered).toBe(true);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.status).toBe('all');
      expect(result.current.filters.search).toBe('');
      expect(result.current.isFiltered).toBe(false);
      expect(result.current.filteredData).toEqual(mockContractors);
    });
  });

  describe('Data Analysis Functions', () => {
    it('should calculate summary metrics correctly', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const summary = result.current.calculateSummary();

      expect(summary.total_contracts).toBe(3);
      expect(summary.active_contracts).toBe(2);
      expect(summary.expired_contracts).toBe(1);
      expect(summary.pending_contracts).toBe(0);
      expect(summary.total_yearly_value).toBe(102000);
    });

    it('should get contractors by status', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const activeContractors = result.current.getContractorsByStatus('Active');
      const expiredContractors = result.current.getContractorsByStatus('Expired');

      expect(activeContractors).toHaveLength(2);
      expect(expiredContractors).toHaveLength(1);
    });

    it('should group contracts by service category', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const serviceGroups = result.current.getContractsByService();

      expect(serviceGroups).toHaveLength(3);
      expect(serviceGroups.find(s => s.service_category === 'General cleaning')).toBeDefined();
      expect(serviceGroups.find(s => s.service_category === 'Security guard')).toBeDefined();
      expect(serviceGroups.find(s => s.service_category === 'Air conditioning')).toBeDefined();
    });
  });

  describe('Search Functionality', () => {
    it('should search contractors with API call', async () => {
      const searchResults = mockContractors.slice(0, 1);
      mockContractorAPI.searchContractors.mockResolvedValue(searchResults);

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let searchResult: Contractor[] = [];
      await act(async () => {
        searchResult = await result.current.searchContractors({
          status: 'Active',
          search: 'cleaning',
          contractType: 'all',
          dateRange: null,
          serviceCategory: null
        });
      });

      expect(mockContractorAPI.searchContractors).toHaveBeenCalledWith({
        status: 'Active',
        search: 'cleaning',
        contractType: 'all',
        dateRange: null,
        serviceCategory: null
      });
      expect(searchResult).toEqual(searchResults);
    });

    it('should fallback to client-side search on API error', async () => {
      mockContractorAPI.searchContractors.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let searchResult: Contractor[] = [];
      await act(async () => {
        searchResult = await result.current.searchContractors({
          status: 'Active',
          search: 'cleaning',
          contractType: 'all',
          dateRange: null,
          serviceCategory: null
        });
      });

      expect(searchResult).toHaveLength(1);
      expect(searchResult[0].contractor_name).toBe('Al Waha Cleaning Services');
    });
  });

  describe('Cache Management', () => {
    it('should provide cache statistics', async () => {
      const mockStats = {
        contractorsCount: 3,
        hasAnalytics: true,
        cacheAge: 5,
        isValid: true,
        size: '10 KB'
      };
      mockContractorCache.getCacheStats.mockReturnValue(mockStats);

      const { result } = renderHook(() => useContractorData());

      const stats = result.current.getCacheStats();
      expect(stats).toEqual(mockStats);
    });

    it('should clear cache when requested', async () => {
      const { result } = renderHook(() => useContractorData());

      act(() => {
        result.current.clearCache();
      });

      expect(mockContractorCache.clearCache).toHaveBeenCalled();
    });

    it('should force refresh bypassing cache', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.forceRefresh();
      });

      // Should call API even if cache is valid
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2);
      expect(mockContractorAPI.getAnalytics).toHaveBeenCalledTimes(2);
    });
  });

  describe('Auto-refresh Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-refresh when cache becomes stale', async () => {
      mockContractorCache.shouldRefreshCache.mockReturnValue(true);

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Fast-forward time to trigger auto-refresh
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000); // 5 minutes
      });

      await waitFor(() => {
        expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(2);
      });
    });

    it('should allow disabling auto-refresh', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setAutoRefresh(false);
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000); // 10 minutes
      });

      // Should not have called API again
      expect(mockContractorAPI.getAllContractors).toHaveBeenCalledTimes(1);
    });
  });

  describe('Helper Properties', () => {
    it('should provide correct helper properties', async () => {
      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasData).toBe(true);
      expect(result.current.isEmpty).toBe(false);
      expect(result.current.isFiltered).toBe(false);

      act(() => {
        result.current.updateFilters({ status: 'Active' });
      });

      expect(result.current.isFiltered).toBe(true);
    });

    it('should handle empty data state', async () => {
      mockContractorAPI.getAllContractors.mockResolvedValue([]);
      mockContractorAPI.getAnalytics.mockResolvedValue({
        summary: {
          total_contracts: 0,
          active_contracts: 0,
          expired_contracts: 0,
          pending_contracts: 0,
          total_yearly_value: 0,
          average_contract_duration: 0
        },
        expiring: [],
        byService: []
      });

      const { result } = renderHook(() => useContractorData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasData).toBe(false);
      expect(result.current.isEmpty).toBe(true);
    });
  });
});