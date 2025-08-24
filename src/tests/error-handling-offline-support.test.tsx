import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ContractorErrorBoundary, ErrorFallback } from '../components/contractor/ErrorBoundary';
import { NetworkStatusIndicator, useNetworkStatus } from '../components/contractor/NetworkStatusIndicator';
import { RetryHandler, useRetryHandler } from '../components/contractor/RetryHandler';
import { ToastProvider, useToast, useContractorErrorToast } from '../components/contractor/ErrorToast';
import { ContractorCache } from '../utils/contractor-cache';
import { ContractorErrorHandler } from '../utils/contractor-error-handler';
import type { Contractor } from '../types/contractor';

// Mock components for testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const TestComponent: React.FC = () => {
  const { showError, showSuccess } = useToast();
  
  return (
    <div>
      <button onClick={() => showError('Test Error', 'This is a test error')}>
        Show Error
      </button>
      <button onClick={() => showSuccess('Test Success', 'This is a test success')}>
        Show Success
      </button>
    </div>
  );
};

const NetworkTestComponent: React.FC = () => {
  const { isOnline, connectionQuality } = useNetworkStatus();
  
  return (
    <div>
      <div data-testid="online-status">{isOnline ? 'online' : 'offline'}</div>
      <div data-testid="connection-quality">{connectionQuality}</div>
    </div>
  );
};

