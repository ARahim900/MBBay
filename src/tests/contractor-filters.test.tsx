import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContractorFilters } from '../components/contractor/ContractorFilters';
import { ContractorFilters as IContractorFilters, Contractor } from '../types/contractor';

// Mock theme utility
jest.mock('../lib/theme', () => ({
  getThemeValue: (path: string, fallback: string) => fallback
}));

// Sample test data
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'ABC Cleaning Services',
    service_provided: 'Cleaning and Maintenance',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 5000,
    contract_yearly_amount: 60000,
    notes: 'Regular cleaning services',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'XYZ Security',
    service_provided: 'Security Services',
    status: 'Active',
    contract_type: 'PO',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    contract_monthly_amount: 8000,
    contract_yearly_amount: 96000,
    notes: '24/7 security coverage',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  },
  {
    id: 3,
    contractor_name: 'DEF Maintenance',
    service_provided: 'HVAC Maintenance',
    status: 'Expired',
    contract_type: 'Contract',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    contract_monthly_amount: 3000,
    contract_yearly_amount: 36000,
    notes: 'HVAC system maintenance',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
];

describe('ContractorFilters', () => {
  const defaultFilters: IContractorFilters = {
    status: 'all',
    search: '',
    contractType: 'all',
    dateRange: null,
    serviceCategory: null
  };

  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
  });

  it('renders search input with placeholder text', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    expect(screen.getByPlaceholderText('Search contractors, services, or notes...')).toBeInTheDocument();
  });

  it('renders status filter dropdown with all options', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    expect(statusSelect).toBeInTheDocument();
    
    // Check if all status options are available
    fireEvent.click(statusSelect);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders contract type filter dropdown with all options', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const typeSelect = screen.getByDisplayValue('All Types');
    expect(typeSelect).toBeInTheDocument();
    
    // Check if all type options are available
    fireEvent.click(typeSelect);
    expect(screen.getByText('Contract')).toBeInTheDocument();
    expect(screen.getByText('Purchase Order')).toBeInTheDocument();
  });

  it('calls onFiltersChange when search input changes', async () => {
    const user = userEvent.setup();
    
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search contractors, services, or notes...');
    await user.type(searchInput, 'ABC');

    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'ABC'
      });
    });
  });

  it('calls onFiltersChange when status filter changes', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'Active' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: 'Active'
    });
  });

  it('calls onFiltersChange when contract type filter changes', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const typeSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(typeSelect, { target: { value: 'Contract' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      contractType: 'Contract'
    });
  });

  it('shows advanced filters when expanded', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    expect(screen.getByText('Quick Filters')).toBeInTheDocument();
    expect(screen.getByText('Service Category')).toBeInTheDocument();
    expect(screen.getByText('Contract Period')).toBeInTheDocument();
  });

  it('generates service categories from data', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Check service category dropdown
    const serviceSelect = screen.getByDisplayValue('All Services');
    fireEvent.click(serviceSelect);
    
    // Should have extracted service categories from mock data
    expect(screen.getByText('Cleaning and')).toBeInTheDocument(); // "Cleaning and Maintenance" -> "Cleaning and"
    expect(screen.getByText('Security')).toBeInTheDocument(); // "Security Services" -> "Security"
    expect(screen.getByText('HVAC')).toBeInTheDocument(); // "HVAC Maintenance" -> "HVAC"
  });

  it('handles date range filtering', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Find date inputs
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => 
      input.getAttribute('placeholder') === 'Start date'
    ) as HTMLInputElement;
    const endDateInput = dateInputs.find(input => 
      input.getAttribute('placeholder') === 'End date'
    ) as HTMLInputElement;

    expect(startDateInput).toBeInTheDocument();
    expect(endDateInput).toBeInTheDocument();

    // Set date range
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      }
    });
  });

  it('shows active filter count badge', () => {
    const filtersWithActive: IContractorFilters = {
      status: 'Active',
      search: 'ABC',
      contractType: 'Contract',
      dateRange: null,
      serviceCategory: null
    };

    render(
      <ContractorFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Should show badge with count of 3 (status + search + contractType)
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows clear filters button when filters are active', () => {
    const filtersWithActive: IContractorFilters = {
      status: 'Active',
      search: 'ABC',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };

    render(
      <ContractorFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    const clearButton = screen.getByText('Clear');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(defaultFilters);
  });

  it('shows filter summary when filters are active', () => {
    const filtersWithActive: IContractorFilters = {
      status: 'Active',
      search: 'ABC',
      contractType: 'Contract',
      dateRange: {
        start: '2024-01-01',
        end: '2024-12-31'
      },
      serviceCategory: 'Cleaning'
    };

    render(
      <ContractorFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters to see summary
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    expect(screen.getByText('Active filters:')).toBeInTheDocument();
    expect(screen.getByText('Search: "ABC"')).toBeInTheDocument();
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
    expect(screen.getByText('Type: Contract')).toBeInTheDocument();
    expect(screen.getByText('Service: Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Date: 2024-01-01 to 2024-12-31')).toBeInTheDocument();
  });

  it('provides quick filter presets', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Check quick filter presets
    expect(screen.getByText('Active Contracts')).toBeInTheDocument();
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('Contracts Only')).toBeInTheDocument();

    // Click on "Active Contracts" preset
    const activeContractsButton = screen.getByText('Active Contracts');
    fireEvent.click(activeContractsButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      status: 'Active'
    });
  });

  it('provides date range presets', () => {
    render(
      <ContractorFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Check date range presets
    expect(screen.getByText('Expiring in 30 days')).toBeInTheDocument();
    expect(screen.getByText('Expiring in 90 days')).toBeInTheDocument();
    expect(screen.getByText('This year')).toBeInTheDocument();

    // Click on "Expiring in 30 days" preset
    const expiringButton = screen.getByText('Expiring in 30 days');
    fireEvent.click(expiringButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        dateRange: expect.objectContaining({
          start: expect.any(String),
          end: expect.any(String)
        })
      })
    );
  });

  it('allows clearing individual filter tags', () => {
    const filtersWithActive: IContractorFilters = {
      status: 'Active',
      search: 'ABC',
      contractType: 'all',
      dateRange: null,
      serviceCategory: null
    };

    render(
      <ContractorFilters
        filters={filtersWithActive}
        onFiltersChange={mockOnFiltersChange}
        data={mockContractors}
      />
    );

    // Expand advanced filters to see filter tags
    const filtersButton = screen.getByText('Filters');
    fireEvent.click(filtersButton);

    // Find and click the X button on the search filter tag
    const searchTag = screen.getByText('Search: "ABC"');
    const clearSearchButton = searchTag.parentElement?.querySelector('button');
    expect(clearSearchButton).toBeInTheDocument();
    
    if (clearSearchButton) {
      fireEvent.click(clearSearchButton);
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filtersWithActive,
        search: ''
      });
    }
  });
});