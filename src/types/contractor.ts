// Contractor TypeScript interfaces for Supabase integration

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

// Analytics interfaces for Supabase views
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

// Filter interface for search and filtering
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

// API response types
export interface ContractorAPIResponse<T> {
  data: T;
  error: string | null;
  success: boolean;
  message?: string;
}

export interface ContractorAnalytics {
  summary: ContractorSummary;
  expiring: ExpiringContract[];
  byService: ServiceContract[];
}

// Supabase specific response types
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details: string;
    hint: string;
    code: string;
  } | null;
  count?: number | null;
  status: number;
  statusText: string;
}

// Error handling types
export interface ContractorError {
  code: string;
  message: string;
  details?: any;
  context?: string;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// CRUD operation types
export type CreateContractorData = Omit<Contractor, 'id' | 'created_at' | 'updated_at'>;
export type UpdateContractorData = Partial<Omit<Contractor, 'id' | 'created_at' | 'updated_at'>>;

// Database table structure for Supabase
export interface ContractorTableRow {
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

export interface ContractorTableInsert {
  contractor_name: string;
  service_provided: string;
  status: 'Active' | 'Expired' | 'Pending';
  contract_type: 'Contract' | 'PO';
  start_date: string;
  end_date: string;
  contract_monthly_amount?: number | null;
  contract_yearly_amount?: number | null;
  notes?: string | null;
}

export interface ContractorTableUpdate {
  contractor_name?: string;
  service_provided?: string;
  status?: 'Active' | 'Expired' | 'Pending';
  contract_type?: 'Contract' | 'PO';
  start_date?: string;
  end_date?: string;
  contract_monthly_amount?: number | null;
  contract_yearly_amount?: number | null;
  notes?: string | null;
}

// Theme integration types
export interface ContractorThemeConfig {
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
  typography: {
    title: string;
    label: string;
    tooltip: string;
  };
  spacing: {
    card: string;
    section: string;
    element: string;
  };
}

// Loading and UI state types
export interface ContractorLoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: ContractorError | null;
}

// Pagination types
export interface ContractorPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Sort types
export interface ContractorSort {
  field: keyof Contractor;
  direction: 'asc' | 'desc';
}

// Export types
export interface ContractorExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeFields: (keyof Contractor)[];
  filters?: ContractorFilters;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Bulk operation types
export interface BulkContractorOperation {
  action: 'update' | 'delete' | 'export';
  contractorIds: number[];
  data?: Partial<Contractor>;
}

// Analytics calculation types
export interface ContractorMetrics {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  pendingContracts: number;
  expiringContracts: number;
  totalYearlyValue: number;
  averageContractValue: number;
  contractsByType: Record<string, number>;
  contractsByService: Record<string, number>;
}

// Cache types
export interface ContractorCacheEntry {
  data: Contractor[];
  timestamp: number;
  expiry: number;
}

// Real-time update types
export interface ContractorRealtimeEvent {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Contractor;
  old?: Contractor;
  timestamp: string;
}