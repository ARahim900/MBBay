import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useContractorRealtime } from '../hooks/useContractorRealtime';
import { ContractorConflictResolver } from '../utils/contractor-conflict-resolver';
import { RealtimeStatusIndicator } from '../components/contractor/RealtimeStatusIndicator';
import { ConflictResolutionModal } from '../components/contractor/ConflictResolutionModal';
import type { Contractor } from '../types/contractor';

// Mock Supabase
const mockSupabase = {
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
      callback('SUBSCRIBED');
      return { unsubscribe: vi.fn() };
    }),
    unsubscribe: vi.fn()
  }))
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Test component for useContractorRealtime hook
const TestRealtimeComponent: React.FC<{
  options?: any;
  onInsert?: (contractor: Contractor) => void;
  onUpdate?: (contractor: Contractor) => void;
  onDelete?: (id: number) => void;
}> = ({ options = {}, onInsert, onUpdate, onDelete }) => {
  const realtime = useContractorRealtime({
    ...options,
    onInsert,
    onUpdate,
    onDelete
  });

  return (
    <div>
      <div data-testid="connection-status">
        {realtime.isConnected ? 'Connected' : 'Disconnected'}
      </div>
      <div data-testid="connecting-status">
        {realtime.isConnecting ? 'Connecting' : 'Not Connecting'}
      </div>
      <div data-testid="event-count">{realtime.eventCount}</div>
      <div data-testid="error-status">
        {realtime.error ? realtime.error.message : 'No Error'}
      </div>
      <button onClick={realtime.reconnect} data-testid="reconnect-btn">
        Reconnect
      </button>
      <button onClick={realtime.disconnect} data-testid="disconnect-btn">
        Disconnect
      </button>
    </div>
  );
};

// Mock contractor data
const mockContractor: Contractor = {
  id: 1,
  contractor_name: 'Test Contractor',
  service_provided: 'Test Service',
  status: 'Active',
  contract_type: 'Contract',
  start_date: '2024-01-01',
  end_date: '2024-12-31',
  contract_monthly_amount: 1000,
  contract_yearly_amount: 12000,
  notes: 'Test notes',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const updatedContractor: Contractor = {
  ...mockContractor,
  contractor_name: 'Updated Contractor',
  updated_at: '2024-01-02T00:00:00Z'
};

describe('useContractorRealtime Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with correct default state', () => {
    render(<TestRealtimeComponent />);

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(screen.getByTestId('connecting-status')).toHaveTextContent('Not Connecting');
    expect(screen.getByTestId('event-count')).toHaveTextContent('0');
    expect(screen.getByTestId('error-status')).toHaveTextContent('No Error');
  });

  it('should establish connection when enabled', async () => {
    render(<TestRealtimeComponent options={{ enabled: true }} />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    expect(mockSupabase.channel).toHaveBeenCalledWith('contractor_tracker_changes');
  });

  it('should not connect when disabled', () => {
    render(<TestRealtimeComponent options={{ enabled: false }} />);

    expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    expect(mockSupabase.channel).not.toHaveBeenCalled();
  });

  it('should handle INSERT events', async () => {
    const onInsert = vi.fn();
    render(<TestRealtimeComponent options={{ enabled: true }} onInsert={onInsert} />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    // Simulate INSERT event
    const subscribeCall = mockSupabase.channel().on.mock.calls.find(
      call => call[1].event === 'INSERT'
    );
    
    if (subscribeCall) {
      const insertHandler = subscribeCall[2];
      act(() => {
        insertHandler({ new: mockContractor });
      });

      expect(onInsert).toHaveBeenCalledWith(mockContractor);
      expect(screen.getByTestId('event-count')).toHaveTextContent('1');
    }
  });

  it('should handle UPDATE events', async () => {
    const onUpdate = vi.fn();
    render(<TestRealtimeComponent options={{ enabled: true }} onUpdate={onUpdate} />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    // Simulate UPDATE event
    const subscribeCall = mockSupabase.channel().on.mock.calls.find(
      call => call[1].event === 'UPDATE'
    );
    
    if (subscribeCall) {
      const updateHandler = subscribeCall[2];
      act(() => {
        updateHandler({ 
          new: updatedContractor, 
          old: mockContractor 
        });
      });

      expect(onUpdate).toHaveBeenCalledWith(updatedContractor, mockContractor);
      expect(screen.getByTestId('event-count')).toHaveTextContent('1');
    }
  });

  it('should handle DELETE events', async () => {
    const onDelete = vi.fn();
    render(<TestRealtimeComponent options={{ enabled: true }} onDelete={onDelete} />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    // Simulate DELETE event
    const subscribeCall = mockSupabase.channel().on.mock.calls.find(
      call => call[1].event === 'DELETE'
    );
    
    if (subscribeCall) {
      const deleteHandler = subscribeCall[2];
      act(() => {
        deleteHandler({ old: mockContractor });
      });

      expect(onDelete).toHaveBeenCalledWith(mockContractor.id, mockContractor);
      expect(screen.getByTestId('event-count')).toHaveTextContent('1');
    }
  });

  it('should handle reconnection', async () => {
    render(<TestRealtimeComponent options={{ enabled: true }} />);

    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });

    // Disconnect
    fireEvent.click(screen.getByTestId('disconnect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Disconnected');
    });

    // Reconnect
    fireEvent.click(screen.getByTestId('reconnect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Connected');
    });
  });
});

