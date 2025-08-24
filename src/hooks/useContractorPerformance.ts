import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  ContractorPagination, 
  ContractorVirtualScroll, 
  ContractorDataProcessor,
  ContractorPerformanceMonitor,
  ContractorMemoryOptimizer,
  type PaginationResult,
  type VirtualScrollResult
} from '../utils/contractor-performance';
import { 
  ContractorRequestManager,
  ContractorIntelligentCache,
  OptimizedContractorAPI
} from '../utils/contractor-request-manager';
import type { Contractor, ContractorFilters } from '../types/contractor';

interface UseContractorPerformanceOptions {
  enableVirtualScrolling?: boolean;
  enableIntelligentCaching?: boolean;
  enableRequestDeduplication?: boolean;
  pageSize?: number;
  virtualScrollConfig?: {
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
    threshold?: number;
  };
  performanceMonitoring?: boolean;
}

interface ContractorPerformanceState {
  // Data
  allData: Contractor[];
  filteredData: Contractor[];
  paginatedData: Contractor[];
  
  // Pagination
  pagination: PaginationResult<Contractor>['pagination'];
  
  // Virtual scrolling
  virtualScroll: VirtualScrollResult;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Performance metrics
  performanceStats: ReturnType<typeof ContractorPerformanceMonitor.getPerformanceStats>;
  cacheStats: ReturnType<typeof ContractorIntelligentCache.getStats>;
  requestStats: ReturnType<typeof ContractorRequestManager.getStats>;
}

interface ContractorPerformanceActions {
  // Data operations
  setFilters: (filters: ContractorFilters) => void;
  setSorting: (field: keyof Contractor, direction: 'asc' | 'desc') => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Virtual scrolling
  updateScrollPosition: (scrollTop: number) => void;
  
  // Performance
  clearCaches: () => void;
  refreshData: (force?: boolean) => Promise<void>;
  
  // Memory management
  optimizeMemory: () => void;
}

/**
 * High-performance contractor data management hook
 * Integrates pagination, virtual scrolling, caching, and request optimization
 */
