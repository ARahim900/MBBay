import type { Contractor, ContractorFilters } from '../types/contractor';

/**
 * Performance optimization utilities for contractor data management
 * Implements efficient pagination, virtual scrolling, and data processing
 */

// ==================== PAGINATION UTILITIES ====================

export interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
  };
}

/**
 * Efficient pagination with memory optimization
 */
export class ContractorPagination {
  /**
   * Paginate data efficiently with minimal memory allocation
   */
  static paginate<T>(
    data: T[],
    page: number,
    pageSize: number
  ): PaginationResult<T> {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    // Use slice for efficient array subsetting
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        currentPage,
        totalPages,
        totalItems,
        pageSize,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startIndex,
        endIndex
      }
    };
  }

  /**
   * Calculate optimal page size based on viewport and data complexity
   */
  static calculateOptimalPageSize(
    viewportHeight: number,
    itemHeight: number = 60,
    bufferMultiplier: number = 2
  ): number {
    const visibleItems = Math.floor(viewportHeight / itemHeight);
    const optimalSize = Math.max(10, visibleItems * bufferMultiplier);
    
    // Cap at reasonable maximum to prevent memory issues
    return Math.min(optimalSize, 100);
  }

  /**
   * Pre-calculate pagination metadata for efficient navigation
   */
  static getPaginationMetadata(
    totalItems: number,
    pageSize: number
  ): {
    totalPages: number;
    pageSizes: number[];
    recommendedPageSize: number;
  } {
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Suggest different page sizes based on data volume
    const pageSizes = totalItems > 1000 
      ? [25, 50, 100, 200]
      : totalItems > 100
      ? [10, 25, 50, 100]
      : [5, 10, 25, 50];
    
    // Recommend page size based on data volume
    const recommendedPageSize = totalItems > 1000 ? 50 
      : totalItems > 100 ? 25 
      : 10;
    
    return {
      totalPages,
      pageSizes,
      recommendedPageSize
    };
  }
}

// ==================== VIRTUAL SCROLLING ====================

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number; // Number of items to render outside visible area
  threshold: number; // Minimum items before enabling virtualization
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  totalHeight: number;
  offsetY: number;
  shouldVirtualize: boolean;
}

/**
 * Virtual scrolling implementation for large datasets
 */
export class ContractorVirtualScroll {
  private static readonly DEFAULT_CONFIG: VirtualScrollConfig = {
    itemHeight: 60,
    containerHeight: 400,
    overscan: 5,
    threshold: 50
  };

  /**
   * Calculate virtual scroll parameters
   */
  static calculateVirtualScroll(
    scrollTop: number,
    totalItems: number,
    config: Partial<VirtualScrollConfig> = {}
  ): VirtualScrollResult {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const { itemHeight, containerHeight, overscan, threshold } = finalConfig;

    const shouldVirtualize = totalItems > threshold;
    
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: totalItems,
        visibleItems: totalItems,
        totalHeight: totalItems * itemHeight,
        offsetY: 0,
        shouldVirtualize: false
      };
    }

    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems,
      startIndex + visibleItems + (overscan * 2)
    );

    return {
      startIndex,
      endIndex,
      visibleItems: endIndex - startIndex,
      totalHeight: totalItems * itemHeight,
      offsetY: startIndex * itemHeight,
      shouldVirtualize: true
    };
  }

  /**
   * Create virtual scroll item renderer
   */
  static createVirtualRenderer<T>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    virtualScroll: VirtualScrollResult
  ): {
    visibleItems: T[];
    renderItems: () => React.ReactNode[];
    spacerTop: number;
    spacerBottom: number;
  } {
    if (!virtualScroll.shouldVirtualize) {
      return {
        visibleItems: items,
        renderItems: () => items.map(renderItem),
        spacerTop: 0,
        spacerBottom: 0
      };
    }

    const visibleItems = items.slice(virtualScroll.startIndex, virtualScroll.endIndex);
    const spacerTop = virtualScroll.startIndex * 60; // Assuming 60px item height
    const spacerBottom = (items.length - virtualScroll.endIndex) * 60;

    return {
      visibleItems,
      renderItems: () => visibleItems.map((item, index) => 
        renderItem(item, virtualScroll.startIndex + index)
      ),
      spacerTop,
      spacerBottom
    };
  }
}

// ==================== DATA PROCESSING OPTIMIZATION ====================

/**
 * Optimized filtering and sorting for large datasets
 */
export class ContractorDataProcessor {
  private static filterCache = new Map<string, Contractor[]>();
  private static sortCache = new Map<string, Contractor[]>();

  /**
   * Generate cache key for filters
   */
  private static generateFilterKey(
    filters: ContractorFilters,
    dataHash: string
  ): string {
    return `${dataHash}_${JSON.stringify(filters)}`;
  }

  /**
   * Generate cache key for sorting
   */
  private static generateSortKey(
    field: keyof Contractor,
    direction: 'asc' | 'desc',
    dataHash: string
  ): string {
    return `${dataHash}_${field}_${direction}`;
  }

