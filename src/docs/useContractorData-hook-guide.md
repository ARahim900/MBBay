# useContractorData Hook Documentation

## Overview

The `useContractorData` hook is a comprehensive custom React hook that provides contractor data management functionality for the Muscat Bay contractor tracking system. It implements secure Supabase database integration, real-time filtering, caching, and error handling.

## Features

### Core Functionality
- ✅ **Secure Supabase Integration**: Direct connection to contractor database with proper authentication
- ✅ **Real-time Data Fetching**: Automatic data loading with loading states and error handling
- ✅ **Advanced Filtering**: Multi-criteria filtering by status, search terms, contract type, and date ranges
- ✅ **Client-side Caching**: Intelligent caching with automatic cache management and validation
- ✅ **Error Handling**: Comprehensive error handling with fallback strategies
- ✅ **Auto-refresh**: Configurable automatic data refresh with cache invalidation
- ✅ **Analytics**: Built-in summary calculations and data analysis functions

### Requirements Coverage
- **Requirement 1.1**: ✅ Secure Supabase database integration with proper authentication
- **Requirement 1.4**: ✅ Real-time contractor data access with automatic updates
- **Requirement 7.1**: ✅ Search functionality by contractor name and service
- **Requirement 7.2**: ✅ Status filtering (Active/Expired/All)
- **Requirement 7.3**: ✅ Contract type filtering (Contract/PO)
- **Requirement 7.4**: ✅ Date range filtering capabilities
- **Requirement 7.5**: ✅ Real-time filter updates and combined filtering
- **Requirement 10.1**: ✅ Comprehensive error handling with user-friendly messages
- **Requirement 10.2**: ✅ Data caching and offline support

## Usage

### Basic Usage

```typescript
import { useContractorData } from '../hooks/useContractorData';

function ContractorDashboard() {
  const {
    // Core data
    allData,
    filteredData,
    analytics,
    
    // State
    loading,
    error,
    
    // Actions
    updateFilters,
    refetch
  } = useContractorData();

  if (loading) return <div>Loading contractors...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Contractors ({filteredData.length})</h1>
      {filteredData.map(contractor => (
        <div key={contractor.id}>
          {contractor.contractor_name} - {contractor.status}
        </div>
      ))}
    </div>
  );
}
```

### Advanced Filtering

```typescript
function ContractorFilters() {
  const { filters, updateFilters, resetFilters } = useContractorData();

  return (
    <div>
      {/* Status Filter */}
      <select 
        value={filters.status} 
        onChange={(e) => updateFilters({ status: e.target.value as any })}
      >
        <option value="all">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Expired">Expired</option>
        <option value="Pending">Pending</option>
      </select>

      {/* Search Filter */}
      <input
        type="text"
        placeholder="Search contractors..."
        value={filters.search}
        onChange={(e) => updateFilters({ search: e.target.value })}
      />

      {/* Contract Type Filter */}
      <select 
        value={filters.contractType} 
        onChange={(e) => updateFilters({ contractType: e.target.value as any })}
      >
        <option value="all">All Types</option>
        <option value="Contract">Contract</option>
        <option value="PO">Purchase Order</option>
      </select>

      {/* Date Range Filter */}
      <input
        type="date"
        onChange={(e) => updateFilters({ 
          dateRange: { 
            start: e.target.value, 
            end: filters.dateRange?.end || e.target.value 
          } 
        })}
      />

      <button onClick={resetFilters}>Reset Filters</button>
    </div>
  );
}
```

### Analytics and Summary Data