export const useContractorPerformance = (
  initialData: Contractor[] = [],
  options: UseContractorPerformanceOptions = {}
): ContractorPerformanceState & ContractorPerformanceActions => {
  const {
    enableVirtualScrolling = true,
    enableIntelligentCaching = true,
    enableRequestDeduplication = true,
    pageSize: initialPageSize = 25,
    virtualScrollConfig = {},
    performanceMonitoring = true
  } = options;

  // State
  const [allData, setAllData] = useState<Contractor[]>(initialData);
  const [filters, setFilters] = useState<ContractorFilters>({
    status: 'all',
    search: '',
    contractType: 'all',
    dateRange: null,
    serviceCategory: null
  });
  const [sortField, setSortField] = useState<keyof Contractor>('contractor_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Performance tracking
  const [performanceStats, setPerformanceStats] = useState(
    ContractorPerformanceMonitor.getPerformanceStats()
  );
  const [cacheStats, setCacheStats] = useState(
    ContractorIntelligentCache.getStats()
  );
  const [requestStats, setRequestStats] = useState(
    ContractorRequestManager.getStats()
  );

  // Refs for performance optimization
  const lastFiltersRef = useRef<ContractorFilters>(filters);
  const lastSortRef = useRef({ field: sortField, direction: sortDirection });
  const performanceUpdateTimer = useRef<NodeJS.Timeout>();

  // Memoized filtered and sorted data with performance monitoring
  const processedData = useMemo(() => {
    const startTime = performance.now();
    
    try {
      // Check if we can use cached results
      const filtersChanged = JSON.stringify(filters) !== JSON.stringify(lastFiltersRef.current);
      const sortChanged = sortField !== lastSortRef.current.field || 
                          sortDirection !== lastSortRef.current.direction;

      let result: Contractor[];

      if (performanceMonitoring) {
        result = ContractorPerformanceMonitor.measureOperation(
          'filter',
          () => ContractorDataProcessor.filterAndSort(
            allData,
            filters,
            sortField,
            sortDirection,
            enableIntelligentCaching
          ),
          allData.length
        ) as Contractor[];
      } else {
        result = ContractorDataProcessor.filterAndSort(
          allData,
          filters,
          sortField,
          sortDirection,
          enableIntelligentCaching
        );
      }

      // Update refs
      lastFiltersRef.current = filters;
      lastSortRef.current = { field: sortField, direction: sortDirection };

      const endTime = performance.now();
      console.log(`Data processing took ${endTime - startTime}ms for ${allData.length} items`);

      return result;
    } catch (err) {
      console.error('Error processing contractor data:', err);
      setError(err instanceof Error ? err.message : 'Data processing failed');
      return [];
    }
  }, [allData, filters, sortField, sortDirection, enableIntelligentCaching, performanceMonitoring]);

  // Memoized pagination
  const paginationResult = useMemo(() => {
    if (performanceMonitoring) {
      return ContractorPerformanceMonitor.measureOperation(
        'paginate',
        () => ContractorPagination.paginate(processedData, currentPage, pageSize),
        processedData.length
      ) as PaginationResult<Contractor>;
    }
    
    return ContractorPagination.paginate(processedData, currentPage, pageSize);
  }, [processedData, currentPage, pageSize, performanceMonitoring]);

  // Memoized virtual scroll calculation
  const virtualScrollResult = useMemo(() => {
    if (!enableVirtualScrolling) {
      return {
        startIndex: 0,
        endIndex: paginationResult.data.length,
        visibleItems: paginationResult.data.length,
        totalHeight: paginationResult.data.length * 60,
        offsetY: 0,
        shouldVirtualize: false
      };
    }

    const config = {
      itemHeight: 60,
      containerHeight: 400,
      overscan: 5,
      threshold: 50,
      ...virtualScrollConfig
    };

    return ContractorVirtualScroll.calculateVirtualScroll(
      scrollTop,
      paginationResult.data.length,
      config
    );
  }, [enableVirtualScrolling, scrollTop, paginationResult.data.length, virtualScrollConfig]);

  // Get final data for rendering (considering virtual scrolling)
  const finalData = useMemo(() => {
    if (!virtualScrollResult.shouldVirtualize) {
      return paginationResult.data;
    }

    return paginationResult.data.slice(
      virtualScrollResult.startIndex,
      virtualScrollResult.endIndex
    );
  }, [paginationResult.data, virtualScrollResult]);

  // Load data with performance optimization
  const loadData = useCallback(async (force: boolean = false) => {
    if (!enableRequestDeduplication && !enableIntelligentCaching) {
      // Fallback to basic loading
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const contractors = await OptimizedContractorAPI.getAllContractors(!force);
      setAllData(contractors);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error loading contractor data:', err);
    } finally {
      setLoading(false);
    }
  }, [enableRequestDeduplication, enableIntelligentCaching]);

  // Update performance stats periodically
  useEffect(() => {
    if (!performanceMonitoring) return;

    const updateStats = () => {
      setPerformanceStats(ContractorPerformanceMonitor.getPerformanceStats());
      setCacheStats(ContractorIntelligentCache.getStats());
      setRequestStats(ContractorRequestManager.getStats());
    };

    // Update immediately
    updateStats();

    // Set up periodic updates
    performanceUpdateTimer.current = setInterval(updateStats, 5000); // Every 5 seconds

    return () => {
      if (performanceUpdateTimer.current) {
        clearInterval(performanceUpdateTimer.current);
      }
    };
  }, [performanceMonitoring]);

  // Auto-optimize memory when data changes significantly
  useEffect(() => {
    if (allData.length > 1000) {
      // Debounce memory optimization
      const timer = setTimeout(() => {
        ContractorMemoryOptimizer.cleanup();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [allData.length]);

  // Load initial data
  useEffect(() => {
    if (initialData.length === 0) {
      loadData();
    }
  }, [loadData, initialData.length]);

  // Actions
  const handleSetFilters = useCallback((newFilters: ContractorFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleSetSorting = useCallback((field: keyof Contractor, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const handleSetPage = useCallback((page: number) => {
    setCurrentPage(page);
    setScrollTop(0); // Reset scroll when changing pages
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const handleUpdateScrollPosition = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  const handleClearCaches = useCallback(() => {
    ContractorDataProcessor.clearCaches();
    ContractorIntelligentCache.clear();
    ContractorRequestManager.clearAll();
    
    // Update stats
    if (performanceMonitoring) {
      setPerformanceStats(ContractorPerformanceMonitor.getPerformanceStats());
      setCacheStats(ContractorIntelligentCache.getStats());
      setRequestStats(ContractorRequestManager.getStats());
    }
    
    console.log('All caches cleared');
  }, [performanceMonitoring]);

  const handleRefreshData = useCallback(async (force: boolean = false) => {
    await loadData(force);
  }, [loadData]);

  const handleOptimizeMemory = useCallback(() => {
    ContractorMemoryOptimizer.cleanup();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    console.log('Memory optimization completed');
  }, []);

  return {
    // Data
    allData,
    filteredData: processedData,
    paginatedData: finalData,
    
    // Pagination
    pagination: paginationResult.pagination,
    
    // Virtual scrolling
    virtualScroll: virtualScrollResult,
    
    // State
    loading,
    error,
    
    // Performance metrics
    performanceStats,
    cacheStats,
    requestStats,
    
    // Actions
    setFilters: handleSetFilters,
    setSorting: handleSetSorting,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    updateScrollPosition: handleUpdateScrollPosition,
    clearCaches: handleClearCaches,
    refreshData: handleRefreshData,
    optimizeMemory: handleOptimizeMemory
  };
};

export default useContractorPerformance;