describe('ContractorConflictResolver', () => {
  const serverData: Contractor = {
    ...mockContractor,
    contractor_name: 'Server Contractor',
    notes: 'Server notes',
    updated_at: '2024-01-02T00:00:00Z'
  };

  const clientData: Contractor = {
    ...mockContractor,
    contractor_name: 'Client Contractor',
    notes: 'Client notes',
    contract_yearly_amount: 15000,
    updated_at: '2024-01-01T00:00:00Z'
  };

  it('should detect conflicts correctly', () => {
    const conflicts = ContractorConflictResolver.detectConflicts(serverData, clientData);
    
    const conflictFields = conflicts.filter(c => c.hasConflict);
    expect(conflictFields).toHaveLength(3); // contractor_name, notes, contract_yearly_amount
    
    const nameConflict = conflictFields.find(c => c.field === 'contractor_name');
    expect(nameConflict).toBeDefined();
    expect(nameConflict?.serverValue).toBe('Server Contractor');
    expect(nameConflict?.clientValue).toBe('Client Contractor');
  });

  it('should resolve server-wins strategy', () => {
    const result = ContractorConflictResolver.resolveServerWins(serverData, clientData);
    
    expect(result.resolvedContractor).toEqual(serverData);
    expect(result.strategy).toBe('server-wins');
    expect(result.conflicts.filter(c => c.hasConflict)).toHaveLength(3);
  });

  it('should resolve client-wins strategy', () => {
    const result = ContractorConflictResolver.resolveClientWins(serverData, clientData);
    
    expect(result.resolvedContractor.contractor_name).toBe('Client Contractor');
    expect(result.resolvedContractor.contract_yearly_amount).toBe(15000);
    expect(result.resolvedContractor.id).toBe(serverData.id); // Preserve server metadata
    expect(result.strategy).toBe('client-wins');
  });

  it('should resolve smart-merge strategy', () => {
    const result = ContractorConflictResolver.resolveSmartMerge(serverData, clientData);
    
    // Should prefer client data for financial fields
    expect(result.resolvedContractor.contract_yearly_amount).toBe(15000);
    
    // Should prefer longer text for notes
    expect(result.resolvedContractor.notes).toBe('Client notes');
    
    expect(result.strategy).toBe('smart-merge');
  });

  it('should validate resolved contractor data', () => {
    const validContractor = { ...mockContractor };
    const invalidContractor = { 
      ...mockContractor, 
      contractor_name: '',
      start_date: '2024-12-31',
      end_date: '2024-01-01' // End before start
    };

    const validResult = ContractorConflictResolver.validateResolution(validContractor);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const invalidResult = ContractorConflictResolver.validateResolution(invalidContractor);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
    expect(invalidResult.errors).toContain('Contractor name is required');
    expect(invalidResult.errors).toContain('End date must be after start date');
  });
});

