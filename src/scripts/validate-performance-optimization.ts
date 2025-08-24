#!/usr/bin/env node

/**
 * Validation script for contractor performance optimization implementation
 * Tests all performance features including pagination, virtual scrolling, caching, and request optimization
 */

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
import type { Contractor, ContractorFilters } from '../types/contractor';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test results tracking
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details?: string;
  error?: string;
}

const testResults: TestResult[] = [];

// Helper functions
function log(message: string, color: string = colors.reset): void {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string): void {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string): void {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string): void {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message: string): void {
  log(`ℹ️  ${message}`, colors.blue);
}

function logHeader(message: string): void {
  log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

// Generate mock data for testing
function generateMockContractors(count: number): Contractor[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    contractor_name: `Contractor ${index + 1}`,
    service_provided: `Service ${index % 10} - ${['Cleaning', 'Security', 'Maintenance', 'IT Support', 'Catering'][index % 5]}`,
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
}

// Test runner
async function runTest(
  name: string, 
  testFn: () => Promise<void> | void
): Promise<void> {
  const startTime = performance.now();
  
  try {
    await testFn();
    const duration = performance.now() - startTime;
    
    testResults.push({
      name,
      passed: true,
      duration
    });
    
    logSuccess(`${name} (${duration.toFixed(2)}ms)`);
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    testResults.push({
      name,
      passed: false,
      duration,
      error: errorMessage
    });
    
    logError(`${name} - ${errorMessage}`);
  }
}

// Performance benchmark
async function benchmarkOperation(
  name: string,
  operation: () => void,
  iterations: number = 100
): Promise<number> {
  const times: number[] = [];
  
  // Warm up
  for (let i = 0; i < 10; i++) {
    operation();
  }
  
  // Benchmark
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    operation();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  logInfo(`${name}: avg=${avgTime.toFixed(2)}ms, min=${minTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`);
  
  return avgTime;
}

// Test implementations
async function testPagination(): Promise<void> {
  logHeader('Testing Pagination');
  
  const mockData = generateMockContractors(1000);
  
  await runTest('Basic pagination', () => {
    const result = ContractorPagination.paginate(mockData, 1, 25);
    
    if (result.data.length !== 25) {
      throw new Error(`Expected 25 items, got ${result.data.length}`);
    }
    
    if (result.pagination.totalPages !== 40) {
      throw new Error(`Expected 40 pages, got ${result.pagination.totalPages}`);
    }
    
    if (!result.pagination.hasNextPage) {
      throw new Error('Expected hasNextPage to be true');
    }
  });
  
  await runTest('Last page pagination', () => {
    const result = ContractorPagination.paginate(mockData, 40, 25);
    
    if (result.pagination.hasNextPage) {
      throw new Error('Expected hasNextPage to be false on last page');
    }
    
    if (!result.pagination.hasPreviousPage) {
      throw new Error('Expected hasPreviousPage to be true on last page');
    }
  });
  
  await runTest('Optimal page size calculation', () => {
    const pageSize = ContractorPagination.calculateOptimalPageSize(800, 60, 2);
    
    if (pageSize < 10 || pageSize > 100) {
      throw new Error(`Page size ${pageSize} is outside expected range (10-100)`);
    }
  });
  
  // Benchmark pagination performance
  await benchmarkOperation(
    'Pagination performance (1000 items)',
    () => ContractorPagination.paginate(mockData, 1, 25),
    50
  );
}

async function testVirtualScrolling(): Promise<void> {
  logHeader('Testing Virtual Scrolling');
  
  await runTest('Virtual scroll calculation', () => {
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
    
    if (!result.shouldVirtualize) {
      throw new Error('Expected virtualization to be enabled for 1000 items');
    }
    
    if (result.totalHeight !== 60000) {
      throw new Error(`Expected total height 60000, got ${result.totalHeight}`);
    }
    
    if (result.startIndex < 0 || result.endIndex > 1000) {
      throw new Error(`Invalid scroll indices: ${result.startIndex}-${result.endIndex}`);
    }
  });
  
  await runTest('Small dataset virtualization', () => {
    const result = ContractorVirtualScroll.calculateVirtualScroll(
      0,
      30, // Below threshold
      { threshold: 50 }
    );
    
    if (result.shouldVirtualize) {
      throw new Error('Expected virtualization to be disabled for small datasets');
    }
  });
  
  await runTest('Virtual renderer creation', () => {
    const mockData = generateMockContractors(100);
    const virtualScroll = {
      startIndex: 10,
      endIndex: 20,
      visibleItems: 10,
      totalHeight: 6000,
      offsetY: 600,
      shouldVirtualize: true
    };
    
    const renderItem = (item: Contractor, index: number) => `Item ${index}`;
    const renderer = ContractorVirtualScroll.createVirtualRenderer(
      mockData,
      renderItem,
      virtualScroll
    );
    
    if (renderer.visibleItems.length !== 10) {
      throw new Error(`Expected 10 visible items, got ${renderer.visibleItems.length}`);
    }
    
    if (renderer.spacerTop !== 600) {
      throw new Error(`Expected spacer top 600, got ${renderer.spacerTop}`);
    }
  });
  
  // Benchmark virtual scrolling
  await benchmarkOperation(
    'Virtual scroll calculation (1000 items)',
    () => ContractorVirtualScroll.calculateVirtualScroll(300, 1000),
    100
  );
}

async function testDataProcessing(): Promise<void> {
  logHeader('Testing Data Processing');
  
  const mockData = generateMockContractors(1000);
  
  // Clear caches before testing
  ContractorDataProcessor.clearCaches();
  
  await runTest('Data filtering', () => {
    const filters: ContractorFilters = {
      status: 'Active',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };
    
    const filtered = ContractorDataProcessor.filterContractors(mockData, filters);
    
    if (filtered.length >= mockData.length) {
      throw new Error('Filtering should reduce the dataset size');
    }
    
    if (!filtered.every(c => c.status === 'Active')) {
      throw new Error('All filtered items should have Active status');
    }
  });
  
  await runTest('Data sorting', () => {
    const sorted = ContractorDataProcessor.sortContractors(
      mockData.slice(0, 100),
      'contractor_name',
      'asc'
    );
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].contractor_name > sorted[i].contractor_name) {
        throw new Error('Data is not properly sorted');
      }
    }
  });
  
  await runTest('Combined filter and sort', () => {
    const filters: ContractorFilters = {
      status: 'Active',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };
    
    const result = ContractorDataProcessor.filterAndSort(
      mockData,
      filters,
      'contractor_name',
      'asc'
    );
    
    if (!result.every(c => c.status === 'Active')) {
      throw new Error('Filtering failed in combined operation');
    }
    
    for (let i = 1; i < result.length; i++) {
      if (result[i - 1].contractor_name > result[i].contractor_name) {
        throw new Error('Sorting failed in combined operation');
      }
    }
  });
  
  await runTest('Cache utilization', () => {
    const filters: ContractorFilters = {
      status: 'Active',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };
    
    // First call - should cache
    ContractorDataProcessor.filterContractors(mockData, filters);
    
    // Second call - should use cache
    const startTime = performance.now();
    ContractorDataProcessor.filterContractors(mockData, filters);
    const endTime = performance.now();
    
    // Cached call should be very fast
    if (endTime - startTime > 10) {
      throw new Error('Cache not being utilized effectively');
    }
    
    const stats = ContractorDataProcessor.getCacheStats();
    if (stats.totalCacheEntries === 0) {
      throw new Error('No cache entries found');
    }
  });
  
  // Benchmark data processing
  const filters: ContractorFilters = {
    status: 'Active',
    search: 'Service',
    contractType: 'all',
    dateRange: null,
    serviceCategory: null
  };
  
  await benchmarkOperation(
    'Filter performance (1000 items)',
    () => ContractorDataProcessor.filterContractors(mockData, filters, false),
    20
  );
  
  await benchmarkOperation(
    'Sort performance (1000 items)',
    () => ContractorDataProcessor.sortContractors(mockData, 'contractor_name', 'asc', false),
    20
  );
}