```typescript
function ContractorAnalytics() {
  const { 
    summary, 
    expiringContracts, 
    contractsByService,
    getContractorsByStatus 
  } = useContractorData();

  const activeContractors = getContractorsByStatus('Active');

  return (
    <div>
      {/* Summary Metrics */}
      <div className="metrics">
        <div>Total Contracts: {summary.total_contracts}</div>
        <div>Active: {summary.active_contracts}</div>
        <div>Expired: {summary.expired_contracts}</div>
        <div>Total Value: OMR {summary.total_yearly_value.toLocaleString()}</div>
      </div>

      {/* Expiring Contracts */}
      <div className="expiring">
        <h3>Expiring Soon ({expiringContracts.length})</h3>
        {expiringContracts.map(contract => (
          <div key={contract.id} className={`urgency-${contract.urgency_level.toLowerCase()}`}>
            {contract.contractor_name} - {contract.days_until_expiry} days
          </div>
        ))}
      </div>

      {/* Service Distribution */}
      <div className="services">
        <h3>Contracts by Service</h3>
        {contractsByService.map(service => (
          <div key={service.service_category}>
            {service.service_category}: {service.contract_count} contracts
            (OMR {service.total_value.toLocaleString()})
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Search Functionality

```typescript
function ContractorSearch() {
  const { searchContractors } = useContractorData();
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    const results = await searchContractors({
      status: 'Active',
      search: 'cleaning',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    });
    setSearchResults(results);
  };

  return (
    <div>
      <button onClick={handleSearch}>Search Active Cleaning Contractors</button>
      {searchResults.map(contractor => (
        <div key={contractor.id}>{contractor.contractor_name}</div>
      ))}
    </div>
  );
}
```

### Cache Management

```typescript
function CacheControls() {
  const { 
    getCacheStats, 
    clearCache, 
    forceRefresh,
    autoRefresh,
    setAutoRefresh 
  } = useContractorData();

  const stats = getCacheStats();

  return (
    <div>
      <h3>Cache Status</h3>
      <div>Contractors: {stats.contractorsCount}</div>
      <div>Cache Age: {stats.cacheAge} minutes</div>
      <div>Cache Size: {stats.size}</div>
      <div>Valid: {stats.isValid ? 'Yes' : 'No'}</div>
      
      <button onClick={clearCache}>Clear Cache</button>
      <button onClick={forceRefresh}>Force Refresh</button>
      
      <label>
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
        />
        Auto-refresh enabled
      </label>
    </div>
  );
}
```

## API Reference

### Return Values

#### Core Data
- `allData: Contractor[]` - All contractor records from the database
- `filteredData: Contractor[]` - Contractors filtered by current filter criteria
- `analytics: ContractorAnalytics | null` - Analytics data from Supabase views

#### Computed Data
- `summary: ContractorSummary` - Summary metrics (total, active, expired, value)
- `expiringContracts: ExpiringContract[]` - Contracts expiring in next 30 days
- `contractsByService: ServiceContract[]` - Contracts grouped by service category

#### State
- `loading: boolean` - Data loading state
- `error: string | null` - Current error message
- `lastFetchTime: Date | null` - Timestamp of last successful data fetch
- `filters: ContractorFilters` - Current filter configuration

#### Filter Actions
- `updateFilters(newFilters: Partial<ContractorFilters>): void` - Update filter criteria
- `resetFilters(): void` - Reset all filters to default values
- `searchContractors(filters: ContractorFilters): Promise<Contractor[]>` - Search with API call

#### Data Actions
- `refetch(): Promise<void>` - Refresh data using cache if valid
- `forceRefresh(): Promise<void>` - Force refresh bypassing cache

#### Utility Functions
- `getContractorsByStatus(status): Contractor[]` - Get contractors by specific status
- `getExpiringContracts(): ExpiringContract[]` - Get contracts expiring soon
- `calculateSummary(): ContractorSummary` - Calculate summary from current data
- `getContractsByService(): ServiceContract[]` - Group contracts by service

#### Cache Management
- `getCacheStats(): CacheStats` - Get cache statistics
- `clearCache(): void` - Clear all cached data

#### Auto-refresh Controls
- `autoRefresh: boolean` - Current auto-refresh state
- `setAutoRefresh(enabled: boolean): void` - Enable/disable auto-refresh
- `refreshInterval: number` - Current refresh interval in milliseconds
- `setRefreshInterval(ms: number): void` - Set refresh interval

#### Helper Properties
- `hasData: boolean` - True if data is available
- `isEmpty: boolean` - True if no data and not loading
- `isFiltered: boolean` - True if any filters are active
- `isDataStale(): boolean` - True if cache is invalid

## Filter Types

### ContractorFilters Interface
```typescript
interface ContractorFilters {
  status: 'all' | 'Active' | 'Expired' | 'Pending';
  search: string;
  contractType: 'all' | 'Contract' | 'PO';
  dateRange: {
    start: string;
    end: string;
  } | null;
  serviceCategory: string | null;
}
```

## Error Handling

The hook implements comprehensive error handling:

1. **API Errors**: Network issues, authentication failures, server errors
2. **Fallback Strategies**: Cache fallback, client-side filtering fallback
3. **User-friendly Messages**: Contextual error messages for different scenarios
4. **Retry Logic**: Automatic retry with exponential backoff for transient errors

## Performance Optimizations

1. **Intelligent Caching**: 30-minute cache with validation
2. **Client-side Filtering**: Reduces API calls for filter operations
3. **Memoized Calculations**: Optimized summary and analytics calculations
4. **Debounced Updates**: Prevents excessive re-renders during filtering
5. **Selective Refreshing**: Only refreshes when cache is stale

## Best Practices

### 1. Use Filters Efficiently
```typescript
// Good: Update multiple filters at once
updateFilters({ 
  status: 'Active', 
  search: 'cleaning',
  contractType: 'Contract' 
});