const RetryTestComponent: React.FC = () => {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(false);
  
  const mockOperation = vi.fn().mockRejectedValue(new Error('Mock error'));
  
  const handleRetry = async () => {
    setLoading(true);
    try {
      await mockOperation();
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RetryHandler
      onRetry={handleRetry}
      error={error}
      loading={loading}
      maxRetries={3}
    >
      <div>Content loaded successfully</div>
    </RetryHandler>
  );
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('Error Handling and Offline Support', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ContractorErrorBoundary', () => {
    it('should catch and display errors', () => {
      const onError = vi.fn();
      
      render(
        <ContractorErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ContractorErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();
      expect(onError).toHaveBeenCalled();
    });

    it('should render children when no error', () => {
      render(
        <ContractorErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ContractorErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });

    it('should allow retry after error', () => {
      const TestRetryComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        
        return (
          <ContractorErrorBoundary>
            <button onClick={() => setShouldThrow(false)}>Fix Error</button>
            <ThrowError shouldThrow={shouldThrow} />
          </ContractorErrorBoundary>
        );
      };

      render(<TestRetryComponent />);
      
      // Should show error initially
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Click try again
      fireEvent.click(screen.getByText('Try Again'));
      
      // Should still show error since we haven't fixed it
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render custom fallback', () => {
      const customFallback = <div>Custom error message</div>;
      
      render(
        <ContractorErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ContractorErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });
  });

  describe('ErrorFallback', () => {
    it('should render error fallback with custom props', () => {
      const mockReset = vi.fn();
      const error = new Error('Test error');
      
      render(
        <ErrorFallback
          error={error}
          resetError={mockReset}
          title="Custom Error Title"
          description="Custom error description"
        />
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error description')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('NetworkStatusIndicator', () => {
    it('should show online status', () => {
      render(<NetworkStatusIndicator />);
      
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should show offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<NetworkStatusIndicator />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should show detailed network information', () => {
      render(<NetworkStatusIndicator showDetails={true} />);
      
      expect(screen.getByText('Online')).toBeInTheDocument();
      // Should show cache information
      expect(screen.getByText(/Cache:/)).toBeInTheDocument();
    });

    it('should show cached data availability when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      // Mock cache with data
      vi.spyOn(ContractorCache, 'getCacheStats').mockReturnValue({
        contractorsCount: 5,
        hasAnalytics: true,
        cacheAge: 10,
        isValid: true,
        size: '50 KB'
      });

      render(<NetworkStatusIndicator />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByText('Cached data available')).toBeInTheDocument();
    });
  });

  describe('useNetworkStatus hook', () => {
    it('should return correct network status', () => {
      render(<NetworkTestComponent />);
      
      expect(screen.getByTestId('online-status')).toHaveTextContent('online');
      expect(screen.getByTestId('connection-quality')).toHaveTextContent('good');
    });

    it('should update when network status changes', async () => {
      render(<NetworkTestComponent />);
      
      expect(screen.getByTestId('online-status')).toHaveTextContent('online');
      
      // Simulate going offline
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        window.dispatchEvent(new Event('offline'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('online-status')).toHaveTextContent('offline');
        expect(screen.getByTestId('connection-quality')).toHaveTextContent('offline');
      });
    });
  });

  describe('RetryHandler', () => {
    it('should show retry button on error', async () => {
      const mockRetry = vi.fn().mockRejectedValue(new Error('Retry failed'));
      
      render(
        <RetryHandler
          onRetry={mockRetry}
          error={new Error('Test error')}
          loading={false}
          maxRetries={3}
        >
          <div>Content</div>
        </RetryHandler>
      );

      expect(screen.getByText('Unable to Load Data')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Try Again'));
      expect(mockRetry).toHaveBeenCalled();
    });

    it('should show content when no error', () => {
      render(
        <RetryHandler
          onRetry={vi.fn()}
          error={null}
          loading={false}
          maxRetries={3}
        >
          <div>Content loaded</div>
        </RetryHandler>
      );

      expect(screen.getByText('Content loaded')).toBeInTheDocument();
      expect(screen.queryByText('Unable to Load Data')).not.toBeInTheDocument();
    });

    it('should disable retry when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(
        <RetryHandler
          onRetry={vi.fn()}
          error={new Error('Test error')}
          loading={false}
          maxRetries={3}
        >
          <div>Content</div>
        </RetryHandler>
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeDisabled();
    });

    it('should show max retries reached message', () => {
      render(
        <RetryHandler
          onRetry={vi.fn()}
          error={new Error('Test error')}
          loading={false}
          maxRetries={0} // Already exceeded
        >
          <div>Content</div>
        </RetryHandler>
      );

      expect(screen.getByText(/Maximum retry attempts reached/)).toBeInTheDocument();
      expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    it('should show error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Error')).toBeInTheDocument();
        expect(screen.getByText('This is a test error')).toBeInTheDocument();
      });
    });

    it('should show success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Success')).toBeInTheDocument();
        expect(screen.getByText('This is a test success')).toBeInTheDocument();
      });
    });

    it('should allow toast dismissal', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Error')).toBeInTheDocument();
      });

      // Find and click close button
      const closeButton = screen.getByLabelText('Close notification');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Test Error')).not.toBeInTheDocument();
      });
    });
  });

  describe('useContractorErrorToast hook', () => {
    const TestErrorToastComponent = () => {
      const { showApiError, showNetworkError, showOfflineWarning, showOperationSuccess } = useContractorErrorToast();
      
      return (
        <div>
          <button onClick={() => showApiError(new Error('API Error'), 'test operation')}>
            Show API Error
          </button>
          <button onClick={() => showNetworkError()}>
            Show Network Error
          </button>
          <button onClick={() => showOfflineWarning()}>
            Show Offline Warning
          </button>
          <button onClick={() => showOperationSuccess('create')}>
            Show Success
          </button>
        </div>
      );
    };

    it('should show API error toast', async () => {
      render(
        <ToastProvider>
          <TestErrorToastComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show API Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to test operation')).toBeInTheDocument();
      });
    });

    it('should show network error toast', async () => {
      render(
        <ToastProvider>
          <TestErrorToastComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Network Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    it('should show offline warning toast', async () => {
      render(
        <ToastProvider>
          <TestErrorToastComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Offline Warning'));
      
      await waitFor(() => {
        expect(screen.getByText('Working Offline')).toBeInTheDocument();
      });
    });

    it('should show operation success toast', async () => {
      render(
        <ToastProvider>
          <TestErrorToastComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Contractor created successfully')).toBeInTheDocument();
      });
    });
  });

  describe('ContractorCache', () => {
    const mockContractors: Contractor[] = [
      {
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
      }
    ];

    it('should save and retrieve contractors from cache', () => {
      ContractorCache.saveContractors(mockContractors);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'contractor_data_cache',
        expect.stringContaining('Test Contractor')
      );
    });

    it('should return null for expired cache', () => {
      // Mock expired cache
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: mockContractors,
        timestamp: Date.now() - (60 * 60 * 1000), // 1 hour ago
        version: '1.0.0'
      }));

      const result = ContractorCache.getContractors();
      expect(result).toBeNull();
    });

    it('should return cached data for valid cache', () => {
      // Mock valid cache
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: mockContractors,
        timestamp: Date.now() - (10 * 60 * 1000), // 10 minutes ago
        version: '1.0.0'
      }));

      const result = ContractorCache.getContractors();
      expect(result).toEqual(mockContractors);
    });

    it('should clear cache on version mismatch', () => {
      // Mock cache with old version
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
        data: mockContractors,
        timestamp: Date.now(),
        version: '0.9.0'
      }));

      const result = ContractorCache.getContractors();
      expect(result).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    it('should provide cache statistics', () => {
      // Mock cache stats
      mockLocalStorage.getItem
        .mockReturnValueOnce(JSON.stringify({
          data: mockContractors,
          timestamp: Date.now() - (5 * 60 * 1000), // 5 minutes ago
          version: '1.0.0'
        }))
        .mockReturnValueOnce(JSON.stringify({
          data: { summary: {} },
          timestamp: Date.now(),
          version: '1.0.0'
        }));

      const stats = ContractorCache.getCacheStats();
      
      expect(stats.contractorsCount).toBe(1);
      expect(stats.hasAnalytics).toBe(true);
      expect(stats.cacheAge).toBe(5);
      expect(stats.isValid).toBe(true);
    });
  });

  describe('ContractorErrorHandler', () => {
    it('should handle API errors correctly', () => {
      const error = new Error('Network error');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toBe('Network connection error. Please check your internet connection and try again.');
    });

    it('should handle authentication errors', () => {
      const error = new Error('401 Unauthorized');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toBe('Authentication error. Please refresh the page and try again.');
    });

    it('should handle server errors', () => {
      const error = new Error('500 Internal Server Error');
      const result = ContractorErrorHandler.handleAPIError(error, 'test operation');
      
      expect(result).toBe('Server error. Please try again later.');
    });

    it('should validate contractor data', () => {
      const validData = {
        contractor_name: 'Test Contractor',
        service_provided: 'Test service description that is long enough',
        status: 'Active',
        contract_type: 'Contract',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        contract_monthly_amount: 1000,
        contract_yearly_amount: 12000
      };

      const result = ContractorErrorHandler.validateContractorData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid data', () => {
      const invalidData = {
        contractor_name: 'A', // Too short
        service_provided: 'Short', // Too short
        status: 'Invalid', // Invalid status
        contract_type: 'Invalid', // Invalid type
        start_date: 'invalid-date',
        end_date: '2023-12-31', // Before start date
        contract_monthly_amount: -100 // Negative amount
      };

      const result = ContractorErrorHandler.validateContractorData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should execute operation with retry', async () => {
      const mockOperation = vi.fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('Success');

      const result = await ContractorErrorHandler.withRetry(
        mockOperation,
        3,
        'test operation'
      );

      expect(result).toBe('Success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });

    it('should execute operation with fallback', async () => {
      const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
      const fallback = 'Fallback data';

      const result = await ContractorErrorHandler.withFallback(
        mockOperation,
        fallback,
        'test operation'
      );

      expect(result).toBe(fallback);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });
});