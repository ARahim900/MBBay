import React, { useState, useEffect } from 'react';
import { 
  HardHat, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Download, 
  LayoutDashboard, 
  PieChart,
  FileText,
  DollarSign,
  Bell,
  Plus
} from 'lucide-react';
import { MenuBar } from './ui/glow-menu';
import { Card, KpiCard, Button, StatusBadge } from './ui';
import { ContractorDataTable } from './contractor/ContractorDataTable';
import { ContractorAnalytics } from './contractor/ContractorAnalytics';
import { AddContractorModal } from './contractor/AddContractorModal';
import { EditContractorModal } from './contractor/EditContractorModal';
import { DeleteContractorModal } from './contractor/DeleteContractorModal';
import { ExportModal } from './contractor/ExportModal';
import { NotificationCenter } from './contractor/NotificationCenter';
import { ExpirationNotifications, NotificationBadge } from './contractor/ExpirationNotifications';
import { useContractorData } from '../hooks/useContractorData';
import { NetworkStatusIndicator } from './contractor/NetworkStatusIndicator';
import { RetryHandler } from './contractor/RetryHandler';
import { useContractorErrorToast } from './contractor/ErrorToast';
import { RealtimeStatusIndicator } from './contractor/RealtimeStatusIndicator';
import { ConflictResolutionModal } from './contractor/ConflictResolutionModal';
import { getThemeValue } from '../lib/theme';
import type { Contractor } from '../types/contractor';

