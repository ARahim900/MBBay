import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { 
  Contractor, 
  ContractorRealtimeEvent,
  ContractorError 
} from '../types/contractor';

interface RealtimeSubscriptionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: ContractorError | null;
  lastEvent: ContractorRealtimeEvent | null;
  eventCount: number;
  connectionAttempts: number;
  maxRetries: number;
}

interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'prompt-user';
  onConflict?: (serverData: Contractor, clientData: Contractor) => Contractor;
}

interface UseContractorRealtimeOptions {
  enabled?: boolean;
  conflictResolution?: ConflictResolution;
  onInsert?: (contractor: Contractor) => void;
  onUpdate?: (contractor: Contractor, oldContractor?: Contractor) => void;
  onDelete?: (contractorId: number, deletedContractor?: Contractor) => void;
  onError?: (error: ContractorError) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  retryInterval?: number;
  maxRetries?: number;
}

/**
 * useContractorRealtime - Custom hook for real-time contractor data updates
 * Provides Supabase real-time subscriptions with conflict resolution
 * 
 * Requirements covered:
 * - 1.4: Real-time contractor data access
 * - 6.4: Conflict resolution for concurrent edits
 */
export const useContractorRealtime = (options: UseContractorRealtimeOptions = {}) => {
  const {
    enabled = true,
    conflictResolution = { strategy: 'server-wins' },
    onInsert,
    onUpdate,
    onDelete,
    onError,
    onConnectionChange,
    retryInterval = 5000,
    maxRetries = 5
  } = options;

  // Subscription state
  const [subscriptionState, setSubscriptionState] = useState<RealtimeSubscriptionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastEvent: null,
    eventCount: 0,
    connectionAttempts: 0,
    maxRetries
  });

  // Refs for cleanup and persistence
  const subscriptionRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingOperationsRef = useRef<Map<number, Contractor>>(new Map());

  /**
   * Handle real-time INSERT events
   */
  const handleInsert = useCallback((payload: any) => {
    console.log('Real-time INSERT:', payload);
    
    const newContractor = payload.new as Contractor;
    const event: ContractorRealtimeEvent = {
      eventType: 'INSERT',
      new: newContractor,
      timestamp: new Date().toISOString()
    };

    setSubscriptionState(prev => ({
      ...prev,
      lastEvent: event,
      eventCount: prev.eventCount + 1
    }));

    // Call the insert callback
    if (onInsert) {
      onInsert(newContractor);
    }
  }, [onInsert]);

  /**
   * Handle real-time UPDATE events with conflict resolution
   */
  const handleUpdate = useCallback((payload: any) => {
    console.log('Real-time UPDATE:', payload);
    
    const updatedContractor = payload.new as Contractor;
    const oldContractor = payload.old as Contractor;
    
    const event: ContractorRealtimeEvent = {
      eventType: 'UPDATE',
      new: updatedContractor,
      old: oldContractor,
      timestamp: new Date().toISOString()
    };

    setSubscriptionState(prev => ({
      ...prev,
      lastEvent: event,
      eventCount: prev.eventCount + 1
    }));

    // Check for conflicts with pending operations
    const pendingOperation = pendingOperationsRef.current.get(updatedContractor.id);
    
    if (pendingOperation) {
      console.log('Conflict detected for contractor:', updatedContractor.id);
      
      // Resolve conflict based on strategy
      const resolvedContractor = resolveConflict(
        updatedContractor, // Server data
        pendingOperation,  // Client data
        conflictResolution
      );

      // Remove from pending operations
      pendingOperationsRef.current.delete(updatedContractor.id);

      // Call the update callback with resolved data
      if (onUpdate) {
        onUpdate(resolvedContractor, oldContractor);
      }
    } else {
      // No conflict, use server data
      if (onUpdate) {
        onUpdate(updatedContractor, oldContractor);
      }
    }
  }, [onUpdate, conflictResolution]);

  /**
   * Handle real-time DELETE events
   */
  const handleDelete = useCallback((payload: any) => {
    console.log('Real-time DELETE:', payload);
    
    const deletedContractor = payload.old as Contractor;
    const event: ContractorRealtimeEvent = {
      eventType: 'DELETE',
      old: deletedContractor,
      timestamp: new Date().toISOString()
    };

    setSubscriptionState(prev => ({
      ...prev,
      lastEvent: event,
      eventCount: prev.eventCount + 1
    }));

    // Remove from pending operations if exists
    pendingOperationsRef.current.delete(deletedContractor.id);

    // Call the delete callback
    if (onDelete) {
      onDelete(deletedContractor.id, deletedContractor);
    }
  }, [onDelete]);

  /**
   * Resolve conflicts between server and client data
   */
  const resolveConflict = useCallback((
    serverData: Contractor,
    clientData: Contractor,
    resolution: ConflictResolution
  ): Contractor => {
    console.log('Resolving conflict:', { serverData, clientData, strategy: resolution.strategy });

    switch (resolution.strategy) {
      case 'server-wins':
        console.log('Conflict resolution: Server wins');
        return serverData;

      case 'client-wins':
        console.log('Conflict resolution: Client wins');
        return clientData;

      case 'merge':
        console.log('Conflict resolution: Merging data');
        // Merge strategy: use server data but preserve client changes for specific fields
        return {
          ...serverData,
          // Preserve client changes for notes and amounts if they're more recent
          notes: clientData.notes !== serverData.notes ? clientData.notes : serverData.notes,
          contract_monthly_amount: clientData.contract_monthly_amount !== serverData.contract_monthly_amount 
            ? clientData.contract_monthly_amount 
            : serverData.contract_monthly_amount,
          contract_yearly_amount: clientData.contract_yearly_amount !== serverData.contract_yearly_amount
            ? clientData.contract_yearly_amount
            : serverData.contract_yearly_amount
        };

      case 'prompt-user':
        console.log('Conflict resolution: Custom resolver');
        // Use custom conflict resolver if provided
        if (resolution.onConflict) {
          return resolution.onConflict(serverData, clientData);
        }
        // Fallback to server wins
        return serverData;

      default:
        console.warn('Unknown conflict resolution strategy, defaulting to server-wins');
        return serverData;
    }
  }, []);

  /**
   * Handle subscription errors
   */
  const handleError = useCallback((error: any) => {
    console.error('Real-time subscription error:', error);
    
    const contractorError: ContractorError = {
      code: 'REALTIME_ERROR',
      message: 'Real-time connection error',
      details: error,
      context: 'contractor real-time subscription',
      timestamp: new Date().toISOString()
    };

    setSubscriptionState(prev => ({
      ...prev,
      error: contractorError,
      isConnected: false
    }));

    // Call error callback
    if (onError) {
      onError(contractorError);
    }

    // Attempt to reconnect if under retry limit
    if (subscriptionState.connectionAttempts < maxRetries) {
      console.log(`Attempting to reconnect in ${retryInterval}ms (attempt ${subscriptionState.connectionAttempts + 1}/${maxRetries})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        reconnectSubscription();
      }, retryInterval);
    } else {
      console.error('Max retry attempts reached, giving up on real-time connection');
    }
  }, [onError, retryInterval, maxRetries, subscriptionState.connectionAttempts]);

  /**
   * Create and setup the real-time subscription
   */
  const createSubscription = useCallback(() => {
    console.log('Creating contractor real-time subscription...');
    
    setSubscriptionState(prev => ({
      ...prev,
      isConnecting: true,
      error: null
    }));

    try {
      const subscription = supabase
        .channel('contractor_tracker_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contractor_tracker'
          },
          handleInsert
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'contractor_tracker'
          },
          handleUpdate
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'contractor_tracker'
          },
          handleDelete
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to contractor real-time updates');
            
            setSubscriptionState(prev => ({
              ...prev,
              isConnected: true,
              isConnecting: false,
              error: null,
              connectionAttempts: 0
            }));

            // Call connection change callback
            if (onConnectionChange) {
              onConnectionChange(true);
            }
          } else if (status === 'CHANNEL_ERROR') {
            handleError(new Error('Channel subscription error'));
          } else if (status === 'TIMED_OUT') {
            handleError(new Error('Subscription timed out'));
          } else if (status === 'CLOSED') {
            console.log('Subscription closed');
            
            setSubscriptionState(prev => ({
              ...prev,
              isConnected: false,
              isConnecting: false
            }));

            if (onConnectionChange) {
              onConnectionChange(false);
            }
          }
        });

      subscriptionRef.current = subscription;
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      handleError(error);
    }
  }, [handleInsert, handleUpdate, handleDelete, handleError, onConnectionChange]);

  /**
   * Reconnect the subscription after an error
   */
  const reconnectSubscription = useCallback(() => {
    console.log('Reconnecting real-time subscription...');
    
    setSubscriptionState(prev => ({
      ...prev,
      connectionAttempts: prev.connectionAttempts + 1
    }));

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Create new subscription
    createSubscription();
  }, [createSubscription]);

  /**
   * Manually disconnect the subscription
   */
  const disconnect = useCallback(() => {
    console.log('Manually disconnecting real-time subscription...');
    
    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Unsubscribe
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    // Clear pending operations
    pendingOperationsRef.current.clear();

    // Update state
    setSubscriptionState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null
    }));

    if (onConnectionChange) {
      onConnectionChange(false);
    }
  }, [onConnectionChange]);

  /**
   * Manually reconnect the subscription
   */
  const reconnect = useCallback(() => {
    console.log('Manually reconnecting real-time subscription...');
    disconnect();
    
    setTimeout(() => {
      createSubscription();
    }, 1000);
  }, [disconnect, createSubscription]);

  /**
   * Register a pending operation for conflict detection
   */
  const registerPendingOperation = useCallback((contractor: Contractor) => {
    console.log('Registering pending operation for contractor:', contractor.id);
    pendingOperationsRef.current.set(contractor.id, contractor);
    
    // Auto-remove after 30 seconds to prevent memory leaks
    setTimeout(() => {
      pendingOperationsRef.current.delete(contractor.id);
    }, 30000);
  }, []);

  /**
   * Clear a pending operation
   */
  const clearPendingOperation = useCallback((contractorId: number) => {
    console.log('Clearing pending operation for contractor:', contractorId);
    pendingOperationsRef.current.delete(contractorId);
  }, []);

  /**
   * Get current subscription statistics
   */
  const getSubscriptionStats = useCallback(() => {
    return {
      isConnected: subscriptionState.isConnected,
      isConnecting: subscriptionState.isConnecting,
      eventCount: subscriptionState.eventCount,
      connectionAttempts: subscriptionState.connectionAttempts,
      lastEventTime: subscriptionState.lastEvent?.timestamp,
      pendingOperations: pendingOperationsRef.current.size,
      hasError: !!subscriptionState.error
    };
  }, [subscriptionState]);

  // Setup subscription when enabled
  useEffect(() => {
    if (enabled) {
      createSubscription();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, createSubscription, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection state
    isConnected: subscriptionState.isConnected,
    isConnecting: subscriptionState.isConnecting,
    error: subscriptionState.error,
    
    // Event information
    lastEvent: subscriptionState.lastEvent,
    eventCount: subscriptionState.eventCount,
    
    // Connection management
    reconnect,
    disconnect,
    
    // Conflict resolution
    registerPendingOperation,
    clearPendingOperation,
    
    // Statistics
    getSubscriptionStats,
    
    // Connection attempts info
    connectionAttempts: subscriptionState.connectionAttempts,
    maxRetries: subscriptionState.maxRetries,
    canRetry: subscriptionState.connectionAttempts < subscriptionState.maxRetries
  };
};

export default useContractorRealtime;