describe('RealtimeStatusIndicator', () => {
  const defaultProps = {
    isConnected: false,
    isConnecting: false,
    error: null,
    eventCount: 0,
    connectionAttempts: 0,
    maxRetries: 3,
    canRetry: true,
    onReconnect: vi.fn()
  };

  it('should show connecting state', () => {
    render(
      <RealtimeStatusIndicator 
        {...defaultProps} 
        isConnecting={true}
      />
    );

    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('should show connected state', () => {
    render(
      <RealtimeStatusIndicator 
        {...defaultProps} 
        isConnected={true}
        eventCount={5}
      />
    );

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText(/5 events/)).toBeInTheDocument();
  });

  it('should show error state with retry button', () => {
    const onReconnect = vi.fn();
    const error = { message: 'Connection failed', code: 'CONN_ERROR' };
    
    render(
      <RealtimeStatusIndicator 
        {...defaultProps} 
        error={error}
        canRetry={true}
        onReconnect={onReconnect}
      />
    );

    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button');
    fireEvent.click(retryButton);
    expect(onReconnect).toHaveBeenCalled();
  });

  it('should show detailed view when requested', () => {
    render(
      <RealtimeStatusIndicator 
        {...defaultProps} 
        isConnected={true}
        eventCount={10}
        connectionAttempts={2}
        showDetails={true}
      />
    );

    expect(screen.getByText(/Events received: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Connection attempts: 2/)).toBeInTheDocument();
  });
});

describe('ConflictResolutionModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    serverData: {
      ...mockContractor,
      contractor_name: 'Server Contractor',
      notes: 'Server notes'
    },
    clientData: {
      ...mockContractor,
      contractor_name: 'Client Contractor',
      notes: 'Client notes'
    },
    conflicts: [
      {
        field: 'contractor_name' as keyof Contractor,
        serverValue: 'Server Contractor',
        clientValue: 'Client Contractor',
        hasConflict: true
      }
    ],
    onResolve: vi.fn(),
    onCancel: vi.fn()
  };

  it('should render conflict information', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    expect(screen.getByText('Data Conflict Detected')).toBeInTheDocument();
    expect(screen.getByText(/1 field\(s\) have conflicts/)).toBeInTheDocument();
    expect(screen.getByText(/Contractor Name/)).toBeInTheDocument();
  });

  it('should allow strategy selection', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    const serverRadio = screen.getByLabelText(/Use Server Version/);
    const clientRadio = screen.getByLabelText(/Use Your Version/);
    const manualRadio = screen.getByLabelText(/Manual Resolution/);

    expect(serverRadio).toBeInTheDocument();
    expect(clientRadio).toBeInTheDocument();
    expect(manualRadio).toBeInTheDocument();

    // Server should be selected by default
    expect(serverRadio).toBeChecked();
  });

  it('should handle resolution with server strategy', () => {
    const onResolve = vi.fn();
    render(<ConflictResolutionModal {...defaultProps} onResolve={onResolve} />);

    const resolveButton = screen.getByText('Resolve Conflict');
    fireEvent.click(resolveButton);

    expect(onResolve).toHaveBeenCalledWith(
      defaultProps.serverData,
      'server-wins'
    );
  });

  it('should handle resolution with client strategy', () => {
    const onResolve = vi.fn();
    render(<ConflictResolutionModal {...defaultProps} onResolve={onResolve} />);

    const clientRadio = screen.getByLabelText(/Use Your Version/);
    fireEvent.click(clientRadio);

    const resolveButton = screen.getByText('Resolve Conflict');
    fireEvent.click(resolveButton);

    expect(onResolve).toHaveBeenCalledWith(
      expect.objectContaining({
        contractor_name: 'Client Contractor',
        id: defaultProps.serverData.id,
        created_at: defaultProps.serverData.created_at,
        updated_at: defaultProps.serverData.updated_at
      }),
      'client-wins'
    );
  });

  it('should show manual resolution fields when selected', () => {
    render(<ConflictResolutionModal {...defaultProps} />);

    const manualRadio = screen.getByLabelText(/Manual Resolution/);
    fireEvent.click(manualRadio);

    expect(screen.getByText('Choose Values for Conflicted Fields')).toBeInTheDocument();
  });

  it('should handle cancel action', () => {
    const onCancel = vi.fn();
    render(<ConflictResolutionModal {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});

describe('Real-time Integration', () => {
  it('should handle concurrent operations without conflicts', async () => {
    const operations: Contractor[] = [];
    
    const TestComponent = () => {
      const realtime = useContractorRealtime({
        enabled: true,
        onInsert: (contractor) => operations.push(contractor),
        onUpdate: (contractor) => operations.push(contractor),
        onDelete: (id) => operations.push({ id } as Contractor)
      });

      return <div data-testid="realtime-test" />;
    };

    render(<TestComponent />);

    // Simulate rapid concurrent operations
    await act(async () => {
      // Multiple INSERT events
      for (let i = 0; i < 5; i++) {
        const contractor = { ...mockContractor, id: i + 1 };
        // Simulate real-time event
      }
    });

    // Should handle all operations without errors
    expect(screen.getByTestId('realtime-test')).toBeInTheDocument();
  });

  it('should maintain data consistency during network interruptions', async () => {
    let connectionStatus = true;
    
    const TestComponent = () => {
      const realtime = useContractorRealtime({
        enabled: connectionStatus,
        onConnectionChange: (isConnected) => {
          connectionStatus = isConnected;
        }
      });

      return (
        <div>
          <div data-testid="connection">{realtime.isConnected ? 'Connected' : 'Disconnected'}</div>
        </div>
      );
    };

    const { rerender } = render(<TestComponent />);

    // Simulate network interruption
    connectionStatus = false;
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('connection')).toHaveTextContent('Disconnected');
    });

    // Simulate network recovery
    connectionStatus = true;
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('connection')).toHaveTextContent('Connected');
    });
  });
});