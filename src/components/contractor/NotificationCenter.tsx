import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Eye, EyeOff, Settings, RefreshCw } from 'lucide-react';
import { getThemeValue } from '../../lib/theme';
import { Card, Button } from '../ui';
import { NotificationBadge, ExpirationAlert } from './ExpirationNotifications';
import { useExpirationNotifications } from '../../hooks/useExpirationNotifications';
import type { ExpiringContract } from '../../types/contractor';

interface NotificationCenterProps {
  expiringContracts: ExpiringContract[];
  onViewContract?: (contractId: number) => void;
  onRefresh?: () => void;
  className?: string;
  position?: 'left' | 'right' | 'center';
  maxHeight?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  expiringContracts: ExpiringContract[];
  onViewContract?: (contractId: number) => void;
  onRefresh?: () => void;
  position?: 'left' | 'right' | 'center';
  maxHeight?: string;
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAll: () => void;
  dismissedCount: number;
  totalCount: number;
}

/**
 * Notification Settings Panel
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  onClearAll,
  dismissedCount,
  totalCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between mb-3">
        <h4 
          className="font-medium text-gray-900 dark:text-white"
          style={{ 
            fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
            fontSize: getThemeValue('typography.labelSize', '0.875rem')
          }}
        >
          Notification Settings
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-1 h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Total notifications: {totalCount}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            Dismissed: {dismissedCount}
          </span>
          {dismissedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-xs px-2 py-1"
            >
              <EyeOff className="h-3 w-3 mr-1" />
              Show All
            </Button>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <p 
            className="text-xs text-gray-500"
            style={{ 
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Dismissed notifications will reappear after 24 hours or when contracts are updated.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Dropdown Component
 */
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  expiringContracts,
  onViewContract,
  onRefresh,
  position = 'right',
  maxHeight = '400px'
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    visibleContracts,
    dismissedCount,
    totalCount,
    urgentCount,
    dismissContract,
    clearAllDismissals,
    getNotificationSummary
  } = useExpirationNotifications(expiringContracts);

  const summary = getNotificationSummary();

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right':
      default:
        return 'right-0';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div 
        className={`absolute top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 ${getPositionClasses()}`}
        style={{ maxHeight }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h3 
              className="font-semibold text-gray-900 dark:text-white"
              style={{ 
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem')
              }}
            >
              Notifications
            </h3>
            {visibleContracts.length > 0 && (
              <span 
                className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded-full"
                style={{ 
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                }}
              >
                {visibleContracts.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="p-2 h-8 w-8"
                title="Refresh notifications"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 h-8 w-8"
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        {visibleContracts.length > 0 && (
          <div className="p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p 
                  className="text-sm font-medium text-gray-900 dark:text-white"
                  style={{ 
                    fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                  }}
                >
                  {visibleContracts.length} contract{visibleContracts.length !== 1 ? 's' : ''} expiring soon
                </p>
                {urgentCount > 0 && (
                  <p 
                    className="text-xs mt-1"
                    style={{ 
                      color: getThemeValue('colors.status.error', '#ef4444'),
                      fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
                    }}
                  >
                    {urgentCount} require immediate attention
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                {summary.critical > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded-full">
                    {summary.critical} Critical
                  </span>
                )}
                {summary.high > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200 rounded-full">
                    {summary.high} High
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div 
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(400px - 120px)' }}
        >
          {visibleContracts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p 
                className="text-gray-500 dark:text-gray-400"
                style={{ 
                  fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif'),
                  fontSize: getThemeValue('typography.labelSize', '0.875rem')
                }}
              >
                {totalCount === 0 ? 'No expiring contracts' : 'All notifications dismissed'}
              </p>
              {dismissedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllDismissals}
                  className="mt-3"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Show {dismissedCount} dismissed
                </Button>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Sort by urgency: Critical, High, Medium, Low */}
              {['Critical', 'High', 'Medium', 'Low'].map(urgency => {
                const contractsForUrgency = visibleContracts.filter(
                  contract => contract.urgency_level === urgency
                );
                
                return contractsForUrgency.map(contract => (
                  <ExpirationAlert
                    key={contract.id}
                    contract={contract}
                    onDismiss={dismissContract}
                    onViewContract={onViewContract}
                    compact={urgency === 'Medium' || urgency === 'Low'}
                  />
                ));
              })}
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <NotificationSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onClearAll={clearAllDismissals}
          dismissedCount={dismissedCount}
          totalCount={totalCount}
        />
      </div>
    </>
  );
};

/**
 * Main Notification Center Component
 * Provides a bell icon with badge that opens a dropdown with notifications
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  expiringContracts,
  onViewContract,
  onRefresh,
  className = '',
  position = 'right',
  maxHeight = '400px'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    visibleContracts,
    urgentCount,
    getNotificationSummary
  } = useExpirationNotifications(expiringContracts);

  const summary = getNotificationSummary();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Get highest urgency level for badge color
  const getHighestUrgency = (): 'Critical' | 'High' | 'Medium' | 'Low' => {
    if (summary.critical > 0) return 'Critical';
    if (summary.high > 0) return 'High';
    if (summary.medium > 0) return 'Medium';
    return 'Low';
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={`relative p-2 h-10 w-10 ${isOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        title={`${visibleContracts.length} expiring contracts${urgentCount > 0 ? ` (${urgentCount} urgent)` : ''}`}
      >
        <NotificationBadge
          count={visibleContracts.length}
          urgencyLevel={getHighestUrgency()}
        />
      </Button>

      {/* Dropdown */}
      <NotificationDropdown
        isOpen={isOpen}
        onClose={handleClose}
        expiringContracts={expiringContracts}
        onViewContract={onViewContract}
        onRefresh={onRefresh}
        position={position}
        maxHeight={maxHeight}
      />
    </div>
  );
};