async function testPerformanceMonitoring(): Promise<void> {
  logHeader('Testing Performance Monitoring');
  
  // Clear metrics before testing
  ContractorPerformanceMonitor.clearMetrics();
  
  await runTest('Metric recording', () => {
    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 50,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: false
    });
    
    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    
    if (stats.totalOperations !== 1) {
      throw new Error(`Expected 1 operation, got ${stats.totalOperations}`);
    }
    
    if (stats.averageDuration !== 50) {
      throw new Error(`Expected average duration 50, got ${stats.averageDuration}`);
    }
  });
  
  await runTest('Operation measurement', async () => {
    const operation = () => {
      // Simulate work
      const start = Date.now();
      while (Date.now() - start < 10) {
        // Busy wait
      }
      return 'result';
    };
    
    const result = await ContractorPerformanceMonitor.measureOperation(
      'test',
      operation,
      100
    );
    
    if (result !== 'result') {
      throw new Error('Operation result not preserved');
    }
    
    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    if (stats.totalOperations === 0) {
      throw new Error('Operation not recorded');
    }
  });
  
  await runTest('Cache hit rate calculation', () => {
    // Clear previous metrics
    ContractorPerformanceMonitor.clearMetrics();
    
    // Add metrics with cache hits
    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 10,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: true
    });
    
    ContractorPerformanceMonitor.recordMetric({
      operationType: 'filter',
      duration: 50,
      itemCount: 1000,
      timestamp: Date.now(),
      cacheHit: false
    });
    
    const stats = ContractorPerformanceMonitor.getPerformanceStats();
    
    if (stats.cacheHitRate !== 50) {
      throw new Error(`Expected cache hit rate 50%, got ${stats.cacheHitRate}%`);
    }
  });
}

