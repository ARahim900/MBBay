# Contractor API Integration Documentation

## Overview

This document describes the Supabase integration infrastructure for the contractor tracker enhancement. The implementation provides secure database connectivity, comprehensive error handling, and offline support through caching.

## Architecture

### Core Components

1. **ContractorAPI Service** (`src/lib/contractor-api.ts`)
   - Main service class for all contractor-related database operations
   - Implements CRUD operations with proper error handling
   - Provides analytics endpoints for dashboard metrics
   - Includes search, filtering, and export functionality

2. **TypeScript Interfaces** (`src/types/contractor.ts`)
   - Complete type definitions for all contractor data structures
   - Database table interfaces for Supabase integration
   - API response types and error handling types

3. **Error Handling** (`src/utils/contractor-error-handler.ts`)
   - Centralized error handling with user-friendly messages
   - Data validation for contractor forms
   - Retry logic and fallback strategies

4. **Caching System** (`src/utils/contractor-cache.ts`)
   - Client-side caching for offline support
   - Performance optimization through intelligent cache management
   - Cache statistics and debugging utilities

## Database Integration

### Supabase Configuration

The integration uses the existing Supabase client configuration from `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'https://jpqkoyxnsdzorsadpdvs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### Required Database Tables

The following tables and views need to be created in Supabase:

#### 1. contractor_tracker (Main Table)
```sql
CREATE TABLE contractor_tracker (
  id SERIAL PRIMARY KEY,
  contractor_name VARCHAR(255) NOT NULL,
  service_provided TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Active', 'Expired', 'Pending')) NOT NULL,
  contract_type VARCHAR(20) CHECK (contract_type IN ('Contract', 'PO')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_monthly_amount DECIMAL(10,2),
  contract_yearly_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. contractor_tracker_summary (Analytics View)
```sql
CREATE VIEW contractor_tracker_summary AS
SELECT 
  COUNT(*) as total_contracts,
  COUNT(*) FILTER (WHERE status = 'Active') as active_contracts,
  COUNT(*) FILTER (WHERE status = 'Expired') as expired_contracts,
  COUNT(*) FILTER (WHERE status = 'Pending') as pending_contracts,
  COALESCE(SUM(contract_yearly_amount), 0) as total_yearly_value,
  COALESCE(AVG(end_date - start_date), 0) as average_contract_duration
FROM contractor_tracker;
```

#### 3. contracts_expiring_soon (Analytics View)
```sql
CREATE VIEW contracts_expiring_soon AS
SELECT 
  id,
  contractor_name,
  service_provided,
  end_date,
  (end_date - CURRENT_DATE) as days_until_expiry,
  contract_yearly_amount,
  CASE 
    WHEN (end_date - CURRENT_DATE) <= 7 THEN 'Critical'
    WHEN (end_date - CURRENT_DATE) <= 14 THEN 'High'
    WHEN (end_date - CURRENT_DATE) <= 21 THEN 'Medium'
    ELSE 'Low'
  END as urgency_level
FROM contractor_tracker
WHERE end_date >= CURRENT_DATE 
  AND end_date <= CURRENT_DATE + INTERVAL '30 days'
  AND status = 'Active'
ORDER BY days_until_expiry ASC;
```

#### 4. contracts_by_service (Analytics View)
```sql
CREATE VIEW contracts_by_service AS
SELECT 
  SPLIT_PART(service_provided, ' ', 1) as service_category,
  COUNT(*) as contract_count,
  COALESCE(SUM(contract_yearly_amount), 0) as total_value,
  COALESCE(AVG(contract_yearly_amount), 0) as average_value,
  COUNT(*) FILTER (WHERE status = 'Active') as active_count,
  COUNT(*) FILTER (WHERE status = 'Expired') as expired_count
FROM contractor_tracker
GROUP BY SPLIT_PART(service_provided, ' ', 1)
ORDER BY contract_count DESC;
```

## API Endpoints

### CRUD Operations

#### Get All Contractors
```typescript
const contractors = await ContractorAPI.getAllContractors();
```

#### Get Active Contractors (Optimized)
```typescript
const activeContractors = await ContractorAPI.getActiveContractors();
```

#### Get Contractor by ID
```typescript
const contractor = await ContractorAPI.getContractorById(1);
```

#### Create Contractor
```typescript
const newContractor = await ContractorAPI.createContractor({
  contractor_name: 'New Contractor',
  service_provided: 'Service description',
  status: 'Active',
  contract_type: 'Contract',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  contract_yearly_amount: 12000
});
```

#### Update Contractor
```typescript
const updatedContractor = await ContractorAPI.updateContractor(1, {
  status: 'Expired',
  notes: 'Contract expired'
});
```

#### Delete Contractor
```typescript
await ContractorAPI.deleteContractor(1);
```

### Analytics Endpoints

#### Get Dashboard Analytics
```typescript
const analytics = await ContractorAPI.getAnalytics();
// Returns: { summary, expiring, byService }
```

#### Get Contractor Summary
```typescript
const summary = await ContractorAPI.getContractorSummary();
```

#### Get Expiring Contracts
```typescript
const expiring = await ContractorAPI.getExpiringContracts();
```

#### Get Contracts by Service
```typescript
const byService = await ContractorAPI.getContractsByService();
```

### Search and Filtering

```typescript
const results = await ContractorAPI.searchContractors({
  status: 'Active',
  search: 'cleaning',
  contractType: 'Contract',
  dateRange: {
    start: '2024-01-01',
    end: '2024-12-31'
  },
  serviceCategory: null
});
```

### Export Functionality

```typescript
// Export to CSV
const csvData = await ContractorAPI.exportToCSV();

// Export to JSON
const jsonData = await ContractorAPI.exportToJSON();

// Export with filters
const filteredCSV = await ContractorAPI.exportToCSV({
  status: 'Active',
  search: '',
  contractType: 'all',
  dateRange: null,
  serviceCategory: null
});
```

## Error Handling

### Automatic Fallback

The API automatically falls back to mock data when database tables don't exist:

```typescript
try {
  const contractors = await ContractorAPI.getAllContractors();
  // Will return real data if available, mock data if not
} catch (error) {
  // Error handling with user-friendly messages
  const message = ContractorErrorHandler.handleAPIError(error, 'fetching contractors');
}
```

### Data Validation

```typescript
const validation = ContractorErrorHandler.validateContractorData({
  contractor_name: 'Test Contractor',
  service_provided: 'Service description',
  // ... other fields
});

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

### Retry Logic

```typescript
const result = await ContractorErrorHandler.withRetry(
  () => ContractorAPI.getAllContractors(),
  3, // max retries
  'fetching contractors',
  1000 // initial delay
);
```

## Caching System

### Basic Usage

```typescript
// Save to cache
ContractorCache.saveContractors(contractors);

// Get from cache
const cachedContractors = ContractorCache.getContractors();

// Check cache validity
if (ContractorCache.isCacheValid()) {
  // Use cached data
} else {
  // Fetch fresh data
}
```

### Cache Management

```typescript
// Update single contractor in cache
ContractorCache.updateContractorInCache(updatedContractor);

// Add new contractor to cache
ContractorCache.addContractorToCache(newContractor);

// Remove contractor from cache
ContractorCache.removeContractorFromCache(contractorId);

// Get cache statistics
const stats = ContractorCache.getCacheStats();
console.log(`Cache contains ${stats.contractorsCount} contractors`);
```

### Smart Cache Refresh

```typescript
if (ContractorCache.shouldRefreshCache()) {
  // Refresh cache with fresh data
  await ContractorCache.preloadCache(
    () => ContractorAPI.getAllContractors(),
    () => ContractorAPI.getAnalytics()
  );
}
```

## Security Features

### Authentication Headers

All API calls include proper authentication headers:

```typescript
{
  'apikey': 'your-supabase-anon-key',
  'Authorization': 'Bearer your-supabase-anon-key',
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
}
```

### Input Sanitization

Data validation prevents SQL injection and ensures data integrity:

- Required field validation
- Data type validation
- String length limits
- Date range validation
- Numeric value validation

### Error Information Security

Error messages are sanitized to prevent sensitive information leakage:

- No database schema information in error messages
- Generic error messages for security-related failures
- Detailed logging for debugging (server-side only)

## Testing

### Manual Validation

Run the validation script to test the integration:

```bash
# If you have a test runner configured
npm test src/tests/contractor-api.test.ts

# Or run the manual validation script
node -r ts-node/register src/scripts/validate-contractor-api.ts
```

### Test Coverage

The test suite covers:

- ✅ CRUD operations
- ✅ Analytics endpoints
- ✅ Search and filtering
- ✅ Export functionality
- ✅ Error handling
- ✅ Data validation
- ✅ Cache management
- ✅ Fallback mechanisms

## Performance Considerations

### Optimizations Implemented

1. **Selective Queries**: Active contractors endpoint uses filtered queries
2. **Caching**: Client-side caching reduces API calls
3. **Batch Operations**: Analytics data fetched in parallel
4. **Fallback Data**: Immediate response with mock data when needed
5. **Request Deduplication**: Cache prevents duplicate requests

### Recommended Usage Patterns

1. **Use Active Contractors Endpoint**: For dashboard displays, use `getActiveContractors()` instead of filtering all contractors
2. **Cache Analytics**: Analytics data changes less frequently, cache for longer periods
3. **Batch Updates**: When possible, batch multiple updates together
4. **Smart Refresh**: Only refresh cache when necessary using `shouldRefreshCache()`

## Integration with React Components

### Custom Hook Pattern

```typescript
// Example custom hook (to be implemented in task 2)
const useContractorData = () => {
  const [data, setData] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const contractors = await ContractorAPI.getAllContractors();
        setData(contractors);
        ContractorCache.saveContractors(contractors);
      } catch (err) {
        setError(ContractorErrorHandler.handleAPIError(err, 'fetching contractors'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

## Troubleshooting

### Common Issues

1. **Network Errors**: Check internet connection and Supabase URL
2. **Authentication Errors**: Verify API key is correct and not expired
3. **Table Not Found**: Ensure database tables are created in Supabase
4. **Cache Issues**: Clear cache using `ContractorCache.clearCache()`
5. **Validation Errors**: Check data format matches interface requirements

### Debug Information

Enable debug logging by checking browser console for:
- API request/response details
- Cache operations
- Error stack traces
- Validation results

### Support

For issues with the contractor API integration:
1. Check browser console for error messages
2. Verify Supabase database setup
3. Test with the validation script
4. Review cache statistics for performance issues

## Next Steps

This infrastructure is ready for integration with React components. The next tasks will involve:

1. Creating the `useContractorData` custom hook
2. Building the contractor dashboard components
3. Implementing CRUD operation modals
4. Adding real-time updates and notifications

The foundation is solid and follows all security, performance, and maintainability best practices.