  /**
   * Generate simple hash for data array
   */
  private static generateDataHash(data: Contractor[]): string {
    return `${data.length}_${data[0]?.updated_at || ''}_${data[data.length - 1]?.updated_at || ''}`;
  }

  /**
   * Optimized filtering with caching
   */
  static filterContractors(
    data: Contractor[],
    filters: ContractorFilters,
    useCache: boolean = true
  ): Contractor[] {
    if (data.length === 0) return [];

    const dataHash = this.generateDataHash(data);
    const cacheKey = this.generateFilterKey(filters, dataHash);

    // Check cache first
    if (useCache && this.filterCache.has(cacheKey)) {
      console.log('Using cached filter results');
      return this.filterCache.get(cacheKey)!;
    }

    console.log('Computing filter results...');
    const startTime = performance.now();

    // Optimized filtering with early returns
    const filtered = data.filter(contractor => {
      // Status filter (most selective first)
      if (filters.status !== 'all' && contractor.status !== filters.status) {
        return false;
      }

      // Contract type filter
      if (filters.contractType !== 'all' && contractor.contract_type !== filters.contractType) {
        return false;
      }

      // Search filter (expensive, do last)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${contractor.contractor_name} ${contractor.service_provided} ${contractor.notes || ''}`.toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const startDate = new Date(contractor.start_date);
        const endDate = new Date(contractor.end_date);
        const filterStart = new Date(filters.dateRange.start);
        const filterEnd = new Date(filters.dateRange.end);
        
        const overlaps = (
          (startDate >= filterStart && startDate <= filterEnd) ||
          (endDate >= filterStart && endDate <= filterEnd) ||
          (startDate <= filterStart && endDate >= filterEnd)
        );
        
        if (!overlaps) {
          return false;
        }
      }

      // Service category filter
      if (filters.serviceCategory) {
        const serviceWords = contractor.service_provided.split(' ');
        const category = serviceWords.length > 2 
          ? serviceWords.slice(0, 2).join(' ')
          : serviceWords[0] || 'Other';
        
        if (category !== filters.serviceCategory) {
          return false;
        }
      }

      return true;
    });

    const endTime = performance.now();
    console.log(`Filter processing took ${endTime - startTime}ms for ${data.length} items`);

    // Cache results
    if (useCache) {
      this.filterCache.set(cacheKey, filtered);
      
      // Limit cache size
      if (this.filterCache.size > 50) {
        const firstKey = this.filterCache.keys().next().value;
        this.filterCache.delete(firstKey);
      }
    }

    return filtered;
  }

  /**
   * Optimized sorting with caching
   */
  static sortContractors(
    data: Contractor[],
    field: keyof Contractor,
    direction: 'asc' | 'desc' = 'asc',
    useCache: boolean = true
  ): Contractor[] {
    if (data.length === 0) return [];

    const dataHash = this.generateDataHash(data);
    const cacheKey = this.generateSortKey(field, direction, dataHash);

    // Check cache first
    if (useCache && this.sortCache.has(cacheKey)) {
      console.log('Using cached sort results');
      return this.sortCache.get(cacheKey)!;
    }

    console.log('Computing sort results...');
    const startTime = performance.now();

    // Create a copy to avoid mutating original array
    const sorted = [...data].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? 1 : -1;
      if (bValue == null) return direction === 'asc' ? -1 : 1;
      
      // Optimize for common field types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (field.includes('date')) {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // String comparison with locale support
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();
      const comparison = strA.localeCompare(strB);
      return direction === 'asc' ? comparison : -comparison;
    });

    const endTime = performance.now();
    console.log(`Sort processing took ${endTime - startTime}ms for ${data.length} items`);

    // Cache results
    if (useCache) {
      this.sortCache.set(cacheKey, sorted);
      
      // Limit cache size
      if (this.sortCache.size > 50) {
        const firstKey = this.sortCache.keys().next().value;
        this.sortCache.delete(firstKey);
      }
    }

    return sorted;
  }

  /**
   * Combined filter and sort operation (more efficient than separate operations)
   */
  static filterAndSort(
    data: Contractor[],
    filters: ContractorFilters,
    sortField: keyof Contractor,
    sortDirection: 'asc' | 'desc' = 'asc',
    useCache: boolean = true
  ): Contractor[] {
    // For large datasets, filter first to reduce sort workload
    const filtered = this.filterContractors(data, filters, useCache);
    return this.sortContractors(filtered, sortField, sortDirection, useCache);
  }

  /**
   * Clear processing caches
   */
  static clearCaches(): void {
    this.filterCache.clear();
    this.sortCache.clear();
    console.log('Cleared data processing caches');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    filterCacheSize: number;
    sortCacheSize: number;
    totalCacheEntries: number;
  } {
    return {
      filterCacheSize: this.filterCache.size,
      sortCacheSize: this.sortCache.size,
      totalCacheEntries: this.filterCache.size + this.sortCache.size
    };
  }
}