async function testMemoryOptimization(): Promise<void> {
  logHeader('Testing Memory Optimization');
  
  const mockData = generateMockContractors(100);
  
  await runTest('Display subset creation', () => {
    const subset = ContractorMemoryOptimizer.createDisplaySubset(
      mockData,
      ['id', 'contractor_name', 'status']
    );
    
    if (subset.length !== mockData.length) {
      throw new Error('Subset length mismatch');
    }
    
    const firstItem = subset[0];
    if (!firstItem.id || !firstItem.contractor_name || !firstItem.status) {
      throw new Error('Required fields missing from subset');
    }
    
    if ('service_provided' in firstItem) {
      throw new Error('Excluded field found in subset');
    }
  });
  
  await runTest('Lazy loader creation', () => {
    const loader = ContractorMemoryOptimizer.createLazyLoader(mockData, 20);
    
    if (loader.getTotalBatches() !== 5) {
      throw new Error(`Expected 5 batches, got ${loader.getTotalBatches()}`);
    }
    
    const firstBatch = loader.loadBatch(0);
    if (firstBatch.length !== 20) {
      throw new Error(`Expected batch size 20, got ${firstBatch.length}`);
    }
    
    if (firstBatch[0].id !== 1) {
      throw new Error('First batch should start with ID 1');
    }
    
    const secondBatch = loader.loadBatch(20);
    if (secondBatch[0].id !== 21) {
      throw new Error('Second batch should start with ID 21');
    }
  });
  
  await runTest('Memory cleanup', () => {
    // This test mainly ensures the cleanup function runs without errors
    ContractorMemoryOptimizer.cleanup();
    
    // Verify caches are cleared
    const processingStats = ContractorDataProcessor.getCacheStats();
    if (processingStats.totalCacheEntries > 0) {
      throw new Error('Processing caches not cleared');
    }
  });
}

