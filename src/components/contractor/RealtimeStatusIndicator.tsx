import React from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface RealtimeStatusIndicatorProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: any;
  eventCount: number;
  connectionAttempts: number;
  maxRetries: number;
  canRetry: boolean;
  onReconnect: () => void;
  className?: string;
  showDetails?: boolean;
}

/**
 * RealtimeStatusIndicator - Shows real-time connection status
 * Provides visual feedback for Supabase real-time connection state
 */
export const RealtimeStatusIndicator: React.FC<RealtimeStatusIndicatorProps> = ({
  isConnected,
  isConnecting,
  error,
  eventCount,
  connectionAttempts,
  maxRetries,
  canRetry,
  onReconnect,
  className = '',
  showDetails = false
}) => {
  // Determine status and styling
  const getStatusInfo = () => {
    if (isConnecting) {
      return {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        status: 'Connecting...',
        description: 'Establishing real-time connection'
      };
    }

    if (error) {
      return {
        icon: AlertCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        status: 'Connection Error',
        description: error.message || 'Real-time connection failed'
      };
    }

    if (isConnected) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        status: 'Connected',
        description: `Real-time updates active (${eventCount} events)`
      };
    }

    return {
      icon: WifiOff,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
      status: 'Disconnected',
      description: 'Real-time updates unavailable'
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.color}`}>
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{statusInfo.status}</span>
        </div>
        
        {error && canRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  // Detailed indicator
  return (
    <div className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${statusInfo.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.status}
              </h4>
              
              {isConnecting && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {statusInfo.description}
            </p>
            
            {/* Connection details */}
            {showDetails && (
              <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-500">
                {connectionAttempts > 0 && (
                  <div>
                    Connection attempts: {connectionAttempts}/{maxRetries}
                  </div>
                )}
                
                {eventCount > 0 && (
                  <div>
                    Events received: {eventCount}
                  </div>
                )}
                
                {error && (
                  <div className="text-red-600 dark:text-red-400">
                    Error: {error.code || 'Unknown error'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {error && canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReconnect}
              className="h-7 px-2 text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
          
          {!error && !isConnecting && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReconnect}
              className="h-7 px-2 text-xs"
            >
              <Wifi className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeStatusIndicator;