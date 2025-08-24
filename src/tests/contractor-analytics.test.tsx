import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ContractorAnalytics } from '../components/contractor/ContractorAnalytics';
import type { ServiceContract, ExpiringContract, Contractor, ContractorSummary } from '../types/contractor';

// Mock data for testing
const mockContractsByService: ServiceContract[] = [
  {
    service_category: 'Cleaning',
    contract_count: 5,
    total_value: 150000,
    average_value: 30000,
    active_count: 4,
    expired_count: 1
  },
  {
    service_category: 'Security',
    contract_count: 3,
    total_value: 180000,
    average_value: 60000,
    active_count: 3,
    expired_count: 0
  },
  {
    service_category: 'HVAC',
    contract_count: 2,
    total_value: 80000,
    average_value: 40000,
    active_count: 1,
    expired_count: 1
  }
];

const mockExpiringContracts: ExpiringContract[] = [
  {
    id: 1,
    contractor_name: 'Test Contractor 1',
    service_provided: 'Cleaning services',
    end_date: '2024-12-31',
    days_until_expiry: 5,
    contract_yearly_amount: 30000,
    urgency_level: 'Critical'
  },
  {
    id: 2,
    contractor_name: 'Test Contractor 2',
    service_provided: 'Security services',
    end_date: '2025-01-15',
    days_until_expiry: 20,
    contract_yearly_amount: 60000,
    urgency_level: 'Medium'
  }
];

const mockAllContractors: Contractor[] = [
  {
    id: 1,
    contractor_name: 'Test Contractor 1',
    service_provided: 'Cleaning services',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    contract_monthly_amount: 2500,
    contract_yearly_amount: 30000,
    notes: 'Test notes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    contractor_name: 'Test Contractor 2',
    service_provided: 'Security services',
    status: 'Active',
    contract_type: 'Contract',
    start_date: '2024-02-01',
    end_date: '2025-01-31',
    contract_monthly_amount: 5000,
    contract_yearly_amount: 60000,
    notes: 'Test notes 2',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
];

const mockSummary: ContractorSummary = {
  total_contracts: 10,
  active_contracts: 8,
  expired_contracts: 2,
  pending_contracts: 0,
  total_yearly_value: 500000,
  average_contract_duration: 365
};

describe('ContractorAnalytics', () => {
  it('renders analytics dashboard header', () => {
    render(
      <ContractorAnalytics
        contractsByService={mockContractsByService}
        expiringContracts={mockExpiringContracts}
        allContractors={mockAllContractors}
        summary={mockSummary}
      />
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Contract performance insights and trends')).toBeInTheDocument();
  });

  it('displays key metrics correctly', () => {
    render(
      <ContractorAnalytics
        contractsByService={mockContractsByService}
        expiringContracts={mockExpiringContracts}
        allContractors={mockAllContractors}
        summary={mockSummary}
      />
    );

    // Check service categories count
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 service categories
    expect(screen.getByText('Service Categories')).toBeInTheDocument();

    // Check top service
    expect(screen.getByText('Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Top Service (5 contracts)')).toBeInTheDocument();

    // Check critical expiring count
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 critical expiring
    expect(screen.getByText('Critical Expiring')).toBeInTheDocument();
  });

  it('renders chart titles', () => {
    render(
      <ContractorAnalytics
        contractsByService={mockContractsByService}
        expiringContracts={mockExpiringContracts}
        allContractors={mockAllContractors}
        summary={mockSummary}
      />
    );

    expect(screen.getByText('Contracts by Service')).toBeInTheDocument();
    expect(screen.getByText('Distribution of contracts across service categories')).toBeInTheDocument();
    
    expect(screen.getByText('Expiring Contracts by Urgency')).toBeInTheDocument();
    expect(screen.getByText('Contract expiration timeline with urgency levels')).toBeInTheDocument();
    
    expect(screen.getByText('Contract Value Trends')).toBeInTheDocument();
    expect(screen.getByText('12-month trend analysis of contract values and activity')).toBeInTheDocument();
  });

  it('displays detailed expiring contracts when available', () => {
    render(
      <ContractorAnalytics
        contractsByService={mockContractsByService}
        expiringContracts={mockExpiringContracts}
        allContractors={mockAllContractors}
        summary={mockSummary}
      />
    );

    expect(screen.getByText('Detailed Expiring Contracts')).toBeInTheDocument();
    expect(screen.getByText('Test Contractor 1')).toBeInTheDocument();
    expect(screen.getByText('Test Contractor 2')).toBeInTheDocument();
    expect(screen.getByText('Expires in 5 days')).toBeInTheDocument();
    expect(screen.getByText('Expires in 20 days')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(
      <ContractorAnalytics
        contractsByService={[]}
        expiringContracts={[]}
        allContractors={[]}
        summary={{
          total_contracts: 0,
          active_contracts: 0,
          expired_contracts: 0,
          pending_contracts: 0,
          total_yearly_value: 0,
          average_contract_duration: 0
        }}
      />
    );

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for empty data
  });

  it('calculates urgency levels correctly', () => {
    const criticalContract: ExpiringContract = {
      id: 3,
      contractor_name: 'Critical Contractor',
      service_provided: 'Critical service',
      end_date: '2024-12-25',
      days_until_expiry: 3,
      contract_yearly_amount: 50000,
      urgency_level: 'Critical'
    };

    render(
      <ContractorAnalytics
        contractsByService={mockContractsByService}
        expiringContracts={[...mockExpiringContracts, criticalContract]}
        allContractors={mockAllContractors}
        summary={mockSummary}
      />
    );

    // Should show 2 critical expiring contracts now
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Critical Expiring')).toBeInTheDocument();
  });
});