async function testRequestManagement(): Promise<void> {
  logHeader('Testing Request Management');
  
  // Clear all requests before testing
  ContractorRequestManager.clearAll();
  
  await runTest('Request deduplication', async () => {
    let callCount = 0;
    const mockRequest = () => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    };
    
    // Make two identical requests simultaneously
    const [result1, result2] = await Promise.all([
      ContractorRequestManager.executeRequest('test-key', mockRequest),
      ContractorRequestManager.executeRequest('test-key', mockRequest)
    ]);
    
    if (callCount !== 1) {
      throw new Error(`Expected 1 call due to deduplication, got ${callCount}`);
    }
    
    if (result1 !== result2) {
      throw new Error('Deduplicated requests should return same result');
    }
  });
  
  await runTest('Request retry logic', async () => {
    let attemptCount = 0;
    const mockRequest = () => {
      attemptCount++;
      if (attemptCount < 3) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve('success');
    };
    
    const result = await ContractorRequestManager.executeRequest('retry-test', mockRequest);
    
    if (result !== 'success') {
      throw new Error('Request should eventually succeed');
    }
    
    if (attemptCount !== 3) {
      throw new Error(`Expected 3 attempts, got ${attemptCount}`);
    }
  });
  
  await runTest('Request batching', async () => {
    let batchCallCount = 0;
    const batchExecutor = (params: any[]) => {
      batchCallCount++;
      return Promise.resolve(params.map((p, i) => `result-${i}`));
    };
    
    // Make multiple batch requests
    const promises = [
      ContractorRequestManager.batchRequest('batch-test', { id: 1 }, batchExecutor),
      ContractorRequestManager.batchRequest('batch-test', { id: 2 }, batchExecutor),
      ContractorRequestManager.batchRequest('batch-test', { id: 3 }, batchExecutor)
    ];
    
    const results = await Promise.all(promises);
    
    if (batchCallCount !== 1) {
      throw new Error(`Expected 1 batch call, got ${batchCallCount}`);
    }
    
    if (results.length !== 3) {
      throw new Error(`Expected 3 results, got ${results.length}`);
    }
  });
  
  await runTest('Request statistics', () => {
    const stats = ContractorRequestManager.getStats();
    
    if (typeof stats.pendingRequests !== 'number') {
      throw new Error('Invalid pending requests count');
    }
    
    if (typeof stats.pendingBatches !== 'number') {
      throw new Error('Invalid pending batches count');
    }
    
    if (!stats.config || typeof stats.config.timeout !== 'number') {
      throw new Error('Invalid configuration');
    }
  });
}

async function testIntelligentCaching(): Promise<void> {
  logHeader('Testing Intelligent Caching');
  
  // Initialize cache
  ContractorIntelligentCache.initialize({
    maxSize: 10, // 10MB for testing
    maxEntries: 100,
    defaultTTL: 60000, // 1 minute
    cleanupInterval: 30000 // 30 seconds
  });
  
  // Clear cache before testing
  ContractorIntelligentCache.clear();
  
  await runTest('Basic cache operations', () => {
    const testData = { test: 'data', value: 123 };
    
    ContractorIntelligentCache.set('test-key', testData);
    const retrieved = ContractorIntelligentCache.get('test-key');
    
    if (!retrieved || retrieved.test !== 'data' || retrieved.value !== 123) {
      throw new Error('Cache data not retrieved correctly');
    }
    
    if (!ContractorIntelligentCache.has('test-key')) {
      throw new Error('Cache should report key exists');
    }
  });
  
  await runTest('Cache expiration', async () => {
    const testData = { test: 'expiring-data' };
    
    ContractorIntelligentCache.set('expiring-key', testData, 100); // 100ms TTL
    
    // Should exist immediately
    if (!ContractorIntelligentCache.get('expiring-key')) {
      throw new Error('Data should exist immediately after caching');
    }
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Should be expired
    if (ContractorIntelligentCache.get('expiring-key')) {
      throw new Error('Data should be expired');
    }
  });
  
  await runTest('Access tracking', () => {
    const testData = { test: 'tracked-data' };
    
    ContractorIntelligentCache.set('tracked-key', testData);
    
    // Access multiple times
    ContractorIntelligentCache.get('tracked-key');
    ContractorIntelligentCache.get('tracked-key');
    ContractorIntelligentCache.get('tracked-key');
    
    const stats = ContractorIntelligentCache.getStats();
    
    if (stats.averageAccessCount < 3) {
      throw new Error('Access count not tracked correctly');
    }
  });
  
  await runTest('Cache size management', () => {
    // Add multiple entries
    for (let i = 0; i < 10; i++) {
      ContractorIntelligentCache.set(`key-${i}`, { data: `value-${i}`, index: i });
    }
    
    const stats = ContractorIntelligentCache.getStats();
    
    if (stats.entries !== 10) {
      throw new Error(`Expected 10 entries, got ${stats.entries}`);
    }
    
    if (stats.sizeBytes <= 0) {
      throw new Error('Cache size should be greater than 0');
    }
    
    if (stats.sizeMB <= 0) {
      throw new Error('Cache size in MB should be greater than 0');
    }
  });
  
  await runTest('Cache statistics', () => {
    const stats = ContractorIntelligentCache.getStats();
    
    if (typeof stats.entries !== 'number') {
      throw new Error('Invalid entries count');
    }
    
    if (typeof stats.sizeBytes !== 'number') {
      throw new Error('Invalid size in bytes');
    }
    
    if (typeof stats.sizeMB !== 'number') {
      throw new Error('Invalid size in MB');
    }
    
    if (typeof stats.hitRate !== 'number') {
      throw new Error('Invalid hit rate');
    }
  });
  
  // Cleanup
  ContractorIntelligentCache.destroy();
}