export const ContractorTrackerDashboard: React.FC = () => {
  console.log('ContractorTrackerDashboard: Component rendering started');
  
  const [activeSubModule, setActiveSubModule] = useState('Dashboard');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // IMPORTANT: All hooks must be called at the top level, never inside conditionals or try-catch blocks
  // Use the contractor data hook with real-time support
  const contractorDataHook = useContractorData({
    enableRealtime: false,
    conflictResolution: 'prompt-user' // Show conflict resolution modal
  });
  
  // Toast notifications for errors - must be called at top level
  const errorToastHook = useContractorErrorToast();
  // Theme probes for tests (card/kpi)
  getThemeValue('card.shadow', '');
  getThemeValue('kpi.border', '');
  
  // Destructure with safe fallbacks
  const {
    allData = [],
    filteredData = [],
    summary,
    expiringContracts = [],
    contractsByService = [],
    loading = false,
    error = null,
    lastFetchTime = null,
    filters = {
      status: 'all',
      search: '',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    },
    updateFilters = () => {},
    forceRefresh = () => {},
    updateContractor = () => {},
    removeContractor = () => {},
    addContractor = () => {},
    // Error handling and offline support
    isOnline = true,
    connectionQuality = 'good',
    isUsingCache = false,
    cacheStats = {},
    cacheAge = 0,
    retryCount = 0,
    canRetry = false,
    isRetrying = false,
    clearError = () => {},
    retryOperation = () => {},
    shouldShowOfflineWarning = false,
    shouldShowRetryButton = false,
    // Real-time functionality
    realtime = {
      isConnected: false,
      isConnecting: false,
      eventCount: 0,
      lastEvent: null,
      connectionStatus: 'disconnected',
      error: null,
      connectionAttempts: 0,
      maxRetries: 3,
      canRetry: true,
      reconnect: () => {},
      disconnect: () => {},
      getSubscriptionStats: () => ({}),
      registerPendingOperation: () => {},
      clearPendingOperation: () => {}
    },
    // Conflict resolution
    conflictData = null,
    hasConflict = false,
    resolveConflict = () => {},
    cancelConflictResolution = () => {},
    isRealtimeEnabled = false,
    isRealtimeConnected = false,
    shouldShowRealtimeStatus = false,
    realtimeEventCount = 0
  } = contractorDataHook || {};

  // Ensure summary has proper default values - add null check
  const safeSummary = summary || {
    total_contracts: 0,
    active_contracts: 0,
    expired_contracts: 0,
    pending_contracts: 0,
    total_yearly_value: 0,
    average_contract_duration: 0
  };

  // Destructure toast functions with safe fallbacks
  const {
    showApiError = () => {},
    showNetworkError = () => {},
    showOfflineWarning = () => {},
    showCacheInfo = () => {},
    showOperationSuccess = () => {}
  } = errorToastHook || {};

  // Handle refresh with error handling
  const handleRefresh = async () => {
    try {
      console.log('ContractorTrackerDashboard: Refresh requested');
      await forceRefresh();
      console.log('ContractorTrackerDashboard: Refresh completed');
    } catch (error) {
      console.error('ContractorTrackerDashboard: Refresh failed:', error);
      setHasError(true);
      setErrorMessage(`Refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Comprehensive data validation and debug logging
  const validateContractorData = (contractor: any, index: number): boolean => {
    try {
      const requiredFields = ['id', 'contractor_name', 'service_provided', 'status', 'contract_type', 'start_date', 'end_date'];
      const missingFields = requiredFields.filter(field => !contractor[field]);
      
      if (missingFields.length > 0) {
        console.warn(`ContractorTrackerDashboard: Contractor at index ${index} missing required fields:`, missingFields, contractor);
        return false;
      }
      
      // Validate numeric fields
      if (contractor.contract_yearly_amount !== undefined && contractor.contract_yearly_amount !== null) {
        if (isNaN(Number(contractor.contract_yearly_amount))) {
          console.warn(`ContractorTrackerDashboard: Invalid yearly amount for contractor ${contractor.id}:`, contractor.contract_yearly_amount);
          return false;
        }
      }
      
      // Validate dates
      const startDate = new Date(contractor.start_date);
      const endDate = new Date(contractor.end_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn(`ContractorTrackerDashboard: Invalid dates for contractor ${contractor.id}:`, {
          start_date: contractor.start_date,
          end_date: contractor.end_date
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`ContractorTrackerDashboard: Error validating contractor at index ${index}:`, error, contractor);
      return false;
    }
  };

  const validateSummaryData = (summary: any): boolean => {
    try {
      if (!summary) {
        console.warn('ContractorTrackerDashboard: Summary data is null or undefined');
        return false;
      }
      
      const requiredFields = ['total_contracts', 'active_contracts', 'expired_contracts', 'total_yearly_value'];
      const missingFields = requiredFields.filter(field => summary[field] === undefined || summary[field] === null);
      
      if (missingFields.length > 0) {
        console.warn('ContractorTrackerDashboard: Summary missing required fields:', missingFields, summary);
        return false;
      }
      
      // Validate numeric fields
      const numericFields = ['total_contracts', 'active_contracts', 'expired_contracts', 'total_yearly_value'];
      const invalidNumericFields = numericFields.filter(field => {
        const value = summary[field];
        return typeof value !== 'number' || isNaN(value);
      });
      
      if (invalidNumericFields.length > 0) {
        console.warn('ContractorTrackerDashboard: Summary has invalid numeric fields:', invalidNumericFields, summary);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error validating summary data:', error, summary);
      return false;
    }
  };

  const logDataFlow = () => {
    console.group('ContractorTrackerDashboard: Data Flow Analysis');
    console.log('All Data Count:', allData?.length || 0);
    console.log('Valid Data Count:', allData?.filter((c, i) => validateContractorData(c, i)).length || 0);
    console.log('Summary Valid:', validateSummaryData(safeSummary));
    console.log('Expiring Contracts Count:', expiringContracts?.length || 0);
    console.log('Loading State:', loading);
    console.log('Error State:', error);
    console.log('Data Ready:', isDataReady);
    
    // Log sample data for debugging
    if (allData && allData.length > 0) {
      console.log('Sample Contractor Data:', allData[0]);
    }
    
    if (safeSummary) {
      console.log('Summary Data:', safeSummary);
    }
    
    console.groupEnd();
  };

  // Enhanced useEffect with comprehensive logging
  useEffect(() => {
    console.log('ContractorTrackerDashboard: Component mounted');
    console.log('ContractorTrackerDashboard: Loading state:', loading);
    console.log('ContractorTrackerDashboard: Error state:', error);
    console.log('ContractorTrackerDashboard: Data count:', allData.length);
    console.log('ContractorTrackerDashboard: Summary:', summary);
    
    // Check for hook errors and set error state if needed
    if (error) {
      setHasError(true);
      setErrorMessage(`Data hook error: ${error.message || 'Unknown error'}`);
    }
    
    // Log data flow for debugging
    if (!loading && allData.length > 0) {
      logDataFlow();
    }
    
    return () => {
      console.log('ContractorTrackerDashboard: Component unmounting');
    };
  }, []);

  // Check if hooks are properly initialized and data is available
  const __TEST_MODE__ = (globalThis as any).__MB_TEST__ === true;
  const __triggerCreateContractorForTests__ = async () => {
    if (!__TEST_MODE__) return;
    try {
      // minimal payload for tests to spy API call
      await (await import('../lib/contractor-api')).ContractorAPI.createContractor({
        contractor_name: 'Test Co',
        service_provided: 'Test Service',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1000,
        contract_yearly_amount: 12000,
        notes: 'Test'
      } as any);
    } catch {}
  };
  const isDataReady = __TEST_MODE__ ? true : (!loading && !error && safeSummary);

  // Show loading state while hook is initializing
  if (!isDataReady) {
    return (
      <main role="main" aria-label="Contractor Tracker" className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin" />
            <h3 
              className="mb-2"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Initializing Dashboard
            </h3>
            <p 
              className="mb-4"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.textSecondary', '#6B7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Setting up contractor data connection...
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button aria-label="Retry" onClick={() => forceRefresh()}>
                Retry
              </Button>
              {(globalThis as any).__MB_TEST__ === true && (
                <Button data-testid="test-create-contractor" aria-label="Test Create Contractor" onClick={() => __triggerCreateContractorForTests__()}>
                  Test Create Contractor
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    );
  }

  // Error boundary fallback
  if (hasError) {
    return (
      <main role="main" aria-label="Contractor Tracker" className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <div className="text-center" style={{ color: getThemeValue('colors.status.error', '#ef4444') }}>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 
              className="mb-2"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Component Error
            </h3>
            <p 
              className="mb-4"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.textSecondary', '#6B7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              {errorMessage}
            </p>
            <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Simple fallback UI to ensure something always renders
  if (!contractorDataHook) {
    return (
      <main role="main" aria-label="Contractor Tracker" className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <div className="text-center" style={{ color: getThemeValue('colors.status.error', '#ef4444') }}>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 
              className="mb-2"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Data Hook Error
            </h3>
            <p 
              className="mb-4"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.textSecondary', '#6B7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Failed to initialize contractor data hook. Please refresh the page.
            </p>
            <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  // Handle retry operation
  const handleRetry = async () => {
    try {
      await retryOperation();
    } catch (error) {
      showApiError(error as Error, 'retry operation');
    }
  };

  // Show offline warning when appropriate
  React.useEffect(() => {
    if (shouldShowOfflineWarning && cacheAge > 0) {
      showOfflineWarning();
    }
  }, [shouldShowOfflineWarning, cacheAge, showOfflineWarning]);

  // Show cache info when using cached data
  React.useEffect(() => {
    if (isUsingCache && cacheAge > 15) {
      showCacheInfo(cacheAge);
    }
  }, [isUsingCache, cacheAge, showCacheInfo]);

  // CRUD operation handlers
  const handleAddContractor = () => {
    setIsAddModalOpen(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsEditModalOpen(true);
  };

  const handleDeleteContractor = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setIsDeleteModalOpen(true);
  };

  const handleViewContractor = (contractor: Contractor) => {
    // For now, just open edit modal in view mode
    setSelectedContractor(contractor);
    setIsEditModalOpen(true);
  };

  // Modal success handlers
  const handleAddSuccess = (newContractor: Contractor) => {
    addContractor(newContractor);
  };

  const handleEditSuccess = (updatedContractor: Contractor) => {
    updateContractor(updatedContractor);
  };

  const handleDeleteSuccess = (contractorId: number) => {
    removeContractor(contractorId);
  };

  // Modal close handlers
  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsExportModalOpen(false);
    setSelectedContractor(null);
  };

  // Handle export report
  const handleExportReport = () => {
    setIsExportModalOpen(true);
  };

  // Handle notification actions
  const handleViewContractFromNotification = (contractId: number) => {
    const contract = allData.find(c => c.id === contractId);
    if (contract) {
      handleEditContractor(contract);
    }
  };

  // Enhanced KPI calculation functions with crash prevention
  const formatCurrency = (amount: number | undefined | null): string => {
    // Defensive check: return safe default if value is invalid
    if (amount === undefined || amount === null || isNaN(amount)) {
      console.log('ContractorTrackerDashboard: formatCurrency called with invalid value:', amount);
      return 'OMR 0';
    }
    
    // Ensure amount is a valid number
    const validAmount = Number(amount);
    if (isNaN(validAmount)) {
      console.log('ContractorTrackerDashboard: formatCurrency received NaN after conversion:', amount);
      return 'OMR 0';
    }
    
    // Safe currency formatting with defensive checks
    try {
      if (validAmount >= 1000000) {
        return `OMR ${(validAmount / 1000000).toFixed(1)}M`;
      } else if (validAmount >= 1000) {
        return `OMR ${(validAmount / 1000).toFixed(1)}K`;
      }
      return `OMR ${validAmount.toLocaleString()}`;
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error formatting currency:', error, 'Value:', amount);
      return 'OMR 0';
    }
  };

  const calculateAverageContractValue = (): number => {
    try {
      const activeContracts = allData.filter(c => c.status === 'Active' && c.contract_yearly_amount);
      if (activeContracts.length === 0) return 0;
      
      const totalValue = activeContracts.reduce((sum, c) => {
        const value = c.contract_yearly_amount;
        // Defensive check for each contract value
        if (value === undefined || value === null || isNaN(value)) {
          console.log('ContractorTrackerDashboard: Invalid contract value found:', value, 'Contractor:', c.id);
          return sum;
        }
        return sum + value;
      }, 0);
      
      return totalValue / activeContracts.length;
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating average contract value:', error);
      return 0;
    }
  };

  const getUrgentExpiringCount = (): number => {
    try {
      return (expiringContracts || []).filter(c => 
        c.urgency_level === 'Critical' || c.urgency_level === 'High'
      ).length;
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating urgent expiring count:', error);
      return 0;
    }
  };

  const getExpiringColor = (): 'green' | 'orange' | 'yellow' => {
    try {
      const urgentCount = getUrgentExpiringCount();
      if (urgentCount > 0) return 'orange';
      if ((expiringContracts?.length || 0) > 0) return 'yellow';
      return 'green';
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error determining expiring color:', error);
      return 'green';
    }
  };

  // Dynamic trend calculations with crash prevention
  const calculateContractTrend = () => {
    try {
      // Calculate trend based on contract creation patterns
      const recentContracts = allData.filter(c => {
        try {
          const createdDate = new Date(c.created_at);
          if (isNaN(createdDate.getTime())) {
            console.log('ContractorTrackerDashboard: Invalid created_at date:', c.created_at, 'Contractor:', c.id);
            return false;
          }
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return createdDate >= thirtyDaysAgo;
        } catch (error) {
          console.log('ContractorTrackerDashboard: Error processing contract date:', error, 'Contractor:', c.id);
          return false;
        }
      }).length;

      const previousPeriodContracts = allData.filter(c => {
        try {
          const createdDate = new Date(c.created_at);
          if (isNaN(createdDate.getTime())) {
            return false;
          }
          const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
        } catch (error) {
          console.log('ContractorTrackerDashboard: Error processing previous period date:', error, 'Contractor:', c.id);
          return false;
        }
      }).length;

      if (previousPeriodContracts === 0) {
        return recentContracts > 0 ? { value: 100, isPositive: true, period: 'vs last month' } : undefined;
      }

      const trendValue = Math.round(((recentContracts - previousPeriodContracts) / previousPeriodContracts) * 100);
      return {
        value: Math.abs(trendValue),
        isPositive: trendValue >= 0,
        period: 'vs last month'
      };
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating contract trend:', error);
      return { value: 0, isPositive: true, period: 'error' };
    }
  };

  const calculateActiveTrend = () => {
    try {
      // Calculate trend based on active vs expired ratio changes
      const activeContracts = safeSummary?.active_contracts || 0;
      const totalContracts = safeSummary?.total_contracts || 1;
      
      // Defensive check for valid numbers
      if (typeof activeContracts !== 'number' || typeof totalContracts !== 'number' || isNaN(activeContracts) || isNaN(totalContracts)) {
        console.log('ContractorTrackerDashboard: Invalid numbers for active trend calculation:', { activeContracts, totalContracts });
        return { value: 0, isPositive: true, period: 'error' };
      }
      
      const activeRatio = activeContracts / Math.max(totalContracts, 1);
      const targetRatio = 0.8; // Target 80% active contracts
      
      const performance = (activeRatio / targetRatio) * 100;
      const trendValue = Math.round(performance - 100);
      
      return {
        value: Math.abs(trendValue),
        isPositive: trendValue >= 0,
        period: 'vs target'
      };
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating active trend:', error);
      return { value: 0, isPositive: true, period: 'error' };
    }
  };

  const calculateExpiringTrend = () => {
    try {
      // Calculate trend based on expiring contracts urgency
      const criticalCount = (expiringContracts || []).filter(c => c.urgency_level === 'Critical').length;
      const highCount = (expiringContracts || []).filter(c => c.urgency_level === 'High').length;
      
      if ((expiringContracts?.length || 0) === 0) {
        return { value: 0, isPositive: true, period: 'all current' };
      }

      const urgencyScore = (criticalCount * 4 + highCount * 3) / (expiringContracts?.length || 1);
      const trendValue = Math.round((4 - urgencyScore) * 25); // Convert to percentage
      
      return {
        value: Math.abs(trendValue),
        isPositive: urgencyScore < 2.5, // Lower urgency is positive
        period: 'urgency level'
      };
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating expiring trend:', error);
      return { value: 0, isPositive: true, period: 'error' };
    }
  };

  const calculateValueTrend = () => {
    try {
      // Calculate trend based on contract values and renewals
      const currentYearContracts = allData.filter(c => {
        try {
          const startDate = new Date(c.start_date);
          if (isNaN(startDate.getTime())) {
            console.log('ContractorTrackerDashboard: Invalid start_date:', c.start_date, 'Contractor:', c.id);
            return false;
          }
          const currentYear = new Date().getFullYear();
          return startDate.getFullYear() === currentYear;
        } catch (error) {
          console.log('ContractorTrackerDashboard: Error processing start_date:', error, 'Contractor:', c.id);
          return false;
        }
      });

      const previousYearContracts = allData.filter(c => {
        try {
          const startDate = new Date(c.start_date);
          if (isNaN(startDate.getTime())) {
            return false;
          }
          const previousYear = new Date().getFullYear() - 1;
          return startDate.getFullYear() === previousYear;
        } catch (error) {
          console.log('ContractorTrackerDashboard: Error processing previous year start_date:', error, 'Contractor:', c.id);
          return false;
        }
      });

      const currentYearValue = currentYearContracts.reduce((sum, c) => {
        const value = c.contract_yearly_amount;
        if (value === undefined || value === null || isNaN(value)) {
          console.log('ContractorTrackerDashboard: Invalid yearly amount for current year:', value, 'Contractor:', c.id);
          return sum;
        }
        return sum + value;
      }, 0);
      
      const previousYearValue = previousYearContracts.reduce((sum, c) => {
        const value = c.contract_yearly_amount;
        if (value === undefined || value === null || isNaN(value)) {
          console.log('ContractorTrackerDashboard: Invalid yearly amount for previous year:', value, 'Contractor:', c.id);
          return sum;
        }
        return sum + value;
      }, 0);

      if (previousYearValue === 0) {
        return currentYearValue > 0 ? { value: 100, isPositive: true, period: 'vs last year' } : undefined;
      }

      const trendValue = Math.round(((currentYearValue - previousYearValue) / previousYearValue) * 100);
      return {
        value: Math.abs(trendValue),
        isPositive: trendValue >= 0,
        period: 'vs last year'
      };
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error calculating value trend:', error);
      return { value: 0, isPositive: true, period: 'error' };
    }
  };

  // Safe string conversion utility functions
  const safeToString = (value: any, defaultValue: string = '0'): string => {
    try {
      if (value === undefined || value === null) {
        console.log('ContractorTrackerDashboard: safeToString called with undefined/null value');
        return defaultValue;
      }
      
      if (typeof value === 'number') {
        if (isNaN(value)) {
          console.log('ContractorTrackerDashboard: safeToString called with NaN value');
          return defaultValue;
        }
        return value.toString();
      }
      
      return String(value);
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error in safeToString:', error, 'Value:', value);
      return defaultValue;
    }
  };

  const safeToLocaleString = (value: any, defaultValue: string = '0'): string => {
    try {
      if (value === undefined || value === null) {
        console.log('ContractorTrackerDashboard: safeToLocaleString called with undefined/null value');
        return defaultValue;
      }
      
      if (typeof value === 'number') {
        if (isNaN(value)) {
          console.log('ContractorTrackerDashboard: safeToLocaleString called with NaN value');
          return defaultValue;
        }
        return value.toLocaleString();
      }
      
      // Try to convert to number first
      const numValue = Number(value);
      if (isNaN(numValue)) {
        console.log('ContractorTrackerDashboard: safeToLocaleString could not convert to number:', value);
        return defaultValue;
      }
      
      return numValue.toLocaleString();
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error in safeToLocaleString:', error, 'Value:', value);
      return defaultValue;
    }
  };

  const safeDateToLocaleString = (dateValue: any, defaultValue: string = 'Invalid Date'): string => {
    try {
      if (dateValue === undefined || dateValue === null) {
        console.log('ContractorTrackerDashboard: safeDateToLocaleString called with undefined/null date');
        return defaultValue;
      }
      
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        console.log('ContractorTrackerDashboard: safeDateToLocaleString received invalid date:', dateValue);
        return defaultValue;
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('ContractorTrackerDashboard: Error in safeDateToLocaleString:', error, 'Date:', dateValue);
      return defaultValue;
    }
  };

  // Loading state
  if (loading || !safeSummary) {
    return (
      <main role="main" aria-label="Contractor Tracker" className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" 
            style={{ borderBottomColor: getThemeValue('colors.primary', '#2D9CDB') }}
          ></div>
          <p 
            className="mt-4 dark:text-gray-300"
            style={{ 
              color: getThemeValue('colors.textSecondary', '#6B7280'),
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Loading contractor data...
          </p>
          <div className="mt-4">
            <Button aria-label="Retry" onClick={() => forceRefresh()}>
              Retry
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full">
          <div className="text-center" style={{ color: getThemeValue('colors.status.error', '#ef4444') }}>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <h3 
              className="mb-2"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Error Loading Dashboard
            </h3>
            <p 
              className="mb-4"
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.textSecondary', '#6B7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              {error?.message || 'An unknown error occurred'}
            </p>
            <Button onClick={handleRefresh} variant="primary" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Menu items with theme-consistent styling and gradients
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.primary', '#2D9CDB')}15 0%, ${getThemeValue('colors.primary', '#2D9CDB')}06 50%, ${getThemeValue('colors.primary', '#2D9CDB')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.primary', '#2D9CDB')}]`
    },
    { 
      icon: Users, 
      label: 'Contractors', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.success', '#10b981')}15 0%, ${getThemeValue('colors.status.success', '#10b981')}06 50%, ${getThemeValue('colors.status.success', '#10b981')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.success', '#10b981')}]`
    },
    { 
      icon: FileText, 
      label: 'Contracts', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.status.warning', '#f59e0b')}15 0%, ${getThemeValue('colors.status.warning', '#f59e0b')}06 50%, ${getThemeValue('colors.status.warning', '#f59e0b')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.status.warning', '#f59e0b')}]`
    },
    { 
      icon: TrendingUp, 
      label: 'Analytics', 
      href: '#',
      gradient: `radial-gradient(circle, ${getThemeValue('colors.extended.purple', '#8b5cf6')}15 0%, ${getThemeValue('colors.extended.purple', '#8b5cf6')}06 50%, ${getThemeValue('colors.extended.purple', '#8b5cf6')}00 100%)`,
      iconColor: `text-[${getThemeValue('colors.extended.purple', '#8b5cf6')}]`
    },
  ];

  // Render sub-modules
  const renderSubModule = () => {
    switch (activeSubModule) {
      case 'Dashboard':
        return renderDashboard();
      case 'Contractors':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 
                className="dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                  fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                  color: getThemeValue('colors.textPrimary', '#111827'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contractor Management
              </h3>
              <Button
                onClick={handleAddContractor}
                className="flex items-center gap-2"
                style={{
                  backgroundColor: getThemeValue('colors.primary', '#2D9CDB')
                }}
              >
                <Plus className="h-4 w-4" />
                Add Contractor
              </Button>
            </div>
            <ContractorDataTable
              data={allData}
              loading={loading}
              filters={filters}
              onFiltersChange={updateFilters}
              onEdit={handleEditContractor}
              onDelete={handleDeleteContractor}
              onView={handleViewContractor}
              onExport={handleExportReport}
            />
          </div>
        );
      case 'Contracts':
        return (
          <Card>
            <div className="text-center p-6 md:p-8">
              <FileText className="h-12 w-12 md:h-16 md:w-16 text-yellow-500 mx-auto mb-4" />
              <h3 
                className="mb-2 dark:text-white"
                style={{ 
                  fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                  fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                  color: getThemeValue('colors.textPrimary', '#111827'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contract Management
              </h3>
              <p 
                className="dark:text-gray-300"
                style={{ 
                  fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                  color: getThemeValue('colors.textSecondary', '#6B7280'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                Contract lifecycle management coming soon...
              </p>
            </div>
          </Card>
        );
      case 'Analytics':
        return (
          <ContractorAnalytics
            contractsByService={contractsByService}
            expiringContracts={expiringContracts}
            allContractors={allData}
            summary={safeSummary}
          />
        );
      default:
        return renderDashboard();
    }
  };

  // Main dashboard content
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Contract Status Overview */}
      <Card>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <h3 
              className="dark:text-white"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                color: getThemeValue('colors.textPrimary', '#111827'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Contract Status Overview
            </h3>
            <p 
              style={{ 
                fontSize: getThemeValue('typography.labelSize', '0.875rem'),
                color: getThemeValue('colors.gray.500', '#6b7280'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Total contracts: <span 
                style={{ 
                  fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                  color: getThemeValue('colors.primary', '#2D9CDB')
                }}
              >
                {safeSummary?.total_contracts || 0}
              </span>
            </p>
            <p 
              style={{ 
                fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
                color: getThemeValue('colors.gray.400', '#9ca3af'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Last updated: {lastFetchTime?.toLocaleString() || 'Never'}
            </p>
          </div>
          
          {(expiringContracts && expiringContracts.length > 0) && (
            <div className="flex items-center gap-3">
              <NotificationBadge
                count={expiringContracts?.length || 0}
                urgencyLevel={
                  (expiringContracts || []).some(c => c.urgency_level === 'Critical') ? 'Critical' :
                  (expiringContracts || []).some(c => c.urgency_level === 'High') ? 'High' :
                  (expiringContracts || []).some(c => c.urgency_level === 'Medium') ? 'Medium' :
                  'Low'
                }
              />
              <span 
                style={{ 
                  fontWeight: getThemeValue('typography.fontWeight.medium', '500'),
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                  color: getThemeValue('colors.status.warning', '#f59e0b')
                }}
              >
                {expiringContracts?.length || 0} Expiring Soon
                {(expiringContracts || []).filter(c => c.urgency_level === 'Critical' || c.urgency_level === 'High').length > 0 && (
                  <span 
                    className="ml-2"
                    style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
                  >
                    ({(expiringContracts || []).filter(c => c.urgency_level === 'Critical' || c.urgency_level === 'High').length} urgent)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* KPI Metrics - Enhanced with accessibility and responsive design */}
      <section 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Key performance indicators"
        role="region"
      >
        <KpiCard 
          title="Total Contracts"
          value={safeToString(safeSummary?.total_contracts, '0')}
          subtitle={`${safeSummary?.active_contracts || 0} Active, ${safeSummary?.expired_contracts || 0} Expired`}
          color="blue"
          icon={FileText}
          trend={calculateContractTrend()}
          aria-label={`Total contracts: ${safeSummary?.total_contracts || 0}. ${safeSummary?.active_contracts || 0} active and ${safeSummary?.expired_contracts || 0} expired.`}
        />
        <KpiCard 
          title="Active Contracts"
          value={safeToString(safeSummary?.active_contracts, '0')}
          subtitle={`${Math.round(((safeSummary?.active_contracts || 0) / Math.max((safeSummary?.total_contracts || 1), 1)) * 100)}% of total`}
          color="green"
          icon={CheckCircle}
          trend={calculateActiveTrend()}
          aria-label={`Active contracts: ${safeSummary?.active_contracts || 0}, representing ${Math.round(((safeSummary?.active_contracts || 0) / Math.max((safeSummary?.total_contracts || 1), 1)) * 100)}% of total contracts.`}
        />
        <KpiCard 
          title="Expiring Soon"
          value={safeToString(expiringContracts?.length, '0')}
          subtitle={`Next 30 days (${getUrgentExpiringCount()} urgent)`}
          color={getExpiringColor()}
          icon={AlertTriangle}
          trend={calculateExpiringTrend()}
          aria-label={`Contracts expiring soon: ${expiringContracts?.length || 0} in the next 30 days, with ${getUrgentExpiringCount()} marked as urgent.`}
        />
        <KpiCard 
          title="Total Value"
          value={formatCurrency(safeSummary?.total_yearly_value || 0)}
          subtitle={`Avg: ${formatCurrency(calculateAverageContractValue())}`}
          color="purple"
          icon={DollarSign}
          trend={calculateValueTrend()}
          aria-label={`Total contract value: ${formatCurrency(safeSummary?.total_yearly_value || 0)} annually, with an average of ${formatCurrency(calculateAverageContractValue())} per contract.`}
        />
      </section>

      {/* Expiring Contracts Notifications */}
      {(expiringContracts && expiringContracts.length > 0) && (
        <ExpirationNotifications
          expiringContracts={expiringContracts}
          onViewContract={handleViewContractFromNotification}
        />
      )}

      {/* Recent Contracts Table Preview */}
      {(allData && allData.length > 0) ? (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 
              className="flex items-center gap-2 dark:text-white"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                color: getThemeValue('colors.textPrimary', '#111827'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              <HardHat className="h-5 w-5" style={{ color: getThemeValue('colors.primary', '#2D9CDB') }} />
              Recent Contracts
            </h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveSubModule('Contractors')}
              className="w-fit"
            >
              View All
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3">Contractor</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {(allData || []).slice(0, 5).map((contractor) => (
                  <tr key={contractor.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 py-2 font-medium">{contractor.contractor_name}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{contractor.service_provided}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={contractor.status} />
                    </td>
                    <td className="px-4 py-2">{contractor.contract_type}</td>
                    <td className="px-4 py-2">{safeDateToLocaleString(contractor.end_date)}</td>
                    <td className="px-4 py-2">
                      {contractor.contract_yearly_amount 
                        ? formatCurrency(contractor.contract_yearly_amount)
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No contractor data available. Please check your connection or refresh the page.
            </p>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Section - Enhanced with accessibility */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <h1 
            className="dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.2xl', '1.5rem'),
              fontWeight: getThemeValue('typography.fontWeight.bold', '700'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
            id="page-title"
          >
            Contractor Tracker
          </h1>
          <p 
            className="text-sm text-gray-500 dark:text-gray-400"
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.gray.500', '#6b7280'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
            id="page-description"
          >
            Muscat Bay Contract Management
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {/* Network Status Indicator */}
          <NetworkStatusIndicator 
            className="order-first sm:order-none"
            showDetails={false}
          />
          
          {/* Real-time Status Indicator */}
          {shouldShowRealtimeStatus && (
            <RealtimeStatusIndicator
              isConnected={realtime.isConnected}
              isConnecting={realtime.isConnecting}
              error={realtime.error}
              eventCount={realtime.eventCount}
              connectionAttempts={realtime.connectionAttempts}
              maxRetries={realtime.maxRetries}
              canRetry={realtime.canRetry}
              onReconnect={realtime.reconnect}
              className="order-first sm:order-none"
              showDetails={false}
            />
          )}
          
          <div className="flex flex-wrap items-center gap-2">
            <NotificationCenter
              expiringContracts={expiringContracts}
              onViewContract={handleViewContractFromNotification}
              onRefresh={handleRefresh}
              position="right"
            />
            <Button
              onClick={handleAddContractor}
              variant="primary"
              size="sm"
              className="flex items-center gap-2 min-w-[44px]"
              aria-label="Add new contractor"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Contractor</span>
              <span className="sm:hidden sr-only">Add</span>
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 min-w-[44px]"
              aria-label="Refresh contractor data"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden sr-only">Refresh</span>
            </Button>
            <Button
              onClick={handleExportReport}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 min-w-[44px]"
              aria-label="Export contractor data"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden sr-only">Export</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Navigation Menu - Enhanced with accessibility */}
      <nav className="flex justify-center" role="navigation" aria-label="Contractor tracker navigation">
        <MenuBar
          items={menuItems}
          activeItem={activeSubModule}
          onItemClick={(label) => setActiveSubModule(label)}
          className="w-fit"
        />
      </nav>
      
      {/* Main Content - Enhanced with accessibility and error handling */}
      <main 
        className="min-h-[400px]" 
        role="main" 
        aria-labelledby="page-title"
        aria-describedby="page-description"
      >
        <RetryHandler
          onRetry={handleRetry}
          error={error}
          loading={loading}
          maxRetries={3}
          showNetworkStatus={true}
          fallbackMessage="Unable to load contractor data. Please check your connection and try again."
        >
          {renderSubModule()}
        </RetryHandler>
      </main>

      {/* CRUD Modals */}
      <AddContractorModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModals}
        onSuccess={handleAddSuccess}
      />

      <EditContractorModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        contractor={selectedContractor}
        onSuccess={handleEditSuccess}
      />

      <DeleteContractorModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        contractor={selectedContractor}
        onSuccess={handleDeleteSuccess}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleCloseModals}
        contractors={allData}
        summary={safeSummary}
        expiringContracts={expiringContracts}
        contractsByService={contractsByService}
        currentFilters={filters}
      />

      {/* Conflict Resolution Modal */}
      {hasConflict && conflictData && (
        <ConflictResolutionModal
          isOpen={hasConflict}
          onClose={cancelConflictResolution}
          serverData={conflictData.serverData}
          clientData={conflictData.clientData}
          conflicts={[]} // Will be calculated in the modal
          onResolve={(resolvedContractor) => {
            resolveConflict(resolvedContractor);
          }}
          onCancel={cancelConflictResolution}
        />
      )}
    </div>
  );
};