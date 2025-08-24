import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  ChevronUp,
  ChevronDown,
  Calendar,
  DollarSign,
  Building,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { ContractorFilters } from './ContractorFilters';
import { useContractorPerformance } from '../../hooks/useContractorPerformance';
import type { Contractor, ContractorFilters as IContractorFilters } from '../../types/contractor';
import { getThemeValue } from '../../lib/theme';

interface VirtualizedContractorTableProps {
  data: Contractor[];
  loading?: boolean;
  onEdit?: (contractor: Contractor) => void;
  onDelete?: (contractor: Contractor) => void;
  onView?: (contractor: Contractor) => void;
  onExport?: () => void;
  className?: string;
  height?: number;
  enableVirtualScrolling?: boolean;
  enablePerformanceMonitoring?: boolean;
}

interface PerformanceStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceStats: any;
  cacheStats: any;
  requestStats: any;
}

const PerformanceStatsModal: React.FC<PerformanceStatsModalProps> = ({
  isOpen,
  onClose,
  performanceStats,
  cacheStats,
  requestStats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance Statistics
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Operation Performance
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average Duration</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {performanceStats.averageDuration.toFixed(2)}ms
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Operations</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {performanceStats.totalOperations}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cache Hit Rate</div>
                  <div className="text-lg font-semibold text-green-600">
                    {performanceStats.cacheHitRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Cache Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Cache Statistics
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cache Entries</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cacheStats.entries}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Cache Size</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {cacheStats.sizeMB.toFixed(2)} MB
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Hit Rate</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {cacheStats.hitRate.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Request Stats */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Request Management
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {requestStats.pendingRequests}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pending Batches</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {requestStats.pendingBatches}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Timeout</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {requestStats.config.timeout / 1000}s
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operation Breakdown */}
          {Object.keys(performanceStats.operationBreakdown).length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                Operation Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(performanceStats.operationBreakdown).map(([operation, stats]) => (
                  <div key={operation} className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {operation}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {stats.count} operations
                    </div>
                    <div className="text-sm font-semibold text-blue-600 mt-1">
                      {stats.avgDuration.toFixed(2)}ms avg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export const VirtualizedContractorTable: React.FC<VirtualizedContractorTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onExport,
  className = '',
  height = 600,
  enableVirtualScrolling = true,
  enablePerformanceMonitoring = false
}) => {
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const virtualScrollRef = useRef<HTMLDivElement>(null);

  // Use performance-optimized hook
  const {
    allData,
    filteredData,
    paginatedData,
    pagination,
    virtualScroll,
    loading: performanceLoading,
    error,
    performanceStats,
    cacheStats,
    requestStats,
    setFilters,
    setSorting,
    setPage,
    setPageSize,
    updateScrollPosition,
    clearCaches,
    refreshData,
    optimizeMemory
  } = useContractorPerformance(data, {
    enableVirtualScrolling,
    enableIntelligentCaching: true,
    enableRequestDeduplication: true,
    pageSize: 50,
    virtualScrollConfig: {
      itemHeight: 60,
      containerHeight: height - 200, // Account for header and pagination
      overscan: 10,
      threshold: 100
    },
    performanceMonitoring: enablePerformanceMonitoring
  });

  const [sortField, setSortFieldState] = useState<keyof Contractor>('contractor_name');
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>('asc');

  // Handle scroll events for virtual scrolling
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    updateScrollPosition(scrollTop);
  }, [updateScrollPosition]);

  // Handle sorting
  const handleSort = useCallback((field: keyof Contractor) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortFieldState(field);
    setSortDirectionState(newDirection);
    setSorting(field, newDirection);
  }, [sortField, sortDirection, setSorting]);

  // Format currency
  const formatCurrency = useCallback((amount: number | null): string => {
    if (!amount) return 'N/A';
    return `OMR ${amount.toLocaleString()}`;
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  // Get sort icon
  const getSortIcon = useCallback((field: keyof Contractor) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  }, [sortField, sortDirection]);

  // Render virtual scrolling spacers
  const renderVirtualSpacers = () => {
    if (!virtualScroll.shouldVirtualize) return null;

    return (
      <>
        {virtualScroll.offsetY > 0 && (
          <div style={{ height: virtualScroll.offsetY }} />
        )}
        {/* Content will be rendered here */}
        <div style={{ 
          height: virtualScroll.totalHeight - virtualScroll.offsetY - (paginatedData.length * 60)
        }} />
      </>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className={className}>
      {/* Header with title and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <Building className="h-5 w-5" style={{ color: getThemeValue('colors.primary', '#2D9CDB') }} />
            High-Performance Contractor Data
            {virtualScroll.shouldVirtualize && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Virtualized
              </span>
            )}
          </h3>
          <p 
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textSecondary', '#6B7280'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            {filteredData.length} of {allData.length} contractors
            {virtualScroll.shouldVirtualize && (
              <span className="ml-2 text-blue-600">
                • Showing {virtualScroll.visibleItems} visible items
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {enablePerformanceMonitoring && (
            <Button
              onClick={() => setShowPerformanceStats(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Performance
            </Button>
          )}
          
          <Button
            onClick={clearCaches}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Clear Cache
          </Button>
          
          {onExport && (
            <Button
              onClick={onExport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-6">
        <ContractorFilters
          filters={{
            status: 'all',
            search: '',
            contractType: 'all',
            dateRange: null,
            serviceCategory: null
          }}
          onFiltersChange={setFilters}
          data={allData}
        />
      </div>

      {/* Performance indicators */}
      {enablePerformanceMonitoring && (
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Cache: {cacheStats.entries} entries ({cacheStats.sizeMB.toFixed(1)}MB)</span>
          <span>Avg: {performanceStats.averageDuration.toFixed(1)}ms</span>
          <span>Hit Rate: {performanceStats.cacheHitRate.toFixed(1)}%</span>
        </div>
      )}

      {/* Virtual Scrolling Container */}
      <div 
        ref={tableContainerRef}
        className="relative overflow-hidden"
        style={{ height: `${height}px` }}
      >
        {/* Table Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-7 gap-4 p-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div 
              className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              onClick={() => handleSort('contractor_name')}
            >
              Contractor {getSortIcon('contractor_name')}
            </div>
            <div 
              className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              onClick={() => handleSort('service_provided')}
            >
              Service {getSortIcon('service_provided')}
            </div>
            <div>Status</div>
            <div 
              className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              onClick={() => handleSort('contract_type')}
            >
              Type {getSortIcon('contract_type')}
            </div>
            <div 
              className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              onClick={() => handleSort('end_date')}
            >
              End Date {getSortIcon('end_date')}
            </div>
            <div 
              className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 text-right"
              onClick={() => handleSort('contract_yearly_amount')}
            >
              Annual Value {getSortIcon('contract_yearly_amount')}
            </div>
            <div className="text-center">Actions</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={virtualScrollRef}
          className="overflow-y-auto"
          style={{ height: `${height - 80}px` }}
          onScroll={handleScroll}
        >
          {loading || performanceLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">Error: {error}</div>
              <Button onClick={() => refreshData(true)} variant="outline" size="sm">
                Retry
              </Button>
            </div>
          ) : (
            <div style={{ height: virtualScroll.totalHeight, position: 'relative' }}>
              {/* Top spacer for virtual scrolling */}
              {virtualScroll.shouldVirtualize && virtualScroll.offsetY > 0 && (
                <div style={{ height: virtualScroll.offsetY }} />
              )}
              
              {/* Visible items */}
              <div style={{ 
                transform: virtualScroll.shouldVirtualize 
                  ? `translateY(${virtualScroll.offsetY}px)` 
                  : 'none'
              }}>
                {paginatedData.map((contractor, index) => (
                  <div 
                    key={contractor.id}
                    className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    style={{ height: '60px' }}
                  >
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {contractor.contractor_name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 truncate" title={contractor.service_provided}>
                      {contractor.service_provided}
                    </div>
                    <div>
                      <StatusBadge status={contractor.status} />
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {contractor.contract_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(contractor.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(contractor.contract_yearly_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      {onView && (
                        <Button
                          onClick={() => onView(contractor)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          onClick={() => onEdit(contractor)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(contractor)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom spacer for virtual scrolling */}
              {virtualScroll.shouldVirtualize && (
                <div style={{ 
                  height: virtualScroll.totalHeight - virtualScroll.offsetY - (paginatedData.length * 60)
                }} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {pagination.startIndex + 1}-{pagination.endIndex} of {pagination.totalItems} entries
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Performance Stats Modal */}
      <PerformanceStatsModal
        isOpen={showPerformanceStats}
        onClose={() => setShowPerformanceStats(false)}
        performanceStats={performanceStats}
        cacheStats={cacheStats}
        requestStats={requestStats}
      />
    </Card>
  );
};

export default VirtualizedContractorTable;