async function testIntegration(): Promise<void> {
  logHeader('Testing Integration');
  
  const mockData = generateMockContractors(500);
  
  await runTest('End-to-end performance pipeline', async () => {
    // Clear all caches
    ContractorDataProcessor.clearCaches();
    ContractorIntelligentCache.clear();
    ContractorRequestManager.clearAll();
    ContractorPerformanceMonitor.clearMetrics();
    
    // Initialize intelligent cache
    ContractorIntelligentCache.initialize();
    
    const filters: ContractorFilters = {
      status: 'Active',
      search: 'Service',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };
    
    // Step 1: Filter data (should be cached)
    const startTime = performance.now();
    
    const filtered = await ContractorPerformanceMonitor.measureOperation(
      'filter',
      () => ContractorDataProcessor.filterContractors(mockData, filters),
      mockData.length
    );
    
    // Step 2: Sort filtered data
    const sorted = await ContractorPerformanceMonitor.measureOperation(
      'sort',
      () => ContractorDataProcessor.sortContractors(filtered, 'contractor_name', 'asc'),
      filtered.length
    );
    
    // Step 3: Paginate sorted data
    const paginated = await ContractorPerformanceMonitor.measureOperation(
      'paginate',
      () => ContractorPagination.paginate(sorted, 1, 25),
      sorted.length
    );
    
    // Step 4: Calculate virtual scroll
    const virtualScroll = ContractorVirtualScroll.calculateVirtualScroll(
      0,
      paginated.data.length,
      { threshold: 20 }
    );
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    logInfo(`Total pipeline time: ${totalTime.toFixed(2)}ms`);
    
    // Verify results
    if (filtered.length >= mockData.length) {
      throw new Error('Filtering should reduce dataset');
    }
    
    if (paginated.data.length > 25) {
      throw new Error('Pagination should limit results to 25');
    }
    
    // Check performance stats
    const perfStats = ContractorPerformanceMonitor.getPerformanceStats();
    if (perfStats.totalOperations < 3) {
      throw new Error('Performance monitoring not working');
    }
    
    // Check cache stats
    const cacheStats = ContractorDataProcessor.getCacheStats();
    if (cacheStats.totalCacheEntries === 0) {
      throw new Error('Caching not working');
    }
    
    logInfo(`Performance stats: ${perfStats.totalOperations} operations, ${perfStats.averageDuration.toFixed(2)}ms avg`);
    logInfo(`Cache stats: ${cacheStats.totalCacheEntries} entries`);
  });
  
  await runTest('Memory optimization integration', () => {
    // Create display subset
    const subset = ContractorMemoryOptimizer.createDisplaySubset(
      mockData.slice(0, 100),
      ['id', 'contractor_name', 'status', 'contract_yearly_amount']
    );
    
    // Create lazy loader
    const loader = ContractorMemoryOptimizer.createLazyLoader(mockData, 50);
    
    // Verify integration
    if (subset.length !== 100) {
      throw new Error('Display subset size mismatch');
    }
    
    if (loader.getTotalBatches() !== 10) {
      throw new Error('Lazy loader batch count mismatch');
    }
    
    // Test batch loading
    const batch1 = loader.loadBatch(0);
    const batch2 = loader.loadBatch(50);
    
    if (batch1.length !== 50 || batch2.length !== 50) {
      throw new Error('Batch loading not working correctly');
    }
    
    if (batch1[0].id === batch2[0].id) {
      throw new Error('Batches should contain different data');
    }
  });
}

