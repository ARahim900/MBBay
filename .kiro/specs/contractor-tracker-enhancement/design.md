# Design Document

## Overview

This design document outlines the comprehensive enhancement of the contractor tracker section by implementing secure Supabase database integration and redesigning the layout to achieve visual consistency with other application modules. The design focuses on replacing the current static data implementation with dynamic database connectivity while standardizing all UI components to match the unified design system established in the firefighting, water, and other enhanced modules.

## Architecture

### Component Hierarchy Alignment

The contractor tracker will adopt the same architectural patterns used in other enhanced modules:

```
ContractorTrackerDashboard (Main Container)
├── Header Section (Standardized)
├── MenuBar Navigation (Shared Component)
├── Dashboard Content (Grid Layout)
│   ├── KpiCard Components (Standardized)
│   ├── Card Components (Standardized)
│   └── Enhanced Contractor Components
└── Sub-modules (Analytics, Management, etc.)
```

### Supabase Integration Architecture

```
ContractorTrackerDashboard
├── useContractorData Hook (Custom Hook)
│   ├── Supabase Client Integration
│   ├── Real-time Subscriptions
│   ├── Error Handling & Fallbacks
│   └── Data Caching & Optimization
├── ContractorAPI Service Layer
│   ├── CRUD Operations
│   ├── Analytics Queries
│   ├── Filtering & Search
│   └── Export Functions
└── Type Definitions
    ├── Contractor Interface
    ├── Analytics Views
    └── API Response Types
```

### Design System Integration

All contractor components will integrate with the centralized theme system:
- Import theme configuration from `src/lib/theme.ts`
- Use standardized UI components from `src/components/ui/`
- Follow established color, typography, and spacing patterns
- Maintain consistent hover effects and animations

## Components and Interfaces

### 1. ContractorTrackerDashboard Component Redesign

**Current Issues:**
- Uses static data instead of Supabase integration
- Inconsistent styling with other modules
- Custom table implementation instead of standardized components
- Non-standard header and navigation layout

**Design Solution:**
```typescript
// Header alignment with other enhanced modules
const headerSection = {
  layout: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6",
  title: {
    typography: "text-2xl font-bold text-[#4E4456] dark:text-white",
    icon: "HardHat icon with consistent styling",
    subtitle: "text-sm text-gray-500 dark:text-gray-400"
  },
  actions: [
    {
      component: "Button",
      variant: "outline",
      icon: "RefreshCw",
      onClick: "handleRefresh"
    },
    {
      component: "Button", 
      variant: "primary",
      icon: "Download",
      onClick: "handleExportReport"
    }
  ]
}

// Navigation alignment
const navigationSection = {
  component: "MenuBar from ui/glow-menu",
  styling: "mb-6 flex justify-center",
  menuItems: [
    {
      icon: "LayoutDashboard",
      label: "Dashboard",
      gradient: "radial-gradient(circle, rgba(45,156,219,0.15)...)",
      iconColor: "text-blue-500"
    },
    {
      icon: "Users",
      label: "Contractors",
      gradient: "radial-gradient(circle, rgba(16,185,129,0.15)...)",
      iconColor: "text-green-500"
    },
    {
      icon: "Calendar",
      label: "Contracts",
      gradient: "radial-gradient(circle, rgba(245,158,11,0.15)...)",
      iconColor: "text-yellow-500"
    },
    {
      icon: "TrendingUp",
      label: "Analytics",
      gradient: "radial-gradient(circle, rgba(139,92,246,0.15)...)",
      iconColor: "text-purple-500"
    }
  ]
}
```

### 2. Supabase Integration Layer

**Data Service Architecture:**
```typescript
// ContractorAPI Service
export class ContractorAPI {
  private static supabaseUrl = 'https://jpqkoyxnsdzorsadpdvs.supabase.co';
  private static apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  private static getHeaders() {
    return {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  // Core CRUD Operations
  static async getAllContractors(): Promise<Contractor[]> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/contractor_tracker`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  static async getActiveContractors(): Promise<Contractor[]> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/contractor_tracker?status=eq.Active`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  // Analytics Views
  static async getContractorSummary(): Promise<ContractorSummary> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/contractor_tracker_summary`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  static async getExpiringContracts(): Promise<ExpiringContract[]> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/contracts_expiring_soon`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  static async getContractsByService(): Promise<ServiceContract[]> {
    const response = await fetch(
      `${this.supabaseUrl}/rest/v1/contracts_by_service`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  // Error handling with fallback
  private static async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase API Error:', error);
      throw new Error(`API Error: ${response.status} - ${error}`);
    }
    return response.json();
  }
}
```

