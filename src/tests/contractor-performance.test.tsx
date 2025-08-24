import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  ContractorPagination, 
  ContractorVirtualScroll, 
  ContractorDataProcessor,
  ContractorPerformanceMonitor,
  ContractorMemoryOptimizer
} from '../utils/contractor-performance';
import { 
  ContractorRequestManager,
  ContractorIntelligentCache
} from '../utils/contractor-request-manager';
// import { useContractorPerformance } from '../hooks/useContractorPerformance';
import type { Contractor } from '../types/contractor';

// Mock data
const mockContractors: Contractor[] = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  contractor_name: `Contractor ${index + 1}`,
  service_provided: `Service ${index % 10}`,
  status: ['Active', 'Expired', 'Pending'][index % 3] as 'Active' | 'Expired' | 'Pending',
  contract_type: ['Contract', 'PO'][index % 2] as 'Contract' | 'PO',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  contract_monthly_amount: 1000 + (index * 100),
  contract_yearly_amount: 12000 + (index * 1200),
  notes: `Notes for contractor ${index + 1}`,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}));

describe('ContractorPagination', () => {
  it('should paginate data correctly', () => {
    const result = ContractorPagination.paginate(mockContractors, 1, 25);
    
    expect(result.data).toHaveLength(25);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalPages).toBe(40);
    expect(result.pagination.totalItems).toBe(1000);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it('should handle last page correctly', () => {
    const result = ContractorPagination.paginate(mockContractors, 40, 25);
    
    expect(result.data).toHaveLength(25);
    expect(result.pagination.currentPage).toBe(40);
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it('should calculate optimal page size', () => {
    const pageSize = ContractorPagination.calculateOptimalPageSize(800, 60, 2);
    expect(pageSize).toBeGreaterThan(10);
    expect(pageSize).toBeLessThanOrEqual(100);
  });

  it('should provide pagination metadata', () => {
    const metadata = ContractorPagination.getPaginationMetadata(1000, 25);
    
    expect(metadata.totalPages).toBe(40);
    expect(metadata.pageSizes).toContain(25);
    expect(metadata.recommendedPageSize).toBe(50);
  });
});

describe('ContractorVirtualScroll', () => {
  it('should calculate virtual scroll parameters', () => {
    const result = ContractorVirtualScroll.calculateVirtualScroll(
      300, // scrollTop
      1000, // totalItems
      {
        itemHeight: 60,
        containerHeight: 400,
        overscan: 5,
        threshold: 50
      }
    );

    expect(result.shouldVirtualize).toBe(true);
    expect(result.startIndex).toBeGreaterThanOrEqual(0);
    expect(result.endIndex).toBeLessThanOrEqual(1000);
    expect(result.visibleItems).toBeGreaterThan(0);
    expect(result.totalHeight).toBe(60000); // 1000 * 60
  });

  it('should not virtualize small datasets', () => {
    const result = ContractorVirtualScroll.calculateVirtualScroll(
      0,
      30, // Below threshold
      { threshold: 50 }
    );

    expect(result.shouldVirtualize).toBe(false);
    expect(result.startIndex).toBe(0);
    expect(result.endIndex).toBe(30);
  });

  it('should create virtual renderer', () => {
    const virtualScroll = {
      startIndex: 10,
      endIndex: 20,
      visibleItems: 10,
      totalHeight: 60000,
      offsetY: 600,
      shouldVirtualize: true
    };

    const renderItem = vi.fn((item, index) => `Item ${index}`);
    const renderer = ContractorVirtualScroll.createVirtualRenderer(
      mockContractors,
      renderItem,
      virtualScroll
    );

    expect(renderer.visibleItems).toHaveLength(10);
    expect(renderer.spacerTop).toBe(600);
    expect(renderer.spacerBottom).toBeGreaterThan(0);
  });
});

describe('ContractorDataProcessor', () => {
  beforeEach(() => {
    ContractorDataProcessor.clearCaches();
  });

  it('should filter contractors efficiently', () => {
    const filters = {
      status: 'Active' as const,
      search: '',
      contractType: 'all' as const,
      dateRange: null,
      serviceCategory: null
    };

    const startTime = performance.now();
    const filtered = ContractorDataProcessor.filterContractors(mockContractors, filters);
    const endTime = performance.now();

    expect(filtered.length).toBeLessThan(mockContractors.length);
    expect(filtered.every(c => c.status === 'Active')).toBe(true);
    expect(endTime - startTime).toBeLessThan(100); // Should be fast
  });

  it('should use cache for repeated filters', () => {
    const filters = {
      status: 'Active' as const,
      search: '',
      contractType: 'all' as const,
      dateRange: null,
      serviceCategory: null
    };

    // First call
    const result1 = ContractorDataProcessor.filterContractors(mockContractors, filters);
    
    // Second call should use cache
    const startTime = performance.now();
    const result2 = ContractorDataProcessor.filterContractors(mockContractors, filters);
    const endTime = performance.now();

    expect(result1).toEqual(result2);
    expect(endTime - startTime).toBeLessThan(10); // Should be very fast (cached)
  });

  it('should sort contractors efficiently', () => {
    const startTime = performance.now();
    const sorted = ContractorDataProcessor.sortContractors(
      mockContractors,
      'contractor_name',
      'asc'
    );
    const endTime = performance.now();

    expect(sorted).toHaveLength(mockContractors.length);
    expect(sorted[0].contractor_name <= sorted[1].contractor_name).toBe(true);
    expect(endTime - startTime).toBeLessThan(200); // Should be reasonably fast
  });

  it('should combine filter and sort efficiently', () => {
    const filters = {
      status: 'Active' as const,
      search: '',
      contractType: 'all' as const,
      dateRange: null,
      serviceCategory: null
    };

    const startTime = performance.now();
    const result = ContractorDataProcessor.filterAndSort(
      mockContractors,
      filters,
      'contractor_name',
      'asc'
    );
    const endTime = performance.now();

    expect(result.length).toBeLessThan(mockContractors.length);
    expect(result.every(c => c.status === 'Active')).toBe(true);
    expect(result[0].contractor_name <= result[1].contractor_name).toBe(true);
    expect(endTime - startTime).toBeLessThan(300);
  });

  it('should provide cache statistics', () => {
    const filters = {
      status: 'Active' as const,
      search: '',
      contractType: 'all' as const,
      dateRange: null,
      serviceCategory: null
    };

    // Generate some cache entries
    ContractorDataProcessor.filterContractors(mockContractors, filters);
    ContractorDataProcessor.sortContractors(mockContractors, 'contractor_name', 'asc');

    const stats = ContractorDataProcessor.getCacheStats();
    expect(stats.filterCacheSize).toBeGreaterThan(0);
    expect(stats.sortCacheSize).toBeGreaterThan(0);
    expect(stats.totalCacheEntries).toBeGreaterThan(0);
  });
});

describe('ContractorPerformanceMonitor', () => {
  beforeEach(() => {
    ContractorPerformanceMonitor.clearMetrics();
  });

  it('should record performance metrics', () => {
    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 50,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: false
    });

    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    expect(stats.totalOperations).toBe(1);
    expect(stats.averageDuration).toBe(50);
  });

  it('should measure operation performance', async () => {
    const operation = () => {
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }
      return 'result';
    };

    const result = await ContractorPerformanceMonitor.measureOperation(
      'filter',
      operation,
      100
    );

    expect(result).toBe('result');
    
    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    expect(stats.totalOperations).toBe(1);
    expect(stats.averageDuration).toBeGreaterThan(0);
  });

  it('should calculate cache hit rate', () => {
    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 50,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: true
    });

    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 10,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: false
    });

    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    expect(stats.cacheHitRate).toBe(50);
  });

  it('should detect performance degradation', () => {
    // Add some fast operations
    for (let i = 0; i < 5; i++) {
      ContractorPerformanceMonitor.recordMetric({
        operationType: 'filter',
        duration: 10,
        itemCount: 1000,
        timestamp: Date.now() - 1000
      });
    }

    // Add some slow operations
    for (let i = 0; i < 5; i++) {
      ContractorPerformanceMonitor.recordMetric({
        operationType: 'filter',
        duration: 100,
        itemCount: 1000,
        timestamp: Date.now()
      });
    }

    const isDegrading = ContractorPerformanceMonitor.isPerformanceDegrading();
    expect(isDegrading).toBe(true);
  });
});