// Performance benchmarks
async function runPerformanceBenchmarks(): Promise<void> {
  logHeader('Performance Benchmarks');
  
  const smallDataset = generateMockContractors(100);
  const mediumDataset = generateMockContractors(1000);
  const largeDataset = generateMockContractors(5000);
  
  const filters: ContractorFilters = {
    status: 'Active',
    search: 'Service',
    contractType: 'all',
    dateRange: null,
    serviceCategory: null
  };
  
  // Filtering benchmarks
  logInfo('\n📊 Filtering Performance:');
  await benchmarkOperation(
    'Filter 100 items',
    () => ContractorDataProcessor.filterContractors(smallDataset, filters, false),
    50
  );
  
  await benchmarkOperation(
    'Filter 1000 items',
    () => ContractorDataProcessor.filterContractors(mediumDataset, filters, false),
    20
  );
  
  await benchmarkOperation(
    'Filter 5000 items',
    () => ContractorDataProcessor.filterContractors(largeDataset, filters, false),
    10
  );
  
  // Sorting benchmarks
  logInfo('\n📊 Sorting Performance:');
  await benchmarkOperation(
    'Sort 100 items',
    () => ContractorDataProcessor.sortContractors(smallDataset, 'contractor_name', 'asc', false),
    50
  );
  
  await benchmarkOperation(
    'Sort 1000 items',
    () => ContractorDataProcessor.sortContractors(mediumDataset, 'contractor_name', 'asc', false),
    20
  );
  
  await benchmarkOperation(
    'Sort 5000 items',
    () => ContractorDataProcessor.sortContractors(largeDataset, 'contractor_name', 'asc', false),
    10
  );
  
  // Pagination benchmarks
  logInfo('\n📊 Pagination Performance:');
  await benchmarkOperation(
    'Paginate 1000 items',
    () => ContractorPagination.paginate(mediumDataset, 1, 25),
    100
  );
  
  await benchmarkOperation(
    'Paginate 5000 items',
    () => ContractorPagination.paginate(largeDataset, 1, 50),
    100
  );
  
  // Virtual scrolling benchmarks
  logInfo('\n📊 Virtual Scrolling Performance:');
  await benchmarkOperation(
    'Virtual scroll calculation (1000 items)',
    () => ContractorVirtualScroll.calculateVirtualScroll(300, 1000),
    100
  );
  
  await benchmarkOperation(
    'Virtual scroll calculation (5000 items)',
    () => ContractorVirtualScroll.calculateVirtualScroll(1500, 5000),
    100
  );
}

// Generate summary report
function generateSummaryReport(): void {
  logHeader('Test Summary Report');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDuration = testResults.reduce((sum, t) => sum + t.duration, 0);
  const averageDuration = totalDuration / totalTests;
  
  log(`\n📊 Test Results:`);
  log(`   Total Tests: ${totalTests}`);
  log(`   Passed: ${colors.green}${passedTests}${colors.reset}`);
  log(`   Failed: ${colors.red}${failedTests}${colors.reset}`);
  log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  log(`   Total Duration: ${totalDuration.toFixed(2)}ms`);
  log(`   Average Duration: ${averageDuration.toFixed(2)}ms`);
  
  if (failedTests > 0) {
    log(`\n❌ Failed Tests:`);
    testResults
      .filter(t => !t.passed)
      .forEach(t => {
        log(`   • ${t.name}: ${t.error}`, colors.red);
      });
  }
  
  // Performance insights
  const slowTests = testResults
    .filter(t => t.passed && t.duration > 100)
    .sort((a, b) => b.duration - a.duration);
  
  if (slowTests.length > 0) {
    log(`\n⚠️  Slow Tests (>100ms):`);
    slowTests.slice(0, 5).forEach(t => {
      log(`   • ${t.name}: ${t.duration.toFixed(2)}ms`, colors.yellow);
    });
  }
  
  // Final status
  if (failedTests === 0) {
    logSuccess(`\n🎉 All tests passed! Performance optimization implementation is working correctly.`);
  } else {
    logError(`\n💥 ${failedTests} test(s) failed. Please review the implementation.`);
  }
}

// Main execution
async function main(): Promise<void> {
  log(`${colors.bold}${colors.blue}Contractor Performance Optimization Validation${colors.reset}`);
  log(`Testing all performance features including pagination, virtual scrolling, caching, and request optimization\n`);
  
  try {
    // Run all test suites
    await testPagination();
    await testVirtualScrolling();
    await testDataProcessing();
    await testPerformanceMonitoring();
    await testMemoryOptimization();
    await testRequestManagement();
    await testIntelligentCaching();
    await testIntegration();
    
    // Run performance benchmarks
    await runPerformanceBenchmarks();
    
    // Generate summary report
    generateSummaryReport();
    
  } catch (error) {
    logError(`\nUnexpected error during validation: ${error}`);
    process.exit(1);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logError(`Fatal error: ${error}`);
    process.exit(1);
  });
}

export { main as validatePerformanceOptimization };