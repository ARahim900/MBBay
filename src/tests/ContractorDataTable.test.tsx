import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractorDataTable } from '../components/contractor/ContractorDataTable';
import { Contractor } from '../types/contractor';

// Mock data for testing
const mockContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'ABC Construction',
    service_provided: 'Building maintenance and repairs',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 5000,
    contract_yearly_amount: 60000,
    notes: 'Reliable contractor for general maintenance',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'XYZ Services',
    service_provided: 'Electrical maintenance',
    status: 'Expired',
    contract_type: 'PO',
    start_date: '2023-01-01',
    end_date: '2023-12-31',
    contract_monthly_amount: 3000,
    contract_yearly_amount: 36000,
    notes: 'Specialized electrical services',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: 3,
    contractor_name: 'DEF Plumbing',
    service_provided: 'Plumbing and water systems',
    status: 'Pending',
    contract_type: 'Contract',
    start_date: '2024-06-01',
    end_date: '2025-05-31',
    contract_monthly_amount: 4000,
    contract_yearly_amount: 48000,
    notes: null,
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-05-01T00:00:00Z'
  }
];

describe('ContractorDataTable', () => {
  const mockProps = {
    data: mockContractors,
    loading: false,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
    onExport: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders contractor data table with correct data', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    // Check if table headers are present
    expect(screen.getByText('Contractor')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Annual Value')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
    
    // Check if contractor data is displayed
    expect(screen.getByText('ABC Construction')).toBeInTheDocument();
    expect(screen.getByText('XYZ Services')).toBeInTheDocument();
    expect(screen.getByText('DEF Plumbing')).toBeInTheDocument();
  });

  test('displays status badges correctly', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    // Check if status badges are rendered
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  test('filters contractors by search term', async () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search contractors, services, or notes...');
    
    // Search for "ABC"
    fireEvent.change(searchInput, { target: { value: 'ABC' } });
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction')).toBeInTheDocument();
      expect(screen.queryByText('XYZ Services')).not.toBeInTheDocument();
      expect(screen.queryByText('DEF Plumbing')).not.toBeInTheDocument();
    });
  });

  test('filters contractors by status', async () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const statusFilter = screen.getByDisplayValue('All Status');
    
    // Filter by Active status
    fireEvent.change(statusFilter, { target: { value: 'Active' } });
    
    await waitFor(() => {
      expect(screen.getByText('ABC Construction')).toBeInTheDocument();
      expect(screen.queryByText('XYZ Services')).not.toBeInTheDocument();
      expect(screen.queryByText('DEF Plumbing')).not.toBeInTheDocument();
    });
  });

  test('filters contractors by contract type', async () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const typeFilter = screen.getByDisplayValue('All Types');
    
    // Filter by PO type
    fireEvent.change(typeFilter, { target: { value: 'PO' } });
    
    await waitFor(() => {
      expect(screen.queryByText('ABC Construction')).not.toBeInTheDocument();
      expect(screen.getByText('XYZ Services')).toBeInTheDocument();
      expect(screen.queryByText('DEF Plumbing')).not.toBeInTheDocument();
    });
  });

  test('sorts contractors by name', async () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const nameHeader = screen.getByText('Contractor').closest('th');
    
    // Click to sort by name
    fireEvent.click(nameHeader!);
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      // First row should be header, second should be ABC Construction (alphabetically first)
      expect(rows[1]).toHaveTextContent('ABC Construction');
    });
  });

  test('calls action handlers when buttons are clicked', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    // Find action buttons for the first contractor
    const editButtons = screen.getAllByTitle('Edit contractor');
    const deleteButtons = screen.getAllByTitle('Delete contractor');
    const viewButtons = screen.getAllByTitle('View details');
    
    // Click edit button
    fireEvent.click(editButtons[0]);
    expect(mockProps.onEdit).toHaveBeenCalledWith(mockContractors[0]);
    
    // Click delete button
    fireEvent.click(deleteButtons[0]);
    expect(mockProps.onDelete).toHaveBeenCalledWith(mockContractors[0]);
    
    // Click view button
    fireEvent.click(viewButtons[0]);
    expect(mockProps.onView).toHaveBeenCalledWith(mockContractors[0]);
  });

  test('calls export handler when export button is clicked', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);
    
    expect(mockProps.onExport).toHaveBeenCalled();
  });

  test('displays loading skeleton when loading', () => {
    render(<ContractorDataTable {...mockProps} loading={true} />);
    
    // Check if loading skeleton is displayed
    expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
    expect(screen.queryByText('ABC Construction')).not.toBeInTheDocument();
  });

  test('displays empty state when no data', () => {
    render(<ContractorDataTable {...mockProps} data={[]} />);
    
    expect(screen.getByText('No contractors found')).toBeInTheDocument();
    expect(screen.getByText('No contractor data available.')).toBeInTheDocument();
  });

  test('displays filtered empty state when search returns no results', async () => {
    render(<ContractorDataTable {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search contractors, services, or notes...');
    
    // Search for something that doesn't exist
    fireEvent.change(searchInput, { target: { value: 'NonExistentContractor' } });
    
    await waitFor(() => {
      expect(screen.getByText('No contractors found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters to see more results.')).toBeInTheDocument();
    });
  });

  test('formats currency correctly', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    // Check if currency is formatted correctly
    expect(screen.getByText('OMR 60,000')).toBeInTheDocument();
    expect(screen.getByText('OMR 36,000')).toBeInTheDocument();
    expect(screen.getByText('OMR 48,000')).toBeInTheDocument();
  });

  test('formats dates correctly', () => {
    render(<ContractorDataTable {...mockProps} />);
    
    // Check if dates are formatted correctly (DD/MM/YYYY format)
    expect(screen.getByText('31/12/2024')).toBeInTheDocument();
    expect(screen.getByText('31/12/2023')).toBeInTheDocument();
    expect(screen.getByText('31/05/2025')).toBeInTheDocument();
  });

  test('handles pagination correctly', async () => {
    // Create more data to test pagination
    const manyContractors = Array.from({ length: 25 }, (_, i) => ({
      ...mockContractors[0],
      id: i + 1,
      contractor_name: `Contractor ${i + 1}`
    }));

    render(<ContractorDataTable {...mockProps} data={manyContractors} />);
    
    // Should show pagination controls
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    // Click next page
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    });
  });
});