// ==================== PERFORMANCE MONITORING ====================

export interface PerformanceMetrics {
  operationType: 'filter' | 'sort' | 'paginate' | 'render';
  duration: number;
  itemCount: number;
  timestamp: number;
  cacheHit?: boolean;
}

/**
 * Performance monitoring for contractor operations
 */
export class ContractorPerformanceMonitor {
  private static metrics: PerformanceMetrics[] = [];
  private static readonly MAX_METRICS = 100;

  /**
   * Record performance metric
   */
  static recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * Measure operation performance
   */
  static async measureOperation<T>(
    operationType: PerformanceMetrics['operationType'],
    operation: () => T | Promise<T>,
    itemCount: number,
    cacheHit?: boolean
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      
      this.recordMetric({
        operationType,
        duration: endTime - startTime,
        itemCount,
        timestamp: Date.now(),
        cacheHit
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      this.recordMetric({
        operationType,
        duration: endTime - startTime,
        itemCount,
        timestamp: Date.now(),
        cacheHit: false
      });
      
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    averageDuration: number;
    totalOperations: number;
    cacheHitRate: number;
    operationBreakdown: Record<string, { count: number; avgDuration: number }>;
    recentMetrics: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        averageDuration: 0,
        totalOperations: 0,
        cacheHitRate: 0,
        operationBreakdown: {},
        recentMetrics: []
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / this.metrics.length;
    
    const cacheHits = this.metrics.filter(m => m.cacheHit === true).length;
    const cacheableOperations = this.metrics.filter(m => m.cacheHit !== undefined).length;
    const cacheHitRate = cacheableOperations > 0 ? (cacheHits / cacheableOperations) * 100 : 0;

    // Operation breakdown
    const operationBreakdown: Record<string, { count: number; avgDuration: number }> = {};
    
    this.metrics.forEach(metric => {
      if (!operationBreakdown[metric.operationType]) {
        operationBreakdown[metric.operationType] = { count: 0, avgDuration: 0 };
      }
      operationBreakdown[metric.operationType].count++;
    });

    Object.keys(operationBreakdown).forEach(opType => {
      const opMetrics = this.metrics.filter(m => m.operationType === opType);
      const opTotalDuration = opMetrics.reduce((sum, m) => sum + m.duration, 0);
      operationBreakdown[opType].avgDuration = opTotalDuration / opMetrics.length;
    });

    return {
      averageDuration,
      totalOperations: this.metrics.length,
      cacheHitRate,
      operationBreakdown,
      recentMetrics: this.metrics.slice(-10) // Last 10 operations
    };
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
    console.log('Cleared performance metrics');
  }

  /**
   * Check if performance is degrading
   */
  static isPerformanceDegrading(): boolean {
    if (this.metrics.length < 10) return false;

    const recent = this.metrics.slice(-5);
    const older = this.metrics.slice(-10, -5);

    const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.duration, 0) / older.length;

    // Consider performance degrading if recent operations are 50% slower
    return recentAvg > olderAvg * 1.5;
  }
}

// ==================== MEMORY OPTIMIZATION ====================

/**
 * Memory optimization utilities
 */
export class ContractorMemoryOptimizer {
  /**
   * Create memory-efficient contractor subset for display
   */
  static createDisplaySubset(
    contractors: Contractor[],
    fields: (keyof Contractor)[]
  ): Partial<Contractor>[] {
    return contractors.map(contractor => {
      const subset: Partial<Contractor> = {};
      fields.forEach(field => {
        subset[field] = contractor[field];
      });
      return subset;
    });
  }

  /**
   * Lazy load contractor details
   */
  static createLazyLoader(
    contractors: Contractor[],
    batchSize: number = 20
  ): {
    loadBatch: (startIndex: number) => Contractor[];
    getTotalBatches: () => number;
    preloadNextBatch: (currentIndex: number) => void;
  } {
    const batches = new Map<number, Contractor[]>();
    
    return {
      loadBatch: (startIndex: number) => {
        const batchIndex = Math.floor(startIndex / batchSize);
        
        if (!batches.has(batchIndex)) {
          const start = batchIndex * batchSize;
          const end = Math.min(start + batchSize, contractors.length);
          batches.set(batchIndex, contractors.slice(start, end));
        }
        
        return batches.get(batchIndex)!;
      },
      
      getTotalBatches: () => Math.ceil(contractors.length / batchSize),
      
      preloadNextBatch: (currentIndex: number) => {
        const nextBatchIndex = Math.floor(currentIndex / batchSize) + 1;
        const start = nextBatchIndex * batchSize;
        
        if (start < contractors.length && !batches.has(nextBatchIndex)) {
          const end = Math.min(start + batchSize, contractors.length);
          batches.set(nextBatchIndex, contractors.slice(start, end));
        }
      }
    };
  }

  /**
   * Clean up unused data references
   */
  static cleanup(): void {
    ContractorDataProcessor.clearCaches();
    ContractorPerformanceMonitor.clearMetrics();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
  }
}