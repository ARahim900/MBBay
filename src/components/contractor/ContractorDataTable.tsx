import React, { useState, useMemo } from 'react';
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
  FileText
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { ContractorFilters } from './ContractorFilters';
import { Contractor, ContractorFilters as IContractorFilters } from '../../types/contractor';
import { getThemeValue } from '../../lib/theme';

interface ContractorDataTableProps {
  data: Contractor[];
  loading?: boolean;
  filters?: IContractorFilters;
  onFiltersChange?: (filters: IContractorFilters) => void;
  onEdit?: (contractor: Contractor) => void;
  onDelete?: (contractor: Contractor) => void;
  onView?: (contractor: Contractor) => void;
  onExport?: () => void;
  className?: string;
}

type SortField = keyof Contractor;
type SortDirection = 'asc' | 'desc';

export const ContractorDataTable: React.FC<ContractorDataTableProps> = ({
  data,
  loading = false,
  filters: externalFilters,
  onFiltersChange,
  onEdit,
  onDelete,
  onView,
  onExport,
  className = ''
}) => {
  // Use external filters if provided, otherwise use internal state
  const [internalFilters, setInternalFilters] = useState<IContractorFilters>({
    status: 'all',
    search: '',
    contractType: 'all',
    dateRange: null,
    serviceCategory: null
  });

  const filters = externalFilters || internalFilters;
  const setFilters = onFiltersChange || setInternalFilters;
  
  const [sortField, setSortField] = useState<SortField>('contractor_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return data.filter(contractor => {
      // Status filter
      if (filters.status !== 'all' && contractor.status !== filters.status) {
        return false;
      }
      
      // Contract type filter
      if (filters.contractType !== 'all' && contractor.contract_type !== filters.contractType) {
        return false;
      }
      
      // Search filter (contractor name, service, or notes)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          contractor.contractor_name,
          contractor.service_provided,
          contractor.notes || ''
        ];
        
        if (!searchableFields.some(field => 
          field.toLowerCase().includes(searchTerm)
        )) {
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

      // Date range filter
      if (filters.dateRange) {
        const startDate = new Date(contractor.start_date);
        const endDate = new Date(contractor.end_date);
        const filterStart = new Date(filters.dateRange.start);
        const filterEnd = new Date(filters.dateRange.end);
        
        // Check if contract period overlaps with filter range
        const overlaps = (
          (startDate >= filterStart && startDate <= filterEnd) ||
          (endDate >= filterStart && endDate <= filterEnd) ||
          (startDate <= filterStart && endDate >= filterEnd)
        );
        
        if (!overlaps) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, filters]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;
      
      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      // Handle dates
      if (sortField.includes('date')) {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Default string comparison
      const strA = String(aValue).toLowerCase();
      const strB = String(bValue).toLowerCase();
      const comparison = strA.localeCompare(strB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Paginate sorted data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: IContractorFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (!amount) return 'N/A';
    return `OMR ${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
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
            Contractor Data
          </h3>
          <p 
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textSecondary', '#6B7280'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            {filteredData.length} of {data.length} contractors
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>
        
        {onExport && (
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </div>

      {/* Enhanced Filters */}
      <div className="mb-6">
        <ContractorFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          data={data}
        />
      </div>

      {/* Table - Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <table 
            className="w-full"
            role="table"
            aria-label="Contractor data table"
            aria-rowcount={paginatedData.length + 1}
          >
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700" role="row">
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                  onClick={() => handleSort('contractor_name')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort('contractor_name');
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortField === 'contractor_name' 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  aria-label="Sort by contractor name"
                >
                  <div className="flex items-center gap-1">
                    <span 
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ 
                        fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                      }}
                    >
                      Contractor
                    </span>
                    {getSortIcon('contractor_name')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                  onClick={() => handleSort('service_provided')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort('service_provided');
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortField === 'service_provided' 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  aria-label="Sort by service provided"
                >
                  <div className="flex items-center gap-1">
                    <span 
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ 
                        fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                      }}
                    >
                      Service
                    </span>
                    {getSortIcon('service_provided')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left" role="columnheader">
                  <span 
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{ 
                      fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                      fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                    }}
                  >
                    Status
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                  onClick={() => handleSort('contract_type')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort('contract_type');
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortField === 'contract_type' 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  aria-label="Sort by contract type"
                >
                  <div className="flex items-center gap-1">
                    <span 
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ 
                        fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                      }}
                    >
                      Type
                    </span>
                    {getSortIcon('contract_type')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                  onClick={() => handleSort('end_date')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort('end_date');
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortField === 'end_date' 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  aria-label="Sort by end date"
                >
                  <div className="flex items-center gap-1">
                    <span 
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ 
                        fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                      }}
                    >
                      End Date
                    </span>
                    {getSortIcon('end_date')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-right cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800"
                  onClick={() => handleSort('contract_yearly_amount')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSort('contract_yearly_amount');
                    }
                  }}
                  tabIndex={0}
                  role="columnheader"
                  aria-sort={
                    sortField === 'contract_yearly_amount' 
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                  aria-label="Sort by annual value"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span 
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      style={{ 
                        fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                        fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                      }}
                    >
                      Annual Value
                    </span>
                    {getSortIcon('contract_yearly_amount')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center" role="columnheader">
                  <span 
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{ 
                      fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                      fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                    }}
                  >
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((contractor, index) => (
                <tr 
                  key={contractor.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  role="row"
                  aria-rowindex={index + 2}
                >
                  <td className="px-4 py-3" role="gridcell">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {contractor.contractor_name}
                    </div>
                  </td>
                  <td className="px-4 py-3" role="gridcell">
                    <div 
                      className="text-gray-600 dark:text-gray-300 max-w-xs truncate"
                      title={contractor.service_provided}
                    >
                      {contractor.service_provided}
                    </div>
                  </td>
                  <td className="px-4 py-3" role="gridcell">
                    <StatusBadge status={contractor.status} />
                  </td>
                  <td className="px-4 py-3" role="gridcell">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3 text-gray-400" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {contractor.contract_type}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" role="gridcell">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" aria-hidden="true" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(contractor.end_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right" role="gridcell">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="h-3 w-3 text-gray-400" aria-hidden="true" />
                      <span 
                        className="text-sm font-medium"
                        style={{ 
                          color: contractor.contract_yearly_amount 
                            ? getThemeValue('colors.textPrimary', '#111827')
                            : getThemeValue('colors.textSecondary', '#6B7280')
                        }}
                      >
                        {formatCurrency(contractor.contract_yearly_amount)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" role="gridcell">
                    <div className="flex items-center justify-center gap-1" role="group" aria-label="Contractor actions">
                      {onView && (
                        <Button
                          onClick={() => onView(contractor)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`View details for ${contractor.contractor_name}`}
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
                          aria-label={`Edit ${contractor.contractor_name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(contractor)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          aria-label={`Delete ${contractor.contractor_name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          paginatedData.map((contractor) => (
            <Card key={contractor.id} className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {contractor.contractor_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {contractor.service_provided}
                    </p>
                  </div>
                  <StatusBadge status={contractor.status} className="ml-2 flex-shrink-0" />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <FileText className="h-3 w-3" aria-hidden="true" />
                      <span>Type</span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {contractor.contract_type}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      <span>End Date</span>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(contractor.end_date)}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <DollarSign className="h-3 w-3" aria-hidden="true" />
                      <span>Annual Value</span>
                    </div>
                    <div 
                      className="font-medium"
                      style={{ 
                        color: contractor.contract_yearly_amount 
                          ? getThemeValue('colors.textPrimary', '#111827')
                          : getThemeValue('colors.textSecondary', '#6B7280')
                      }}
                    >
                      {formatCurrency(contractor.contract_yearly_amount)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {onView && (
                    <Button
                      onClick={() => onView(contractor)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      aria-label={`View details for ${contractor.contractor_name}`}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(contractor)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      aria-label={`Edit ${contractor.contractor_name}`}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(contractor)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label={`Delete ${contractor.contractor_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Empty state */}
      {!loading && paginatedData.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 
            className="text-lg font-medium text-gray-900 dark:text-white mb-2"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            No contractors found
          </h3>
          <p 
            className="text-gray-500 dark:text-gray-400"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            {filters.search || filters.status !== 'all' || filters.contractType !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No contractor data available.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div 
            className="text-sm text-gray-500 dark:text-gray-400"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} entries
            {filteredData.length !== data.length && (
              <span className="ml-2" style={{ color: getThemeValue('colors.primary', '#2D9CDB') }}>
                (filtered from {data.length} total)
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span 
              className="px-3 py-1 text-sm rounded-md"
              style={{ 
                backgroundColor: getThemeValue('colors.primary', '#2D9CDB') + '10',
                color: getThemeValue('colors.primary', '#2D9CDB'),
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};