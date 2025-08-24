import React, { useState } from 'react';
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
  const [activeSubModule, setActiveSubModule] = useState('Dashboard');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  
  // Use the contractor data hook with real-time support
  const {
    allData,
    filteredData,
    summary,
    expiringContracts,
    contractsByService,
    loading,
    error,
    lastFetchTime,
    filters,
    updateFilters,
    forceRefresh,
    updateContractor,
    removeContractor,
    addContractor,
    // Error handling and offline support
    isOnline,
    connectionQuality,
    isUsingCache,
    cacheStats,
    cacheAge,
    retryCount,
    canRetry,
    isRetrying,
    clearError,
    retryOperation,
    shouldShowOfflineWarning,
    shouldShowRetryButton,
    // Real-time functionality
    realtime,
    conflictData,
    hasConflict,
    resolveConflict,
    cancelConflictResolution,
    isRealtimeEnabled,
    isRealtimeConnected,
    shouldShowRealtimeStatus,
    realtimeEventCount
  } = useContractorData({
    enableRealtime: true,
    conflictResolution: 'prompt-user' // Show conflict resolution modal
  });

  // Toast notifications for errors
  const {
    showApiError,
    showNetworkError,
    showOfflineWarning,
    showCacheInfo,
    showOperationSuccess
  } = useContractorErrorToast();

  // Handle refresh with error handling
  const handleRefresh = async () => {
    try {
      clearError();
      await forceRefresh();
      showOperationSuccess('Data refreshed successfully');
    } catch (error) {
      showApiError(error as Error, 'refresh data', handleRefresh);
    }
  };

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

  // Enhanced KPI calculation functions
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `OMR ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `OMR ${(amount / 1000).toFixed(1)}K`;
    }
    return `OMR ${amount.toLocaleString()}`;
  };

  const calculateAverageContractValue = (): number => {
    const activeContracts = allData.filter(c => c.status === 'Active' && c.contract_yearly_amount);
    if (activeContracts.length === 0) return 0;
    
    const totalValue = activeContracts.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);
    return totalValue / activeContracts.length;
  };

  const getUrgentExpiringCount = (): number => {
    return expiringContracts.filter(c => 
      c.urgency_level === 'Critical' || c.urgency_level === 'High'
    ).length;
  };

  const getExpiringColor = (): 'green' | 'orange' | 'yellow' => {
    const urgentCount = getUrgentExpiringCount();
    if (urgentCount > 0) return 'orange';
    if (expiringContracts.length > 0) return 'yellow';
    return 'green';
  };

  // Dynamic trend calculations based on historical data patterns
  const calculateContractTrend = () => {
    // Calculate trend based on contract creation patterns
    const recentContracts = allData.filter(c => {
      const createdDate = new Date(c.created_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate >= thirtyDaysAgo;
    }).length;

    const previousPeriodContracts = allData.filter(c => {
      const createdDate = new Date(c.created_at);
      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo;
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
  };

  const calculateActiveTrend = () => {
    // Calculate trend based on active vs expired ratio changes
    const activeRatio = summary.active_contracts / Math.max(summary.total_contracts, 1);
    const targetRatio = 0.8; // Target 80% active contracts
    
    const performance = (activeRatio / targetRatio) * 100;
    const trendValue = Math.round(performance - 100);
    
    return {
      value: Math.abs(trendValue),
      isPositive: trendValue >= 0,
      period: 'vs target'
    };
  };

  const calculateExpiringTrend = () => {
    // Calculate trend based on expiring contracts urgency
    const criticalCount = expiringContracts.filter(c => c.urgency_level === 'Critical').length;
    const highCount = expiringContracts.filter(c => c.urgency_level === 'High').length;
    
    if (expiringContracts.length === 0) {
      return { value: 0, isPositive: true, period: 'all current' };
    }

    const urgencyScore = (criticalCount * 4 + highCount * 3) / expiringContracts.length;
    const trendValue = Math.round((4 - urgencyScore) * 25); // Convert to percentage
    
    return {
      value: Math.abs(trendValue),
      isPositive: urgencyScore < 2.5, // Lower urgency is positive
      period: 'urgency level'
    };
  };

  const calculateValueTrend = () => {
    // Calculate trend based on contract values and renewals
    const currentYearContracts = allData.filter(c => {
      const startDate = new Date(c.start_date);
      const currentYear = new Date().getFullYear();
      return startDate.getFullYear() === currentYear;
    });

    const previousYearContracts = allData.filter(c => {
      const startDate = new Date(c.start_date);
      const previousYear = new Date().getFullYear() - 1;
      return startDate.getFullYear() === previousYear;
    });

    const currentYearValue = currentYearContracts.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);
    const previousYearValue = previousYearContracts.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);

    if (previousYearValue === 0) {
      return currentYearValue > 0 ? { value: 100, isPositive: true, period: 'vs last year' } : undefined;
    }

    const trendValue = Math.round(((currentYearValue - previousYearValue) / previousYearValue) * 100);
    return {
      value: Math.abs(trendValue),
      isPositive: trendValue >= 0,
      period: 'vs last year'
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
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
        </div>
      </div>
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
              {error}
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
            summary={summary}
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
                {summary.total_contracts}
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
          
          {expiringContracts.length > 0 && (
            <div className="flex items-center gap-3">
              <NotificationBadge
                count={expiringContracts.length}
                urgencyLevel={
                  expiringContracts.some(c => c.urgency_level === 'Critical') ? 'Critical' :
                  expiringContracts.some(c => c.urgency_level === 'High') ? 'High' :
                  expiringContracts.some(c => c.urgency_level === 'Medium') ? 'Medium' :
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
                {expiringContracts.length} Expiring Soon
                {expiringContracts.filter(c => c.urgency_level === 'Critical' || c.urgency_level === 'High').length > 0 && (
                  <span 
                    className="ml-2"
                    style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
                  >
                    ({expiringContracts.filter(c => c.urgency_level === 'Critical' || c.urgency_level === 'High').length} urgent)
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
          value={summary.total_contracts.toString()}
          subtitle={`${summary.active_contracts} Active, ${summary.expired_contracts} Expired`}
          color="blue"
          icon={FileText}
          trend={calculateContractTrend()}
          aria-label={`Total contracts: ${summary.total_contracts}. ${summary.active_contracts} active and ${summary.expired_contracts} expired.`}
        />
        <KpiCard 
          title="Active Contracts"
          value={summary.active_contracts.toString()}
          subtitle={`${Math.round((summary.active_contracts / Math.max(summary.total_contracts, 1)) * 100)}% of total`}
          color="green"
          icon={CheckCircle}
          trend={calculateActiveTrend()}
          aria-label={`Active contracts: ${summary.active_contracts}, representing ${Math.round((summary.active_contracts / Math.max(summary.total_contracts, 1)) * 100)}% of total contracts.`}
        />
        <KpiCard 
          title="Expiring Soon"
          value={expiringContracts.length.toString()}
          subtitle={`Next 30 days (${getUrgentExpiringCount()} urgent)`}
          color={getExpiringColor()}
          icon={AlertTriangle}
          trend={calculateExpiringTrend()}
          aria-label={`Contracts expiring soon: ${expiringContracts.length} in the next 30 days, with ${getUrgentExpiringCount()} marked as urgent.`}
        />
        <KpiCard 
          title="Total Value"
          value={formatCurrency(summary.total_yearly_value)}
          subtitle={`Avg: ${formatCurrency(calculateAverageContractValue())}`}
          color="purple"
          icon={DollarSign}
          trend={calculateValueTrend()}
          aria-label={`Total contract value: ${formatCurrency(summary.total_yearly_value)} annually, with an average of ${formatCurrency(calculateAverageContractValue())} per contract.`}
        />
      </section>

      {/* Expiring Contracts Notifications */}
      {expiringContracts.length > 0 && (
        <ExpirationNotifications
          expiringContracts={expiringContracts}
          onViewContract={handleViewContractFromNotification}
        />
      )}

      {/* Recent Contracts Table Preview */}
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
              {allData.slice(0, 5).map((contractor) => (
                <tr key={contractor.id} className="border-b dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-4 py-2 font-medium">{contractor.contractor_name}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{contractor.service_provided}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={contractor.status} />
                  </td>
                  <td className="px-4 py-2">{contractor.contract_type}</td>
                  <td className="px-4 py-2">{new Date(contractor.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {contractor.contract_yearly_amount 
                      ? `OMR ${contractor.contract_yearly_amount.toLocaleString()}`
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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
        summary={summary}
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