**Custom Hook Design:**
```typescript
// useContractorData Hook
export const useContractorData = () => {
  const [allData, setAllData] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [filters, setFilters] = useState<ContractorFilters>({
    status: 'all',
    search: '',
    contractType: 'all',
    dateRange: null
  });

  // Fetch data with error handling and caching
  const fetchContractorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [contractors, summary, expiring, byService] = await Promise.all([
        ContractorAPI.getAllContractors(),
        ContractorAPI.getContractorSummary(),
        ContractorAPI.getExpiringContracts(),
        ContractorAPI.getContractsByService()
      ]);

      setAllData(contractors);
      setAnalytics({ summary, expiring, byService });
      setLastFetchTime(new Date());
    } catch (err) {
      console.error('Error fetching contractor data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      
      // Fallback to cached data or static data
      const cachedData = getCachedContractorData();
      if (cachedData) {
        setAllData(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time subscriptions (if needed)
  useEffect(() => {
    fetchContractorData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchContractorData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchContractorData]);

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    return allData.filter(contractor => {
      const matchesStatus = filters.status === 'all' || contractor.status === filters.status;
      const matchesSearch = !filters.search || 
        contractor.contractor_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        contractor.service_provided.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.contractType === 'all' || contractor.contract_type === filters.contractType;
      
      return matchesStatus && matchesSearch && matchesType;
    });
  }, [allData, filters]);

  return {
    allData,
    filteredData,
    loading,
    error,
    lastFetchTime,
    filters,
    setFilters,
    refetch: fetchContractorData
  };
};
```

### 3. KPI Metrics Standardization

**Current Implementation:** Custom metric cards with inconsistent styling
**New Implementation:** Standard KpiCard components with theme integration

```typescript
// KPI Metrics with theme colors
const contractorKpis = [
  {
    component: "KpiCard",
    props: {
      title: "Total Contracts",
      value: analytics.totalContracts.toString(),
      subtitle: `${analytics.activeContracts} Active`,
      color: "blue",
      icon: FileText,
      trend: { value: 8, isPositive: true, period: 'vs last month' }
    }
  },
  {
    component: "KpiCard",
    props: {
      title: "Active Contracts", 
      value: analytics.activeContracts.toString(),
      subtitle: `${analytics.expiringContracts} Expiring Soon`,
      color: "green",
      icon: CheckCircle
    }
  },
  {
    component: "KpiCard",
    props: {
      title: "Expiring Soon",
      value: analytics.expiringContracts.toString(),
      subtitle: "Next 30 days",
      color: analytics.expiringContracts > 0 ? "orange" : "green",
      icon: AlertTriangle
    }
  },
  {
    component: "KpiCard",
    props: {
      title: "Total Value",
      value: `OMR ${analytics.totalValue.toLocaleString()}`,
      subtitle: "Annual contracts",
      color: "purple",
      icon: DollarSign,
      trend: { value: 15, isPositive: true, period: 'vs last year' }
    }
  }
];
```

### 4. Data Table Enhancement

**Design Approach:** Replace custom table with standardized components

```typescript
const contractorTableDesign = {
  container: "Card component with standard padding",
  header: {
    title: "theme.typography with consistent sizing",
    actions: "Button components with standard variants",
    filters: {
      search: "Input component with theme styling",
      statusFilter: "Select component with theme styling",
      typeFilter: "Select component with theme styling"
    }
  },
  table: {
    styling: "Consistent table styling with hover effects",
    columns: [
      { key: 'contractor_name', label: 'Contractor', sortable: true },
      { key: 'service_provided', label: 'Service', sortable: true },
      { key: 'status', label: 'Status', component: 'StatusBadge' },
      { key: 'contract_type', label: 'Type', sortable: true },
      { key: 'start_date', label: 'Start Date', sortable: true },
      { key: 'end_date', label: 'End Date', sortable: true },
      { key: 'contract_yearly_amount', label: 'Annual Value', sortable: true },
      { key: 'actions', label: 'Actions', component: 'ActionButtons' }
    ],
    pagination: "Standard pagination component",
    loading: "Skeleton loading states",
    empty: "Empty state with consistent styling"
  }
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusColors = {
    'Active': {
      bg: 'bg-green-100 dark:bg-green-900/20',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800'
    },
    'Expired': {
      bg: 'bg-red-100 dark:bg-red-900/20', 
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800'
    },
    'Pending': {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-200', 
      border: 'border-yellow-200 dark:border-yellow-800'
    }
  };

  const colors = statusColors[status] || statusColors['Pending'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {status}
    </span>
  );
};
```