// Avoid: Multiple separate updates
updateFilters({ status: 'Active' });
updateFilters({ search: 'cleaning' });
updateFilters({ contractType: 'Contract' });
```

### 2. Handle Loading States
```typescript
if (loading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage message={error} onRetry={refetch} />;
}

if (isEmpty) {
  return <EmptyState message="No contractors found" />;
}
```

### 3. Optimize Re-renders
```typescript
// Use useMemo for expensive calculations
const expensiveCalculation = useMemo(() => {
  return filteredData.reduce((acc, contractor) => {
    // Complex calculation
    return acc;
  }, {});
}, [filteredData]);
```

### 4. Cache Management
```typescript
// Check cache status before operations
const stats = getCacheStats();
if (!stats.isValid) {
  await forceRefresh();
}
```

## Testing

The hook includes comprehensive validation tests covering:

- ✅ Data fetching and loading states
- ✅ Error handling and fallback strategies
- ✅ Filtering functionality (all filter types)
- ✅ Search operations
- ✅ Cache management
- ✅ Auto-refresh functionality
- ✅ Summary calculations
- ✅ Service categorization

Run validation tests:
```bash
npx tsx src/scripts/validate-contractor-hook.ts
```

## Integration with Components

The hook is designed to integrate seamlessly with the contractor dashboard components:

1. **ContractorTrackerDashboard**: Main dashboard component
2. **KpiCard Components**: For displaying summary metrics
3. **Data Tables**: For displaying filtered contractor lists
4. **Search Components**: For implementing search functionality
5. **Filter Components**: For implementing filter controls

## Troubleshooting

### Common Issues

1. **Data Not Loading**
   - Check Supabase connection and API keys
   - Verify network connectivity
   - Check browser console for errors

2. **Filters Not Working**
   - Ensure filter values are correctly typed
   - Check if data exists for filter criteria
   - Verify client-side filtering logic

3. **Cache Issues**
   - Clear cache using `clearCache()`
   - Check cache validity with `getCacheStats()`
   - Force refresh with `forceRefresh()`

4. **Performance Issues**
   - Reduce refresh interval if too frequent
   - Use filtering to reduce data size
   - Check for memory leaks in components

### Debug Information

Enable debug logging by setting:
```typescript
localStorage.setItem('contractor-debug', 'true');
```

This will provide detailed console logs for:
- API calls and responses
- Cache operations
- Filter operations
- Error details

## Conclusion

The `useContractorData` hook provides a complete solution for contractor data management with:

- **Reliability**: Comprehensive error handling and fallback strategies
- **Performance**: Intelligent caching and optimized operations
- **Flexibility**: Extensive filtering and search capabilities
- **Maintainability**: Clean API and comprehensive documentation
- **Scalability**: Designed to handle large datasets efficiently

The hook successfully implements all required functionality for the contractor tracker enhancement project and provides a solid foundation for building the contractor dashboard components.