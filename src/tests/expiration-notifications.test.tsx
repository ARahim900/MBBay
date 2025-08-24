import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  ExpirationNotifications, 
  NotificationBadge, 
  UrgencyIndicator,
  ExpirationAlert
} from '../components/contractor/ExpirationNotifications';
import { NotificationCenter } from '../components/contractor/NotificationCenter';
import { useExpirationNotifications } from '../hooks/useExpirationNotifications';
import type { ExpiringContract } from '../types/contractor';

// Mock the theme utility
vi.mock('../lib/theme', () => ({
  getThemeValue: (path: string, fallback: string) => fallback
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Sample test data
const mockExpiringContracts: ExpiringContract[] = [
  {
    id: 1,
    contractor_name: 'Critical Contractor',
    service_provided: 'Critical service that expires very soon',
    end_date: '2024-02-01',
    days_until_expiry: 3,
    contract_yearly_amount: 50000,
    urgency_level: 'Critical'
  },
  {
    id: 2,
    contractor_name: 'High Priority Contractor',
    service_provided: 'High priority service',
    end_date: '2024-02-10',
    days_until_expiry: 10,
    contract_yearly_amount: 30000,
    urgency_level: 'High'
  },
  {
    id: 3,
    contractor_name: 'Medium Priority Contractor',
    service_provided: 'Medium priority service',
    end_date: '2024-02-20',
    days_until_expiry: 18,
    contract_yearly_amount: 20000,
    urgency_level: 'Medium'
  },
  {
    id: 4,
    contractor_name: 'Low Priority Contractor',
    service_provided: 'Low priority service',
    end_date: '2024-02-28',
    days_until_expiry: 25,
    contract_yearly_amount: 10000,
    urgency_level: 'Low'
  }
];

describe('NotificationBadge', () => {
  it('renders notification badge with correct count', () => {
    render(<NotificationBadge count={5} urgencyLevel="Critical" />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render when count is 0', () => {
    const { container } = render(<NotificationBadge count={0} urgencyLevel="Low" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('shows 99+ for counts over 99', () => {
    render(<NotificationBadge count={150} urgencyLevel="High" />);
    
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies pulse animation for critical urgency', () => {
    render(<NotificationBadge count={3} urgencyLevel="Critical" />);
    
    const badge = screen.getByText('3');
    expect(badge).toHaveClass('animate-pulse');
  });
});

describe('UrgencyIndicator', () => {
  it('renders urgency indicator with correct level', () => {
    render(<UrgencyIndicator urgencyLevel="Critical" daysUntilExpiry={5} />);
    
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('5 days')).toBeInTheDocument();
  });

  it('shows singular day for 1 day', () => {
    render(<UrgencyIndicator urgencyLevel="High" daysUntilExpiry={1} />);
    
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('applies pulse animation for critical urgency', () => {
    render(<UrgencyIndicator urgencyLevel="Critical" daysUntilExpiry={3} />);
    
    const indicator = screen.getByText('Critical');
    expect(indicator).toHaveClass('animate-pulse');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(
      <UrgencyIndicator urgencyLevel="Medium" daysUntilExpiry={10} size="sm" />
    );
    
    let indicator = screen.getByText('Medium');
    expect(indicator).toHaveClass('text-xs');
    
    rerender(<UrgencyIndicator urgencyLevel="Medium" daysUntilExpiry={10} size="lg" />);
    
    indicator = screen.getByText('Medium');
    expect(indicator).toHaveClass('text-sm');
  });
});

describe('ExpirationAlert', () => {
  const mockContract = mockExpiringContracts[0];
  const mockOnDismiss = vi.fn();
  const mockOnViewContract = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders contract information correctly', () => {
    render(
      <ExpirationAlert
        contract={mockContract}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    expect(screen.getByText('Critical Contractor')).toBeInTheDocument();
    expect(screen.getByText('Critical service that expires very soon')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('calls onViewContract when view button is clicked', () => {
    render(
      <ExpirationAlert
        contract={mockContract}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    const viewButton = screen.getByText('View Contract');
    fireEvent.click(viewButton);
    
    expect(mockOnViewContract).toHaveBeenCalledWith(mockContract.id);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(
      <ExpirationAlert
        contract={mockContract}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    
    expect(mockOnDismiss).toHaveBeenCalledWith(mockContract.id);
  });

  it('renders in compact mode correctly', () => {
    render(
      <ExpirationAlert
        contract={mockContract}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
        compact={true}
      />
    );
    
    expect(screen.getByText('Critical Contractor')).toBeInTheDocument();
    expect(screen.getByText('Expires in 3 days')).toBeInTheDocument();
    
    // Should not show full service description in compact mode
    expect(screen.queryByText('Critical service that expires very soon')).not.toBeInTheDocument();
  });

  it('formats currency correctly', () => {
    render(
      <ExpirationAlert
        contract={mockContract}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    expect(screen.getByText('Value: OMR 50,000')).toBeInTheDocument();
  });
});

describe('ExpirationNotifications', () => {
  const mockOnDismiss = vi.fn();
  const mockOnViewContract = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all expiring contracts', () => {
    render(
      <ExpirationNotifications
        expiringContracts={mockExpiringContracts}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    expect(screen.getByText('Contracts Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('4 contracts expiring in the next 30 days')).toBeInTheDocument();
    expect(screen.getByText('(2 urgent)')).toBeInTheDocument();
    
    // Check that all contractors are displayed
    expect(screen.getByText('Critical Contractor')).toBeInTheDocument();
    expect(screen.getByText('High Priority Contractor')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Contractor')).toBeInTheDocument();
    expect(screen.getByText('Low Priority Contractor')).toBeInTheDocument();
  });

  it('does not render when no expiring contracts', () => {
    const { container } = render(
      <ExpirationNotifications
        expiringContracts={[]}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('prioritizes critical and high urgency contracts', () => {
    render(
      <ExpirationNotifications
        expiringContracts={mockExpiringContracts}
        onDismiss={mockOnDismiss}
        onViewContract={mockOnViewContract}
      />
    );
    
    const contractElements = screen.getAllByText(/Contractor/);
    
    // Critical should come first, then High, then Medium/Low
    expect(contractElements[0]).toHaveTextContent('Critical Contractor');
    expect(contractElements[1]).toHaveTextContent('High Priority Contractor');
  });
});

describe('NotificationCenter', () => {
  const mockOnViewContract = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification bell with badge', () => {
    render(
      <NotificationCenter
        expiringContracts={mockExpiringContracts}
        onViewContract={mockOnViewContract}
        onRefresh={mockOnRefresh}
      />
    );
    
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('opens dropdown when bell is clicked', async () => {
    render(
      <NotificationCenter
        expiringContracts={mockExpiringContracts}
        onViewContract={mockOnViewContract}
        onRefresh={mockOnRefresh}
      />
    );
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('shows correct summary in dropdown', async () => {
    render(
      <NotificationCenter
        expiringContracts={mockExpiringContracts}
        onViewContract={mockOnViewContract}
        onRefresh={mockOnRefresh}
      />
    );
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      expect(screen.getByText('4 contracts expiring soon')).toBeInTheDocument();
      expect(screen.getByText('2 require immediate attention')).toBeInTheDocument();
      expect(screen.getByText('1 Critical')).toBeInTheDocument();
      expect(screen.getByText('1 High')).toBeInTheDocument();
    });
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    render(
      <NotificationCenter
        expiringContracts={mockExpiringContracts}
        onViewContract={mockOnViewContract}
        onRefresh={mockOnRefresh}
      />
    );
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      const refreshButton = screen.getByTitle('Refresh notifications');
      fireEvent.click(refreshButton);
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <NotificationCenter
          expiringContracts={mockExpiringContracts}
          onViewContract={mockOnViewContract}
          onRefresh={mockOnRefresh}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
    
    const outsideElement = screen.getByTestId('outside');
    fireEvent.mouseDown(outsideElement);
    
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });
});

describe('useExpirationNotifications hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('filters out dismissed contracts', () => {
    const TestComponent = () => {
      const { visibleContracts, dismissContract } = useExpirationNotifications(mockExpiringContracts);
      
      return (
        <div>
          <div data-testid="visible-count">{visibleContracts.length}</div>
          <button onClick={() => dismissContract(1)}>Dismiss First</button>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('visible-count')).toHaveTextContent('4');
    
    const dismissButton = screen.getByText('Dismiss First');
    fireEvent.click(dismissButton);
    
    expect(screen.getByTestId('visible-count')).toHaveTextContent('3');
  });

  it('persists dismissals to localStorage', () => {
    const TestComponent = () => {
      const { dismissContract } = useExpirationNotifications(mockExpiringContracts);
      
      return (
        <button onClick={() => dismissContract(1)}>Dismiss First</button>
      );
    };
    
    render(<TestComponent />);
    
    const dismissButton = screen.getByText('Dismiss First');
    fireEvent.click(dismissButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'contractor_notification_dismissals',
      expect.stringContaining('"dismissedContracts":[1]')
    );
  });

  it('calculates notification summary correctly', () => {
    const TestComponent = () => {
      const { getNotificationSummary } = useExpirationNotifications(mockExpiringContracts);
      const summary = getNotificationSummary();
      
      return (
        <div>
          <div data-testid="critical">{summary.critical}</div>
          <div data-testid="high">{summary.high}</div>
          <div data-testid="medium">{summary.medium}</div>
          <div data-testid="low">{summary.low}</div>
          <div data-testid="urgent">{summary.urgent}</div>
          <div data-testid="total">{summary.total}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('critical')).toHaveTextContent('1');
    expect(screen.getByTestId('high')).toHaveTextContent('1');
    expect(screen.getByTestId('medium')).toHaveTextContent('1');
    expect(screen.getByTestId('low')).toHaveTextContent('1');
    expect(screen.getByTestId('urgent')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('4');
  });
});