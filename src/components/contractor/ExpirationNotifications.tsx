import React from 'react';
import { Bell, AlertTriangle, Clock, Calendar, X } from 'lucide-react';
import { getThemeValue } from '../../lib/theme';
import { Card, Button } from '../ui';
import type { ExpiringContract } from '../../types/contractor';

interface ExpirationNotificationsProps {
  expiringContracts: ExpiringContract[];
  onDismiss?: (contractId: number) => void;
  onViewContract?: (contractId: number) => void;
  className?: string;
}

interface NotificationBadgeProps {
  count: number;
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  className?: string;
}

interface UrgencyIndicatorProps {
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  daysUntilExpiry: number;
  size?: 'sm' | 'md' | 'lg';
}

interface ExpirationAlertProps {
  contract: ExpiringContract;
  onDismiss?: (contractId: number) => void;
  onViewContract?: (contractId: number) => void;
  compact?: boolean;
}

/**
 * Notification Badge Component
 * Shows count of expiring contracts with urgency-based colors
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  urgencyLevel, 
  className = '' 
}) => {
  const getUrgencyColors = (level: string) => {
    switch (level) {
      case 'Critical':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          pulse: 'animate-pulse',
          shadow: 'shadow-red-500/25'
        };
      case 'High':
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          pulse: '',
          shadow: 'shadow-orange-500/25'
        };
      case 'Medium':
        return {
          bg: 'bg-yellow-500',
          text: 'text-white',
          pulse: '',
          shadow: 'shadow-yellow-500/25'
        };
      case 'Low':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          pulse: '',
          shadow: 'shadow-blue-500/25'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          pulse: '',
          shadow: 'shadow-gray-500/25'
        };
    }
  };

  const colors = getUrgencyColors(urgencyLevel);

  if (count === 0) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Bell 
        className={`h-5 w-5 ${colors.pulse}`}
        style={{ color: getThemeValue('colors.status.warning', '#f59e0b') }}
      />
      <span 
        className={`absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full shadow-lg ${colors.bg} ${colors.text} ${colors.shadow} ${colors.pulse}`}
        style={{ 
          fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
          fontSize: getThemeValue('typography.tooltipSize', '0.75rem'),
          minWidth: '1.25rem',
          height: '1.25rem'
        }}
      >
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};

/**
 * Urgency Indicator Component
 * Visual indicator showing urgency level with colors and icons
 */