### 5. Analytics Dashboard Components

**Design Strategy:** Create analytics views using existing chart components

```typescript
const analyticsComponents = {
  contractsByService: {
    component: "PieChart",
    data: "contracts_by_service view",
    colors: "theme.charts.colors",
    styling: "Card container with consistent padding"
  },
  expirationTimeline: {
    component: "BarChart", 
    data: "contracts_expiring_soon view",
    colors: "theme.colors.status for urgency levels",
    styling: "Card container with responsive design"
  },
  contractValueTrends: {
    component: "LineChart",
    data: "Historical contract values",
    colors: "theme.colors.primary and secondary",
    styling: "Card container with proper spacing"
  },
  serviceDistribution: {
    component: "DonutChart",
    data: "Service type distribution",
    colors: "theme.charts.colors array",
    styling: "Card container with legend"
  }
};
```

### 6. CRUD Operations Interface

**Modal Design for Add/Edit:**
```typescript
const contractorFormModal = {
  component: "Modal with Card styling",
  form: {
    fields: [
      { name: 'contractor_name', type: 'text', required: true, label: 'Contractor Name' },
      { name: 'service_provided', type: 'textarea', required: true, label: 'Service Description' },
      { name: 'status', type: 'select', options: ['Active', 'Expired', 'Pending'], label: 'Status' },
      { name: 'contract_type', type: 'select', options: ['Contract', 'PO'], label: 'Contract Type' },
      { name: 'start_date', type: 'date', required: true, label: 'Start Date' },
      { name: 'end_date', type: 'date', required: true, label: 'End Date' },
      { name: 'contract_monthly_amount', type: 'number', label: 'Monthly Amount (OMR)' },
      { name: 'contract_yearly_amount', type: 'number', label: 'Yearly Amount (OMR)' },
      { name: 'notes', type: 'textarea', label: 'Notes' }
    ],
    validation: "Client-side validation with error states",
    styling: "Theme-consistent form styling",
    actions: [
      { type: 'cancel', variant: 'outline' },
      { type: 'submit', variant: 'primary', loading: true }
    ]
  }
};
```

## Data Models

### Core Data Interfaces

```typescript
// Contractor Interface
export interface Contractor {
  id: number;
  contractor_name: string;
  service_provided: string;
  status: 'Active' | 'Expired' | 'Pending';
  contract_type: 'Contract' | 'PO';
  start_date: string;
  end_date: string;
  contract_monthly_amount: number | null;
  contract_yearly_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Analytics Interfaces
export interface ContractorSummary {
  total_contracts: number;
  active_contracts: number;
  expired_contracts: number;
  pending_contracts: number;
  total_yearly_value: number;
  average_contract_duration: number;
}

export interface ExpiringContract {
  id: number;
  contractor_name: string;
  service_provided: string;
  end_date: string;
  days_until_expiry: number;
  contract_yearly_amount: number | null;
  urgency_level: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface ServiceContract {
  service_category: string;
  contract_count: number;
  total_value: number;
  average_value: number;
  active_count: number;
  expired_count: number;
}

// Filter Interface
export interface ContractorFilters {
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

### Theme Integration Model

```typescript
interface ContractorThemeConfig {
  colors: {
    status: {
      active: string;    // theme.colors.status.success
      expired: string;   // theme.colors.status.error
      pending: string;   // theme.colors.status.warning
      expiring: string;  // theme.colors.status.warning
    };
    urgency: {
      critical: string;  // theme.colors.status.error
      high: string;      // theme.colors.status.warning
      medium: string;    // theme.colors.status.info
      low: string;       // theme.colors.status.success
    };
    kpiCards: {
      total: string;     // theme.colors.primary (blue)
      active: string;    // theme.colors.status.success (green)
      expiring: string;  // theme.colors.status.warning (orange)
      value: string;     // theme.colors.extended.purple
    };
  };
  typography: typeof theme.typography;
  spacing: typeof theme.spacing;
  animations: typeof theme.animation;
}
```

## Error Handling

### API Error Management

```typescript
// Error handling strategy
export class ContractorErrorHandler {
  static handleAPIError(error: Error, context: string): string {
    console.error(`Contractor API Error [${context}]:`, error);
    
    // Network errors
    if (error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    // Authentication errors
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'Authentication error. Please refresh the page and try again.';
    }
    
    // Server errors
    if (error.message.includes('500')) {
      return 'Server error. Please try again later.';
    }
    
    // Validation errors
    if (error.message.includes('400')) {
      return 'Invalid data provided. Please check your input and try again.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  static async withFallback<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = this.handleAPIError(error as Error, context);
      console.warn(`Using fallback data for ${context}: ${errorMessage}`);
      return fallback;
    }
  }
}

