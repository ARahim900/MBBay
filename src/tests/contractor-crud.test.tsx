import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddContractorModal } from '../components/contractor/AddContractorModal';
import { EditContractorModal } from '../components/contractor/EditContractorModal';
import { DeleteContractorModal } from '../components/contractor/DeleteContractorModal';
import { ContractorAPI } from '../lib/contractor-api';
import type { Contractor } from '../types/contractor';

// Mock the ContractorAPI
vi.mock('../lib/contractor-api', () => ({
  ContractorAPI: {
    createContractor: vi.fn(),
    updateContractor: vi.fn(),
    deleteContractor: vi.fn(),
  }
}));

// Mock the error handler
vi.mock('../utils/contractor-error-handler', () => ({
  ContractorErrorHandler: {
    handleAPIError: vi.fn((error) => error.message || 'API Error')
  }
}));

// Mock theme
vi.mock('../lib/theme', () => ({
  getThemeValue: vi.fn((path, fallback) => fallback)
}));

const mockContractor: Contractor = {
  id: 1,
  contractor_name: 'Test Contractor',
  service_provided: 'Test service description',
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

describe('Contractor CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AddContractorModal', () => {
    it('renders add contractor modal correctly', () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <AddContractorModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Add New Contractor')).toBeInTheDocument();
      expect(screen.getByLabelText(/contractor name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/service description/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add contractor/i })).toBeInTheDocument();
    });

    it('validates required fields', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <AddContractorModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add contractor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/contractor name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/service description is required/i)).toBeInTheDocument();
      });
    });

    it('submits form with valid data', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      const mockCreateContractor = vi.mocked(ContractorAPI.createContractor);
      mockCreateContractor.mockResolvedValue(mockContractor);

      render(
        <AddContractorModal
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/contractor name/i), {
        target: { value: 'Test Contractor' }
      });
      fireEvent.change(screen.getByLabelText(/service description/i), {
        target: { value: 'Test service description' }
      });
      fireEvent.change(screen.getByLabelText(/start date/i), {
        target: { value: '2024-01-01' }
      });
      fireEvent.change(screen.getByLabelText(/end date/i), {
        target: { value: '2024-12-31' }
      });

      const submitButton = screen.getByRole('button', { name: /add contractor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateContractor).toHaveBeenCalledWith({
          contractor_name: 'Test Contractor',
          service_provided: 'Test service description',
          status: 'Active',
          contract_type: 'Contract',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          contract_monthly_amount: null,
          contract_yearly_amount: null,
          notes: null
        });
        expect(mockOnSuccess).toHaveBeenCalledWith(mockContractor);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('EditContractorModal', () => {
    it('renders edit contractor modal with pre-populated data', () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <EditContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(`Edit Contractor: ${mockContractor.contractor_name}`)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockContractor.contractor_name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockContractor.service_provided)).toBeInTheDocument();
    });

    it('detects changes and enables update button', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <EditContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByDisplayValue(mockContractor.contractor_name);
      fireEvent.change(nameInput, { target: { value: 'Updated Contractor Name' } });

      await waitFor(() => {
        expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /update contractor/i })).toBeEnabled();
      });
    });

    it('submits updates with optimistic UI update', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      const mockUpdateContractor = vi.mocked(ContractorAPI.updateContractor);
      const updatedContractor = { ...mockContractor, contractor_name: 'Updated Name' };
      mockUpdateContractor.mockResolvedValue(updatedContractor);

      render(
        <EditContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      const nameInput = screen.getByDisplayValue(mockContractor.contractor_name);
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      const submitButton = screen.getByRole('button', { name: /update contractor/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('DeleteContractorModal', () => {
    it('renders delete confirmation modal', () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <DeleteContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Delete Contractor')).toBeInTheDocument();
      expect(screen.getByText(/permanent deletion warning/i)).toBeInTheDocument();
      expect(screen.getByText(mockContractor.contractor_name)).toBeInTheDocument();
    });

    it('requires confirmation text to enable delete button', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();

      render(
        <DeleteContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete contractor/i });
      expect(deleteButton).toBeDisabled();

      const confirmationInput = screen.getByPlaceholderText(/type 'delete' here/i);
      fireEvent.change(confirmationInput, { target: { value: 'delete' } });

      await waitFor(() => {
        expect(deleteButton).toBeEnabled();
      });
    });

    it('deletes contractor when confirmed', async () => {
      const mockOnClose = vi.fn();
      const mockOnSuccess = vi.fn();
      const mockDeleteContractor = vi.mocked(ContractorAPI.deleteContractor);
      mockDeleteContractor.mockResolvedValue();

      render(
        <DeleteContractorModal
          isOpen={true}
          onClose={mockOnClose}
          contractor={mockContractor}
          onSuccess={mockOnSuccess}
        />
      );

      const confirmationInput = screen.getByPlaceholderText(/type 'delete' here/i);
      fireEvent.change(confirmationInput, { target: { value: 'delete' } });

      const deleteButton = screen.getByRole('button', { name: /delete contractor/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteContractor).toHaveBeenCalledWith(mockContractor.id);
        expect(mockOnSuccess).toHaveBeenCalledWith(mockContractor.id);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });
});