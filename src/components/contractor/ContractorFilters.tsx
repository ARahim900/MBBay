import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Building,
  FileText,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ContractorFilters as IContractorFilters, Contractor } from '../../types/contractor';
import { getThemeValue } from '../../lib/theme';

interface ContractorFiltersProps {
  filters: IContractorFilters;
  onFiltersChange: (filters: IContractorFilters) => void;
  data: Contractor[];
  className?: string;
}

/**
 * ContractorFilters - Enhanced filtering and search interface
 * 
 * Requirements covered:
 * - 7.1: Search input with real-time filtering by contractor name and service
 * - 7.2: Status filter dropdown with Active/Expired/All options
 * - 7.3: Contract type filter and date range filtering
 * - 7.4: Date range filtering by start date, end date, or expiration periods
 * - 7.5: Multiple filters with AND logic and real-time updates
 */
export const ContractorFilters: React.FC<ContractorFiltersProps> = ({
  filters,
  onFiltersChange,
  data,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get unique service categories from data for filtering
  const serviceCategories = useMemo(() => {
    const categories = new Set<string>();
    data.forEach(contractor => {
      // Extract service category (first word or first few words)
      const serviceWords = contractor.service_provided.split(' ');
      const category = serviceWords.length > 2 
        ? serviceWords.slice(0, 2).join(' ')
        : serviceWords[0] || 'Other';
      categories.add(category);
    });
    return Array.from(categories).sort();
  }, [data]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof IContractorFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  // Handle search input with debouncing
  const handleSearchChange = useCallback((value: string) => {
    handleFilterChange('search', value);
  }, [handleFilterChange]);

  // Handle date range changes
  const handleDateRangeChange = useCallback((start: string, end: string) => {
    if (start && end) {
      handleFilterChange('dateRange', { start, end });
    } else {
      handleFilterChange('dateRange', null);
    }
  }, [handleFilterChange]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      status: 'all',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    });
  }, [onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.search !== '' ||
           filters.status !== 'all' ||
           filters.contractType !== 'all' ||
           filters.dateRange !== null ||
           filters.serviceCategory !== null;
  }, [filters]);

  // Get filter count for display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.status !== 'all') count++;
    if (filters.contractType !== 'all') count++;
    if (filters.dateRange !== null) count++;
    if (filters.serviceCategory !== null) count++;
    return count;
  }, [filters]);

  // Quick filter presets
  const quickFilters = [
    {
      label: 'Active Contracts',
      filters: { ...filters, status: 'Active' as const },
      icon: Building,
      color: getThemeValue('colors.status.success', '#10b981')
    },
    {
      label: 'Expiring Soon',
      filters: { 
        ...filters, 
        status: 'Active' as const,
        dateRange: {
          start: new Date().toISOString().split('T')[0],
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },
      icon: Clock,
      color: getThemeValue('colors.status.warning', '#f59e0b')
    },
    {
      label: 'Contracts Only',
      filters: { ...filters, contractType: 'Contract' as const },
      icon: FileText,
      color: getThemeValue('colors.primary', '#2D9CDB')
    }
  ];

  return (
    <Card className={`${className}`}>
      {/* Main Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <label htmlFor="contractor-search" className="sr-only">
            Search contractors, services, or notes
          </label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
          <input
            id="contractor-search"
            type="text"
            placeholder="Search contractors, services, or notes..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors min-h-[44px]"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
            aria-label="Search contractors by name, service, or notes"
            role="searchbox"
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Search through contractor names, services provided, and notes
          </div>
          {filters.search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Clear search"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">
              Filter by contract status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px] min-h-[44px]"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
              aria-label="Filter contractors by status"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Contract Type Filter */}
          <div>
            <label htmlFor="type-filter" className="sr-only">
              Filter by contract type
            </label>
            <select
              id="type-filter"
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[120px] min-h-[44px]"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
              aria-label="Filter contractors by contract type"
            >
              <option value="all">All Types</option>
              <option value="Contract">Contract</option>
              <option value="PO">Purchase Order</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 relative"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full text-xs font-medium flex items-center justify-center text-white"
                style={{ backgroundColor: getThemeValue('colors.primary', '#2D9CDB') }}
              >
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Quick Filter Presets */}
          <div>
            <label 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((preset, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange(preset.filters)}
                  className="flex items-center gap-2 text-sm"
                  style={{ 
                    borderColor: preset.color + '40',
                    color: preset.color
                  }}
                >
                  <preset.icon className="h-4 w-4" />
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Service Category Filter */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Service Category
              </label>
              <select
                value={filters.serviceCategory || ''}
                onChange={(e) => handleFilterChange('serviceCategory', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                <option value="">All Services</option>
                {serviceCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contract Period
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange(
                    e.target.value, 
                    filters.dateRange?.end || ''
                  )}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                    fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                  }}
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange(
                    filters.dateRange?.start || '', 
                    e.target.value
                  )}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  style={{ 
                    fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                    fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                  }}
                  placeholder="End date"
                />
              </div>
              {filters.dateRange && (
                <button
                  onClick={() => handleFilterChange('dateRange', null)}
                  className="mt-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear date range
                </button>
              )}
            </div>

            {/* Date Range Presets */}
            <div>
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Quick Date Ranges
              </label>
              <div className="space-y-1">
                {[
                  {
                    label: 'Expiring in 30 days',
                    range: {
                      start: new Date().toISOString().split('T')[0],
                      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                  },
                  {
                    label: 'Expiring in 90 days',
                    range: {
                      start: new Date().toISOString().split('T')[0],
                      end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    }
                  },
                  {
                    label: 'This year',
                    range: {
                      start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                      end: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]
                    }
                  }
                ].map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleFilterChange('dateRange', preset.range)}
                    className="block w-full text-left px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  style={{ 
                    fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                    fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                  }}
                >
                  Active filters:
                </span>
                
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange('search', '')}
                      className="hover:text-blue-600 dark:hover:text-blue-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.status !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded-full">
                    Status: {filters.status}
                    <button
                      onClick={() => handleFilterChange('status', 'all')}
                      className="hover:text-green-600 dark:hover:text-green-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.contractType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                    Type: {filters.contractType}
                    <button
                      onClick={() => handleFilterChange('contractType', 'all')}
                      className="hover:text-purple-600 dark:hover:text-purple-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.serviceCategory && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                    Service: {filters.serviceCategory}
                    <button
                      onClick={() => handleFilterChange('serviceCategory', null)}
                      className="hover:text-orange-600 dark:hover:text-orange-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.dateRange && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                    Date: {filters.dateRange.start} to {filters.dateRange.end}
                    <button
                      onClick={() => handleFilterChange('dateRange', null)}
                      className="hover:text-yellow-600 dark:hover:text-yellow-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};