import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { ContractorErrorHandler } from '../../utils/contractor-error-handler';
import { useNetworkStatus } from './NetworkStatusIndicator';

interface RetryHandlerProps {
  onRetry: () => Promise<void>;
  error: Error | null;
  loading: boolean;
  maxRetries?: number;
  children: React.ReactNode;
  fallbackMessage?: string;
  showNetworkStatus?: boolean;
}

interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  lastRetryTime: Date | null;
  canRetry: boolean;
}

/**
 * RetryHandler - Provides retry functionality with exponential backoff
 * Shows user-friendly error messages and retry options
 */
export const RetryHandler: React.FC<RetryHandlerProps> = ({
  onRetry,
  error,
  loading,
  maxRetries = 3,
  children,
  fallbackMessage = "Something went wrong. Please try again.",
  showNetworkStatus = true
}) => {
  const { isOnline, connectionQuality } = useNetworkStatus();
  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: null,
    canRetry: true
  });

  const handleRetry = useCallback(async () => {
    if (!retryState.canRetry || retryState.retryCount >= maxRetries) {
      return;
    }

    setRetryState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      lastRetryTime: new Date()
    }));

    try {
      await onRetry();
      // Reset retry state on success
      setRetryState({
        retryCount: 0,
        isRetrying: false,
        lastRetryTime: null,
        canRetry: true
      });
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      
      setRetryState(prev => ({
        ...prev,
        isRetrying: false,
        canRetry: prev.retryCount < maxRetries
      }));
    }
  }, [onRetry, retryState.canRetry, retryState.retryCount, maxRetries]);

  const getRetryDelay = (attempt: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  };

  const getErrorMessage = (): string => {
    if (!error) return fallbackMessage;
    
    return ContractorErrorHandler.handleAPIError(error, 'loading data');
  };

  const getRetryButtonText = (): string => {
    if (retryState.isRetrying) return 'Retrying...';
    if (retryState.retryCount === 0) return 'Try Again';
    return `Retry (${retryState.retryCount}/${maxRetries})`;
  };

  const shouldShowRetryButton = (): boolean => {
    return !loading && !retryState.isRetrying && retryState.canRetry;
  };

  const getConnectionAdvice = (): string | null => {
    if (!isOnline) {
      return 'You appear to be offline. Please check your internet connection.';
    }
    
    if (connectionQuality === 'poor') {
      return 'Your connection appears to be slow. This may affect loading times.';
    }
    
    return null;
  };

  // If no error and not loading, show children
  if (!error && !loading) {
    return <>{children}</>;
  }

  // If loading, show children (they should handle loading state)
  if (loading && !error) {
    return <>{children}</>;
  }

  // Show error state with retry options
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      {/* Error Icon */}
      <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      {/* Error Message */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Unable to Load Data
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
        {getErrorMessage()}
      </p>

      {/* Network Status */}
      {showNetworkStatus && (
        <div className="flex items-center gap-2 mb-4">
          {isOnline ? (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Connected</span>
              {connectionQuality === 'poor' && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">
                  (Slow)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Offline</span>
            </div>
          )}
        </div>
      )}

      {/* Connection Advice */}
      {getConnectionAdvice() && (
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4 max-w-md">
          {getConnectionAdvice()}
        </p>
      )}

      {/* Retry Information */}
      {retryState.retryCount > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <p>Attempted {retryState.retryCount} of {maxRetries} times</p>
          {retryState.lastRetryTime && (
            <p className="text-xs mt-1">
              Last attempt: {retryState.lastRetryTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Retry Button */}
      {shouldShowRetryButton() && (
        <Button
          variant="primary"
          onClick={handleRetry}
          disabled={!isOnline && connectionQuality === 'offline'}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {getRetryButtonText()}
        </Button>
      )}

      {/* Max Retries Reached */}
      {!retryState.canRetry && retryState.retryCount >= maxRetries && (
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Maximum retry attempts reached. Please refresh the page or contact support if the problem persists.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Refresh Page
          </Button>
        </div>
      )}

      {/* Development Error Details */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left max-w-md">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Error Details (Development)
          </summary>
          <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap">
            {error.message}
          </pre>
          {error.stack && (
            <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </details>
      )}
    </div>
  );
};

/**
 * Hook for retry functionality with exponential backoff
 */
export const useRetryHandler = (maxRetries: number = 3) => {
  const [retryState, setRetryState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    lastRetryTime: null,
    canRetry: true
  });

  const executeWithRetry = useCallback(async (
    operation: () => Promise<any>,
    context = 'operation'
  ): Promise<any> => {
    return ContractorErrorHandler.withRetry(
      operation,
      maxRetries,
      context,
      getRetryDelay(retryState.retryCount)
    );
  }, [maxRetries, retryState.retryCount]);

  const resetRetryState = useCallback(() => {
    setRetryState({
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: null,
      canRetry: true
    });
  }, []);

  const getRetryDelay = (attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt), 30000);
  };

  return {
    retryState,
    executeWithRetry,
    resetRetryState,
    canRetry: retryState.canRetry && retryState.retryCount < maxRetries
  };
};

/**
 * Higher-order component to add retry functionality
 */
export function withRetryHandler<P extends object>(
  Component: React.ComponentType<P>,
  maxRetries: number = 3
) {
  const WrappedComponent = (props: P & { 
    onRetry?: () => Promise<void>;
    error?: Error | null;
    loading?: boolean;
  }) => {
    const { onRetry, error, loading, ...componentProps } = props;

    if (!onRetry || (!error && !loading)) {
      return <Component {...(componentProps as P)} />;
    }

    return (
      <RetryHandler
        onRetry={onRetry}
        error={error || null}
        loading={loading || false}
        maxRetries={maxRetries}
      >
        <Component {...(componentProps as P)} />
      </RetryHandler>
    );
  };

  WrappedComponent.displayName = `withRetryHandler(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}