describe('ContractorMemoryOptimizer', () => {
  it('should create display subset', () => {
    const subset = ContractorMemoryOptimizer.createDisplaySubset(
      mockContractors.slice(0, 10),
      ['id', 'contractor_name', 'status']
    );

    expect(subset).toHaveLength(10);
    expect(subset[0]).toHaveProperty('id');
    expect(subset[0]).toHaveProperty('contractor_name');
    expect(subset[0]).toHaveProperty('status');
    expect(subset[0]).not.toHaveProperty('service_provided');
  });

  it('should create lazy loader', () => {
    const loader = ContractorMemoryOptimizer.createLazyLoader(mockContractors, 50);
    
    expect(loader.getTotalBatches()).toBe(20); // 1000 / 50
    
    const batch = loader.loadBatch(0);
    expect(batch).toHaveLength(50);
    expect(batch[0].id).toBe(1);
    
    const secondBatch = loader.loadBatch(50);
    expect(secondBatch).toHaveLength(50);
    expect(secondBatch[0].id).toBe(51);
  });
});

describe('ContractorRequestManager', () => {
  beforeEach(() => {
    ContractorRequestManager.clearAll();
  });

  afterEach(() => {
    ContractorRequestManager.clearAll();
  });

  it('should deduplicate identical requests', async () => {
    const mockFn = vi.fn().mockResolvedValue('result');
    
    // Make two identical requests simultaneously
    const [result1, result2] = await Promise.all([
      ContractorRequestManager.executeRequest('test-key', mockFn),
      ContractorRequestManager.executeRequest('test-key', mockFn)
    ]);

    expect(result1).toBe('result');
    expect(result2).toBe('result');
    expect(mockFn).toHaveBeenCalledTimes(1); // Should only call once due to deduplication
  });

  it('should retry failed requests', async () => {
    let callCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const result = await ContractorRequestManager.executeRequest('test-key', mockFn);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should batch requests', async () => {
    const batchExecutor = vi.fn().mockResolvedValue(['result1', 'result2', 'result3']);
    
    const promises = [
      ContractorRequestManager.batchRequest('batch-key', { id: 1 }, batchExecutor),
      ContractorRequestManager.batchRequest('batch-key', { id: 2 }, batchExecutor),
      ContractorRequestManager.batchRequest('batch-key', { id: 3 }, batchExecutor)
    ];

    const results = await Promise.all(promises);
    
    expect(results).toEqual(['result1', 'result2', 'result3']);
    expect(batchExecutor).toHaveBeenCalledTimes(1);
    expect(batchExecutor).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it('should provide request statistics', () => {
    const stats = ContractorRequestManager.getStats();
    
    expect(stats).toHaveProperty('pendingRequests');
    expect(stats).toHaveProperty('pendingBatches');
    expect(stats).toHaveProperty('config');
    expect(typeof stats.pendingRequests).toBe('number');
    expect(typeof stats.pendingBatches).toBe('number');
  });
});

describe('ContractorIntelligentCache', () => {
  beforeEach(() => {
    ContractorIntelligentCache.clear();
  });

  afterEach(() => {
    ContractorIntelligentCache.destroy();
  });

  it('should cache and retrieve data', () => {
    const testData = { test: 'data' };
    
    ContractorIntelligentCache.set('test-key', testData);
    const retrieved = ContractorIntelligentCache.get('test-key');
    
    expect(retrieved).toEqual(testData);
  });

  it('should handle cache expiration', async () => {
    const testData = { test: 'data' };
    
    ContractorIntelligentCache.set('test-key', testData, 100); // 100ms TTL
    
    expect(ContractorIntelligentCache.get('test-key')).toEqual(testData);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(ContractorIntelligentCache.get('test-key')).toBeNull();
  });

  it('should track access statistics', () => {
    const testData = { test: 'data' };
    
    ContractorIntelligentCache.set('test-key', testData);
    
    // Access multiple times
    ContractorIntelligentCache.get('test-key');
    ContractorIntelligentCache.get('test-key');
    ContractorIntelligentCache.get('test-key');
    
    const stats = ContractorIntelligentCache.getStats();
    expect(stats.entries).toBe(1);
    expect(stats.averageAccessCount).toBe(3);
  });

  it('should evict least important entries when full', () => {
    // Configure small cache for testing
    ContractorIntelligentCache.initialize({
      maxEntries: 3,
      maxSize: 1 // 1MB
    });

    // Add entries
    ContractorIntelligentCache.set('key1', { data: 'test1' });
    ContractorIntelligentCache.set('key2', { data: 'test2' });
    ContractorIntelligentCache.set('key3', { data: 'test3' });
    
    // Access key1 multiple times to make it important
    ContractorIntelligentCache.get('key1');
    ContractorIntelligentCache.get('key1');
    ContractorIntelligentCache.get('key1');
    
    // Add another entry, should evict least important
    ContractorIntelligentCache.set('key4', { data: 'test4' });
    
    const stats = ContractorIntelligentCache.getStats();
    expect(stats.entries).toBeLessThanOrEqual(3);
    
    // key1 should still exist (most accessed)
    expect(ContractorIntelligentCache.has('key1')).toBe(true);
  });

  it('should provide cache statistics', () => {
    ContractorIntelligentCache.set('test1', { data: 'test1' });
    ContractorIntelligentCache.set('test2', { data: 'test2' });
    
    const stats = ContractorIntelligentCache.getStats();
    
    expect(stats.entries).toBe(2);
    expect(stats.sizeBytes).toBeGreaterThan(0);
    expect(stats.sizeMB).toBeGreaterThan(0);
    expect(typeof stats.hitRate).toBe('number');
    expect(typeof stats.averageAccessCount).toBe('number');
  });
});

// Hook tests commented out due to testing library dependencies
// These would be tested in a full React environment