export const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ 
  urgencyLevel, 
  daysUntilExpiry, 
  size = 'md' 
}) => {
  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'Critical':
        return {
          color: getThemeValue('colors.status.error', '#ef4444'),
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-200',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          pulse: 'animate-pulse',
          label: 'Critical'
        };
      case 'High':
        return {
          color: getThemeValue('colors.status.warning', '#f59e0b'),
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          textColor: 'text-orange-800 dark:text-orange-200',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: AlertTriangle,
          pulse: '',
          label: 'High'
        };
      case 'Medium':
        return {
          color: getThemeValue('colors.status.warning', '#f59e0b'),
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: Clock,
          pulse: '',
          label: 'Medium'
        };
      case 'Low':
        return {
          color: getThemeValue('colors.status.info', '#3b82f6'),
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-800 dark:text-blue-200',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: Calendar,
          pulse: '',
          label: 'Low'
        };
      default:
        return {
          color: getThemeValue('colors.gray.500', '#6b7280'),
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          textColor: 'text-gray-800 dark:text-gray-200',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: Clock,
          pulse: '',
          label: 'Unknown'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'h-3 w-3',
          dot: 'w-2 h-2'
        };
      case 'lg':
        return {
          container: 'px-3 py-2 text-sm',
          icon: 'h-5 w-5',
          dot: 'w-4 h-4'
        };
      default: // md
        return {
          container: 'px-2.5 py-1.5 text-xs',
          icon: 'h-4 w-4',
          dot: 'w-3 h-3'
        };
    }
  };

  const config = getUrgencyConfig(urgencyLevel);
  const sizeClasses = getSizeClasses(size);
  const IconComponent = config.icon;

  return (
    <div className="flex items-center gap-2">
      {/* Urgency Badge */}
      <span 
        className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses.container} ${config.pulse}`}
        style={{ 
          fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
        }}
      >
        <IconComponent 
          className={`${sizeClasses.icon} flex-shrink-0`}
          style={{ color: config.color }}
        />
        {config.label}
      </span>
      
      {/* Days indicator */}
      <span 
        className="text-xs font-medium"
        style={{ 
          color: getThemeValue('colors.textSecondary', '#6B7280'),
          fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
        }}
      >
        {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
      </span>
    </div>
  );
};

/**
 * Individual Expiration Alert Component
 * Shows detailed information about a single expiring contract
 */
export const ExpirationAlert: React.FC<ExpirationAlertProps> = ({ 
  contract, 
  onDismiss, 
  onViewContract, 
  compact = false 
}) => {
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(contract.id);
  };

  const handleViewContract = () => {
    onViewContract?.(contract.id);
  };

  const formatCurrency = (amount: number | null): string => {
    if (!amount) return 'N/A';
    return `OMR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewContract}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div 
            className={`w-3 h-3 rounded-full flex-shrink-0 ${
              contract.urgency_level === 'Critical' ? 'bg-red-500 animate-pulse' :
              contract.urgency_level === 'High' ? 'bg-orange-500' :
              contract.urgency_level === 'Medium' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          />
          <div className="min-w-0 flex-1">
            <p 
              className="font-medium text-gray-900 dark:text-white truncate"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                fontSize: getThemeValue('typography.labelSize', '0.875rem')
              }}
            >
              {contract.contractor_name}
            </p>
            <p 
              className="text-xs text-gray-500 truncate"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              Expires in {contract.days_until_expiry} days
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <UrgencyIndicator 
            urgencyLevel={contract.urgency_level}
            daysUntilExpiry={contract.days_until_expiry}
            size="sm"
          />
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 
              className="font-semibold text-gray-900 dark:text-white"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem')
              }}
            >
              {contract.contractor_name}
            </h4>
            <UrgencyIndicator 
              urgencyLevel={contract.urgency_level}
              daysUntilExpiry={contract.days_until_expiry}
            />
          </div>
          
          <p 
            className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2"
            style={{ 
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
              fontSize: getThemeValue('typography.labelSize', '0.875rem')
            }}
          >
            {contract.service_provided}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Expires: {formatDate(contract.end_date)}</span>
            </div>
            {contract.contract_yearly_amount && (
              <div className="flex items-center gap-1">
                <span>Value: {formatCurrency(contract.contract_yearly_amount)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {onViewContract && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewContract}
              className="text-xs"
            >
              View Contract
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Main Expiration Notifications Component
 * Manages and displays all expiration-related notifications
 */
export const ExpirationNotifications: React.FC<ExpirationNotificationsProps> = ({ 
  expiringContracts, 
  onDismiss, 
  onViewContract, 
  className = '' 
}) => {
  // Group contracts by urgency level
  const contractsByUrgency = expiringContracts.reduce((acc, contract) => {
    if (!acc[contract.urgency_level]) {
      acc[contract.urgency_level] = [];
    }
    acc[contract.urgency_level].push(contract);
    return acc;
  }, {} as Record<string, ExpiringContract[]>);

  // Get highest urgency level for notification badge
  const getHighestUrgency = (): 'Critical' | 'High' | 'Medium' | 'Low' => {
    if (contractsByUrgency.Critical?.length > 0) return 'Critical';
    if (contractsByUrgency.High?.length > 0) return 'High';
    if (contractsByUrgency.Medium?.length > 0) return 'Medium';
    return 'Low';
  };

  // Get total count of urgent contracts (Critical + High)
  const getUrgentCount = (): number => {
    return (contractsByUrgency.Critical?.length || 0) + (contractsByUrgency.High?.length || 0);
  };

  if (expiringContracts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NotificationBadge 
            count={expiringContracts.length}
            urgencyLevel={getHighestUrgency()}
          />
          <div>
            <h3 
              className="font-semibold text-gray-900 dark:text-white"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem')
              }}
            >
              Contracts Expiring Soon
            </h3>
            <p 
              className="text-sm text-gray-500"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              {expiringContracts.length} contract{expiringContracts.length !== 1 ? 's' : ''} expiring in the next 30 days
              {getUrgentCount() > 0 && (
                <span 
                  className="ml-2 font-medium"
                  style={{ color: getThemeValue('colors.status.error', '#ef4444') }}
                >
                  ({getUrgentCount()} urgent)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Alerts */}
      <div className="space-y-3">
        {/* Critical contracts first */}
        {contractsByUrgency.Critical?.map((contract) => (
          <ExpirationAlert
            key={contract.id}
            contract={contract}
            onDismiss={onDismiss}
            onViewContract={onViewContract}
            compact={false}
          />
        ))}
        
        {/* High priority contracts */}
        {contractsByUrgency.High?.map((contract) => (
          <ExpirationAlert
            key={contract.id}
            contract={contract}
            onDismiss={onDismiss}
            onViewContract={onViewContract}
            compact={false}
          />
        ))}
        
        {/* Medium and Low priority contracts (compact view) */}
        {contractsByUrgency.Medium?.map((contract) => (
          <ExpirationAlert
            key={contract.id}
            contract={contract}
            onDismiss={onDismiss}
            onViewContract={onViewContract}
            compact={true}
          />
        ))}
        
        {contractsByUrgency.Low?.map((contract) => (
          <ExpirationAlert
            key={contract.id}
            contract={contract}
            onDismiss={onDismiss}
            onViewContract={onViewContract}
            compact={true}
          />
        ))}
      </div>
    </div>
  );
};