import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  context?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showError: (title: string, message: string, action?: Toast['action']) => string;
  showSuccess: (title: string, message: string) => string;
  showWarning: (title: string, message: string) => string;
  showInfo: (title: string, message: string) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * ToastProvider - Provides toast notification functionality
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 8000 : 5000)
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showError = useCallback((title: string, message: string, action?: Toast['action']): string => {
    return addToast({
      type: 'error',
      title,
      message,
      action,
      duration: 8000
    });
  }, [addToast]);

  const showSuccess = useCallback((title: string, message: string): string => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 4000
    });
  }, [addToast]);

  const showWarning = useCallback((title: string, message: string): string => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 6000
    });
  }, [addToast]);

  const showInfo = useCallback((title: string, message: string): string => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 5000
    });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context) return context;
  // Fallback no-op implementation for test environments without provider
  const noop = () => '' as unknown as string;
  return {
    toasts: [],
    addToast: () => '' as unknown as string,
    removeToast: () => {},
    clearToasts: () => {},
    showError: noop,
    showSuccess: noop,
    showWarning: noop,
    showInfo: noop,
  } as ToastContextType;
};

/**
 * ToastContainer - Renders all active toasts
 */
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

/**
 * Individual toast item component
 */
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  }, [toast.id, removeToast]);

  const getToastStyles = () => {
    const baseStyles = "relative p-4 rounded-lg shadow-lg border transition-all duration-200 transform";
    const visibilityStyles = isVisible && !isExiting 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    switch (toast.type) {
      case 'error':
        return `${baseStyles} ${visibilityStyles} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`;
      case 'success':
        return `${baseStyles} ${visibilityStyles} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`;
      case 'warning':
        return `${baseStyles} ${visibilityStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800`;
      case 'info':
        return `${baseStyles} ${visibilityStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`;
      default:
        return `${baseStyles} ${visibilityStyles} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 flex-shrink-0";
    
    switch (toast.type) {
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600 dark:text-red-400`} />;
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-600 dark:text-yellow-400`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      default:
        return <Info className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start gap-3">
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${getTextColor()}`}>
            {toast.title}
          </h4>
          <p className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {toast.message}
          </p>
          
          {toast.action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toast.action.onClick}
                className="text-xs"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${getTextColor()}`}
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {!toast.persistent && toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-current opacity-30 transition-all ease-linear"
            style={{
              animation: `toast-progress ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Hook for contractor-specific error handling
 */
export const useContractorErrorToast = () => {
  const { showError, showSuccess, showWarning, showInfo } = useToast();

  const showApiError = useCallback((error: Error, context: string, retryAction?: () => void) => {
    const title = `Failed to ${context}`;
    const message = error.message || 'An unexpected error occurred';
    
    const action = retryAction ? {
      label: 'Retry',
      onClick: retryAction
    } : undefined;

    return showError(title, message, action);
  }, [showError]);

  const showNetworkError = useCallback((retryAction?: () => void) => {
    return showError(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.',
      retryAction ? { label: 'Retry', onClick: retryAction } : undefined
    );
  }, [showError]);

  const showOfflineWarning = useCallback(() => {
    return showWarning(
      'Working Offline',
      'You are currently offline. Changes will be synced when your connection is restored.'
    );
  }, [showWarning]);

  const showCacheInfo = useCallback((cacheAge: number) => {
    return showInfo(
      'Using Cached Data',
      `Showing data from ${cacheAge} minutes ago. Pull to refresh for latest updates.`
    );
  }, [showInfo]);

  const showOperationSuccess = useCallback((operation: string) => {
    const messages = {
      'create': 'Contractor created successfully',
      'update': 'Contractor updated successfully',
      'delete': 'Contractor deleted successfully',
      'export': 'Data exported successfully'
    };

    return showSuccess(
      'Success',
      messages[operation as keyof typeof messages] || `${operation} completed successfully`
    );
  }, [showSuccess]);

  return {
    showApiError,
    showNetworkError,
    showOfflineWarning,
    showCacheInfo,
    showOperationSuccess,
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
};

// CSS for progress bar animation (add to your global CSS)
const toastStyles = `
@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = toastStyles;
  document.head.appendChild(style);
}