// Caching strategy for offline support
export class ContractorCache {
  private static CACHE_KEY = 'contractor_data_cache';
  private static CACHE_EXPIRY = 'contractor_cache_expiry';
  private static CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static saveToCache(data: Contractor[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(this.CACHE_EXPIRY, Date.now().toString());
    } catch (error) {
      console.warn('Failed to save contractor data to cache:', error);
    }
  }

  static getFromCache(): Contractor[] | null {
    try {
      const expiry = localStorage.getItem(this.CACHE_EXPIRY);
      if (!expiry || Date.now() - parseInt(expiry) > this.CACHE_DURATION) {
        return null;
      }
      
      const data = localStorage.getItem(this.CACHE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to retrieve contractor data from cache:', error);
      return null;
    }
  }
}
```

### Form Validation

```typescript
// Validation schema for contractor forms
export const contractorValidationSchema = {
  contractor_name: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-Z0-9\s&.-]+$/,
    message: 'Contractor name must be 2-255 characters and contain only letters, numbers, spaces, and basic punctuation'
  },
  service_provided: {
    required: true,
    minLength: 10,
    maxLength: 1000,
    message: 'Service description must be 10-1000 characters'
  },
  start_date: {
    required: true,
    type: 'date',
    message: 'Start date is required'
  },
  end_date: {
    required: true,
    type: 'date',
    validate: (value: string, formData: any) => {
      return new Date(value) > new Date(formData.start_date);
    },
    message: 'End date must be after start date'
  },
  contract_yearly_amount: {
    type: 'number',
    min: 0,
    max: 10000000,
    message: 'Contract amount must be between 0 and 10,000,000 OMR'
  }
};
```

## Testing Strategy

### Component Testing

1. **Visual Consistency Testing**
   - Compare with FirefightingDashboard styling
   - Verify theme color application
   - Test responsive design across breakpoints
   - Validate dark mode compatibility

2. **Supabase Integration Testing**
   - API endpoint connectivity testing
   - Error handling validation
   - Data transformation accuracy
   - Real-time update functionality

3. **CRUD Operations Testing**
   - Create contractor validation
   - Update contractor functionality
   - Delete contractor confirmation
   - Bulk operations testing

### Performance Testing

1. **Data Loading Performance**
   - Large dataset handling (1000+ contractors)
   - Pagination performance
   - Search and filter responsiveness
   - Cache effectiveness

2. **API Performance**
   - Response time measurement
   - Concurrent request handling
   - Error recovery testing
   - Offline functionality

### Accessibility Testing

1. **Keyboard Navigation**
   - Tab order validation
   - Focus management
   - Keyboard shortcuts

2. **Screen Reader Compatibility**
   - ARIA labels verification
   - Semantic HTML structure
   - Table accessibility

3. **Color Contrast**
   - WCAG AA compliance
   - Status indicator accessibility
   - Dark mode contrast validation

## Implementation Phases

### Phase 1: Core Infrastructure Setup
- Set up Supabase integration layer
- Create ContractorAPI service
- Implement useContractorData hook
- Set up error handling and caching

### Phase 2: UI Component Standardization
- Replace custom components with standardized UI components
- Implement theme integration
- Create consistent header and navigation
- Standardize KPI cards and data tables

### Phase 3: CRUD Operations
- Implement add/edit contractor modals
- Add delete confirmation dialogs
- Create form validation
- Implement bulk operations

### Phase 4: Analytics and Reporting
- Create analytics dashboard
- Implement chart components
- Add export functionality
- Create filtering and search

### Phase 5: Testing and Optimization
- Comprehensive testing suite
- Performance optimization
- Accessibility compliance
- Cross-browser compatibility

### Phase 6: Real-time Features
- Implement real-time updates
- Add notification system
- Create activity logging
- Implement audit trails

## Security Considerations

### Data Protection
- All API communications use HTTPS
- Sensitive data encryption in transit
- Proper authentication token handling
- Input sanitization and validation

### Access Control
- Role-based access control (if needed)
- API key security
- Rate limiting considerations
- Audit logging for sensitive operations

### Error Information Security
- No sensitive data in error messages
- Secure error logging
- User-friendly error messages
- Proper error boundary implementation