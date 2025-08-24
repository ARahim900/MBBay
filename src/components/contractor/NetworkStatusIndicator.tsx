import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ContractorCache } from '../../utils/contractor-cache';

interface NetworkStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface NetworkStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  connectionType: string;
  effectiveType: string;
  rtt: number;
  downlink: number;
}

/**
 * NetworkStatusIndicator - Shows network connectivity status and cache info
 * Provides visual feedback about online/offline state and data freshness
 */
export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    rtt: 0,
    downlink: 0
  });

  const [cacheStats, setCacheStats] = useState(ContractorCache.getCacheStats());

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      setNetworkStatus(prev => ({
        isOnline: navigator.onLine,
        lastOnline: navigator.onLine ? new Date() : prev.lastOnline,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown',
        rtt: connection?.rtt || 0,
        downlink: connection?.downlink || 0
      }));

      // Update cache stats when network status changes
      setCacheStats(ContractorCache.getCacheStats());
    };

    const handleOnline = () => {
      updateNetworkStatus();
      console.log('Network: Back online');
    };

    const handleOffline = () => {
      updateNetworkStatus();
      console.log('Network: Gone offline');
    };

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Update network status on mount
    updateNetworkStatus();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return 'text-red-500';
    if (networkStatus.effectiveType === 'slow-2g' || networkStatus.effectiveType === '2g') {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) {
      return 'Offline';
    }
    
    if (networkStatus.effectiveType === 'slow-2g') {
      return 'Slow Connection';
    }
    
    if (networkStatus.effectiveType === '2g') {
      return 'Limited Connection';
    }
    
    return 'Online';
  };

  const getCacheStatusIcon = () => {
    if (!cacheStats.isValid) {
      return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
    
    if (cacheStats.cacheAge > 20) {
      return <Clock className="h-3 w-3 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  const formatLastOnline = () => {
    if (!networkStatus.lastOnline) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - networkStatus.lastOnline.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`flex items-center gap-1 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>
        
        {!networkStatus.isOnline && cacheStats.contractorsCount > 0 && (
          <div className="flex items-center gap-1 text-blue-500">
            {getCacheStatusIcon()}
            <span className="text-xs">Cached data available</span>
          </div>
        )}
      </div>
    );
  }

  // Detailed indicator
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {!networkStatus.isOnline && (
          <span className="text-xs text-gray-500">
            Last online: {formatLastOnline()}
          </span>
        )}
      </div>

      {/* Connection details */}
      {networkStatus.isOnline && (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
          <div>Type: {networkStatus.connectionType}</div>
          <div>Speed: {networkStatus.effectiveType}</div>
          {networkStatus.rtt > 0 && <div>Latency: {networkStatus.rtt}ms</div>}
          {networkStatus.downlink > 0 && <div>Bandwidth: {networkStatus.downlink} Mbps</div>}
        </div>
      )}

      {/* Cache status */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {getCacheStatusIcon()}
            <span className="text-gray-600 dark:text-gray-400">
              Cache: {cacheStats.contractorsCount} contractors
            </span>
          </div>
          
          <div className="text-gray-500">
            {cacheStats.cacheAge >= 0 ? `${cacheStats.cacheAge}m old` : 'No cache'}
          </div>
        </div>
        
        {cacheStats.size && (
          <div className="text-xs text-gray-500 mt-1">
            Size: {cacheStats.size}
          </div>
        )}
      </div>

      {/* Offline message */}
      {!networkStatus.isOnline && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
          <div className="flex items-center gap-1 text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-3 w-3" />
            <span className="font-medium">Working offline</span>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            {cacheStats.contractorsCount > 0 
              ? `Showing cached data from ${cacheStats.cacheAge}m ago. Changes will sync when back online.`
              : 'No cached data available. Please check your connection.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Hook to get network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (!online) {
        setConnectionQuality('offline');
        return;
      }

      // Check connection quality
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setConnectionQuality('poor');
        } else {
          setConnectionQuality('good');
        }
      } else {
        setConnectionQuality('good');
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    updateStatus();

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, []);

  return { isOnline, connectionQuality };
};