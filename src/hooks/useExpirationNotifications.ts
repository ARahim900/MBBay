import { useState, useEffect, useCallback } from 'react';
import type { ExpiringContract } from '../types/contractor';

interface NotificationState {
  dismissedContracts: Set<number>;
  lastDismissalTime: number;
}

interface UseExpirationNotificationsOptions {
  autoRefreshInterval?: number; // in milliseconds
  persistDismissals?: boolean;
  dismissalExpiryTime?: number; // in milliseconds
}

interface UseExpirationNotificationsReturn {
  visibleContracts: ExpiringContract[];
  dismissedCount: number;
  totalCount: number;
  urgentCount: number;
  dismissContract: (contractId: number) => void;
  restoreContract: (contractId: number) => void;
  clearAllDismissals: () => void;
  isDismissed: (contractId: number) => boolean;
  getNotificationSummary: () => {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    urgent: number;
  };
}

const STORAGE_KEY = 'contractor_notification_dismissals';
const DEFAULT_DISMISSAL_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Custom hook for managing contract expiration notifications
 * Handles dismissal state, persistence, and notification logic
 */
export const useExpirationNotifications = (
  expiringContracts: ExpiringContract[],
  options: UseExpirationNotificationsOptions = {}
): UseExpirationNotificationsReturn => {
  const {
    autoRefreshInterval = DEFAULT_REFRESH_INTERVAL,
    persistDismissals = true,
    dismissalExpiryTime = DEFAULT_DISMISSAL_EXPIRY
  } = options;

  const [notificationState, setNotificationState] = useState<NotificationState>(() => {
    if (!persistDismissals) {
      return {
        dismissedContracts: new Set(),
        lastDismissalTime: Date.now()
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        
        // Check if dismissals have expired
        if (now - parsed.lastDismissalTime > dismissalExpiryTime) {
          return {
            dismissedContracts: new Set(),
            lastDismissalTime: now
          };
        }
        
        return {
          dismissedContracts: new Set(parsed.dismissedContracts),
          lastDismissalTime: parsed.lastDismissalTime
        };
      }
    } catch (error) {
      console.warn('Failed to load notification dismissals from storage:', error);
    }

    return {
      dismissedContracts: new Set(),
      lastDismissalTime: Date.now()
    };
  });

  // Persist dismissals to localStorage
  const persistState = useCallback((state: NotificationState) => {
    if (!persistDismissals) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        dismissedContracts: Array.from(state.dismissedContracts),
        lastDismissalTime: state.lastDismissalTime
      }));
    } catch (error) {
      console.warn('Failed to persist notification dismissals:', error);
    }
  }, [persistDismissals]);

  // Clean up expired dismissals
  useEffect(() => {
    const now = Date.now();
    if (now - notificationState.lastDismissalTime > dismissalExpiryTime) {
      const newState = {
        dismissedContracts: new Set<number>(),
        lastDismissalTime: now
      };
      setNotificationState(newState);
      persistState(newState);
    }
  }, [notificationState.lastDismissalTime, dismissalExpiryTime, persistState]);

  // Auto-refresh dismissals periodically
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - notificationState.lastDismissalTime > dismissalExpiryTime) {
        const newState = {
          dismissedContracts: new Set<number>(),
          lastDismissalTime: now
        };
        setNotificationState(newState);
        persistState(newState);
      }
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshInterval, dismissalExpiryTime, notificationState.lastDismissalTime, persistState]);

  // Dismiss a contract notification
  const dismissContract = useCallback((contractId: number) => {
    setNotificationState(prevState => {
      const newState = {
        dismissedContracts: new Set(prevState.dismissedContracts).add(contractId),
        lastDismissalTime: Date.now()
      };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  // Restore a dismissed contract notification
  const restoreContract = useCallback((contractId: number) => {
    setNotificationState(prevState => {
      const newDismissed = new Set(prevState.dismissedContracts);
      newDismissed.delete(contractId);
      const newState = {
        dismissedContracts: newDismissed,
        lastDismissalTime: Date.now()
      };
      persistState(newState);
      return newState;
    });
  }, [persistState]);

  // Clear all dismissals
  const clearAllDismissals = useCallback(() => {
    const newState = {
      dismissedContracts: new Set<number>(),
      lastDismissalTime: Date.now()
    };
    setNotificationState(newState);
    persistState(newState);
  }, [persistState]);

  // Check if a contract is dismissed
  const isDismissed = useCallback((contractId: number): boolean => {
    return notificationState.dismissedContracts.has(contractId);
  }, [notificationState.dismissedContracts]);

  // Get visible contracts (not dismissed)
  const visibleContracts = expiringContracts.filter(
    contract => !notificationState.dismissedContracts.has(contract.id)
  );

  // Calculate counts
  const dismissedCount = notificationState.dismissedContracts.size;
  const totalCount = expiringContracts.length;
  const urgentCount = visibleContracts.filter(
    contract => contract.urgency_level === 'Critical' || contract.urgency_level === 'High'
  ).length;

  // Get notification summary
  const getNotificationSummary = useCallback(() => {
    const summary = visibleContracts.reduce((acc, contract) => {
      switch (contract.urgency_level) {
        case 'Critical':
          acc.critical++;
          acc.urgent++;
          break;
        case 'High':
          acc.high++;
          acc.urgent++;
          break;
        case 'Medium':
          acc.medium++;
          break;
        case 'Low':
          acc.low++;
          break;
      }
      acc.total++;
      return acc;
    }, {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
      urgent: 0
    });

    return summary;
  }, [visibleContracts]);

  return {
    visibleContracts,
    dismissedCount,
    totalCount,
    urgentCount,
    dismissContract,
    restoreContract,
    clearAllDismissals,
    isDismissed,
    getNotificationSummary
  };
};

/**
 * Utility function to calculate urgency level based on days until expiry
 */
export const calculateUrgencyLevel = (daysUntilExpiry: number): 'Critical' | 'High' | 'Medium' | 'Low' => {
  if (daysUntilExpiry <= 7) return 'Critical';
  if (daysUntilExpiry <= 14) return 'High';
  if (daysUntilExpiry <= 21) return 'Medium';
  return 'Low';
};

/**
 * Utility function to get urgency color for theming
 */
export const getUrgencyColor = (urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low'): string => {
  switch (urgencyLevel) {
    case 'Critical':
      return '#ef4444'; // red-500
    case 'High':
      return '#f97316'; // orange-500
    case 'Medium':
      return '#f59e0b'; // yellow-500
    case 'Low':
      return '#3b82f6'; // blue-500
    default:
      return '#6b7280'; // gray-500
  }
};

/**
 * Utility function to format expiration message
 */
export const formatExpirationMessage = (contract: ExpiringContract): string => {
  const { days_until_expiry, urgency_level } = contract;
  
  if (days_until_expiry <= 0) {
    return 'Contract has expired';
  }
  
  if (days_until_expiry === 1) {
    return 'Expires tomorrow';
  }
  
  if (days_until_expiry <= 7) {
    return `Expires in ${days_until_expiry} days`;
  }
  
  if (days_until_expiry <= 14) {
    return `Expires in ${days_until_expiry} days`;
  }
  
  return `Expires in ${days_until_expiry} days`;
};

/**
 * Utility function to get notification priority for sorting
 */
export const getNotificationPriority = (urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low'): number => {
  switch (urgencyLevel) {
    case 'Critical':
      return 4;
    case 'High':
      return 3;
    case 'Medium':
      return 2;
    case 'Low':
      return 1;
    default:
      return 0;
  }
};