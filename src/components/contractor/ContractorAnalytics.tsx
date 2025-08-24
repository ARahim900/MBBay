import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card } from '../ui/Card';
import { 
  ModernDonutChart, 
  ModernBarChart, 
  ModernLineChart,
  ChartConfig 
} from '../ui/ModernChart';
import { getThemeValue } from '../../lib/theme';
import type { 
  ServiceContract, 
  ExpiringContract, 
  Contractor,
  ContractorSummary 
} from '../../types/contractor';

interface ContractorAnalyticsProps {
  contractsByService: ServiceContract[];
  expiringContracts: ExpiringContract[];
  allContractors: Contractor[];
  summary: ContractorSummary;
  className?: string;
}

export const ContractorAnalytics: React.FC<ContractorAnalyticsProps> = ({
  contractsByService,
  expiringContracts,
  allContractors,
  summary,
  className = ""
}) => {
  // Prepare contracts by service pie chart data
  const serviceChartData = useMemo(() => {
    return contractsByService.map((service, index) => ({
      name: service.service_category,
      value: service.contract_count,
      totalValue: service.total_value,
      activeCount: service.active_count,
      expiredCount: service.expired_count
    }));
  }, [contractsByService]);

  const serviceChartConfig: ChartConfig = useMemo(() => {
    const colors = [
      getThemeValue('colors.primary', '#2D9CDB'),
      getThemeValue('colors.status.success', '#10b981'),
      getThemeValue('colors.status.warning', '#f59e0b'),
      getThemeValue('colors.extended.purple', '#8b5cf6'),
      getThemeValue('colors.secondary', '#FF5B5B'),
      getThemeValue('colors.accent', '#F7C604'),
      getThemeValue('colors.extended.pink', '#ec4899'),
      getThemeValue('colors.extended.indigo', '#6366f1')
    ];

    return contractsByService.reduce((config, service, index) => {
      config[service.service_category] = {
        label: service.service_category,
        color: colors[index % colors.length]
      };
      return config;
    }, {} as ChartConfig);
  }, [contractsByService]);

  // Prepare expiring contracts timeline data with urgency color coding
  const expiringTimelineData = useMemo(() => {
    // Group by urgency level
    const urgencyGroups = expiringContracts.reduce((groups, contract) => {
      const level = contract.urgency_level;
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(contract);
      return groups;
    }, {} as Record<string, ExpiringContract[]>);

    // Create timeline data points
    const timelineData = [
      {
        name: 'Critical (≤7 days)',
        count: urgencyGroups.Critical?.length || 0,
        value: urgencyGroups.Critical?.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0) || 0,
        contracts: urgencyGroups.Critical || []
      },
      {
        name: 'High (8-14 days)',
        count: urgencyGroups.High?.length || 0,
        value: urgencyGroups.High?.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0) || 0,
        contracts: urgencyGroups.High || []
      },
      {
        name: 'Medium (15-21 days)',
        count: urgencyGroups.Medium?.length || 0,
        value: urgencyGroups.Medium?.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0) || 0,
        contracts: urgencyGroups.Medium || []
      },
      {
        name: 'Low (22-30 days)',
        count: urgencyGroups.Low?.length || 0,
        value: urgencyGroups.Low?.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0) || 0,
        contracts: urgencyGroups.Low || []
      }
    ];

    return timelineData;
  }, [expiringContracts]);

  const expiringTimelineConfig: ChartConfig = {
    count: {
      label: 'Contract Count',
      color: getThemeValue('colors.status.warning', '#f59e0b')
    },
    value: {
      label: 'Total Value (OMR)',
      color: getThemeValue('colors.extended.purple', '#8b5cf6')
    }
  };

  // Prepare contract value trends data
  const contractValueTrends = useMemo(() => {
    // Group contracts by month for the last 12 months
    const now = new Date();
    const monthsData = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      // Find contracts that were active in this month
      const monthContracts = allContractors.filter(contract => {
        const startDate = new Date(contract.start_date);
        const endDate = new Date(contract.end_date);
        return startDate <= date && endDate >= date;
      });

      const totalValue = monthContracts.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);
      const activeCount = monthContracts.filter(c => c.status === 'Active').length;
      const newContracts = monthContracts.filter(c => {
        const contractStart = new Date(c.start_date);
        return contractStart.getMonth() === date.getMonth() && 
               contractStart.getFullYear() === date.getFullYear();
      }).length;

      monthsData.push({
        name: monthName,
        totalValue: Math.round(totalValue / 1000), // Convert to thousands
        activeContracts: activeCount,
        newContracts: newContracts
      });
    }

    return monthsData;
  }, [allContractors]);

  const valueTrendsConfig: ChartConfig = {
    totalValue: {
      label: 'Total Value (K OMR)',
      color: getThemeValue('colors.primary', '#2D9CDB')
    },
    activeContracts: {
      label: 'Active Contracts',
      color: getThemeValue('colors.status.success', '#10b981')
    },
    newContracts: {
      label: 'New Contracts',
      color: getThemeValue('colors.accent', '#F7C604')
    }
  };

  // Calculate key metrics for display
  const totalServiceCategories = contractsByService.length;
  const mostPopularService = contractsByService.reduce((max, service) => 
    service.contract_count > max.contract_count ? service : max, 
    contractsByService[0] || { service_category: 'N/A', contract_count: 0 }
  );

  const criticalExpiringCount = expiringContracts.filter(c => c.urgency_level === 'Critical').length;
  const expiringValue = expiringContracts.reduce((sum, c) => sum + (c.contract_yearly_amount || 0), 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 
            className="flex items-center gap-2 dark:text-white"
            style={{ 
              fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
              fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
              color: getThemeValue('colors.textPrimary', '#111827'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            <TrendingUp className="h-5 w-5" style={{ color: getThemeValue('colors.extended.purple', '#8b5cf6') }} />
            Analytics Dashboard
          </h3>
          <p 
            style={{ 
              fontSize: getThemeValue('typography.labelSize', '0.875rem'),
              color: getThemeValue('colors.textSecondary', '#6B7280'),
              fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
            }}
          >
            Contract performance insights and trends
          </p>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getThemeValue('colors.primary', '#2D9CDB')}15` }}
            >
              <PieChartIcon className="h-5 w-5" style={{ color: getThemeValue('colors.primary', '#2D9CDB') }} />
            </div>
            <div>
              <p 
                className="text-2xl font-bold dark:text-white"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                {totalServiceCategories}
              </p>
              <p 
                className="text-sm"
                style={{ color: getThemeValue('colors.textSecondary', '#6B7280') }}
              >
                Service Categories
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getThemeValue('colors.status.success', '#10b981')}15` }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: getThemeValue('colors.status.success', '#10b981') }} />
            </div>
            <div>
              <p 
                className="text-lg font-semibold dark:text-white truncate"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                {mostPopularService.service_category}
              </p>
              <p 
                className="text-sm"
                style={{ color: getThemeValue('colors.textSecondary', '#6B7280') }}
              >
                Top Service ({mostPopularService.contract_count} contracts)
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getThemeValue('colors.status.error', '#ef4444')}15` }}
            >
              <AlertTriangle className="h-5 w-5" style={{ color: getThemeValue('colors.status.error', '#ef4444') }} />
            </div>
            <div>
              <p 
                className="text-2xl font-bold dark:text-white"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                {criticalExpiringCount}
              </p>
              <p 
                className="text-sm"
                style={{ color: getThemeValue('colors.textSecondary', '#6B7280') }}
              >
                Critical Expiring
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${getThemeValue('colors.extended.purple', '#8b5cf6')}15` }}
            >
              <DollarSign className="h-5 w-5" style={{ color: getThemeValue('colors.extended.purple', '#8b5cf6') }} />
            </div>
            <div>
              <p 
                className="text-lg font-bold dark:text-white"
                style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
              >
                OMR {(expiringValue / 1000).toFixed(0)}K
              </p>
              <p 
                className="text-sm"
                style={{ color: getThemeValue('colors.textSecondary', '#6B7280') }}
              >
                Expiring Value
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contracts by Service Pie Chart */}
        <ModernDonutChart
          data={serviceChartData}
          config={serviceChartConfig}
          title="Contracts by Service"
          description="Distribution of contracts across service categories"
          height="h-[400px]"
          showLegend={true}
        />

        {/* Expiring Contracts Timeline */}
        <ModernBarChart
          data={expiringTimelineData}
          config={expiringTimelineConfig}
          title="Expiring Contracts by Urgency"
          description="Contract expiration timeline with urgency levels"
          height="h-[400px]"
          showLegend={true}
          stacked={false}
        />
      </div>

      {/* Contract Value Trends - Full Width */}
      <ModernLineChart
        data={contractValueTrends}
        config={valueTrendsConfig}
        title="Contract Value Trends"
        description="12-month trend analysis of contract values and activity"
        height="h-[400px]"
        showLegend={true}
        curved={true}
        showDots={true}
      />

      {/* Detailed Expiring Contracts List */}
      {expiringContracts.length > 0 && (
        <Card>
          <div className="p-6">
            <h4 
              className="flex items-center gap-2 mb-4 dark:text-white"
              style={{ 
                fontSize: getThemeValue('typography.fontSize.lg', '1.125rem'),
                fontWeight: getThemeValue('typography.fontWeight.semibold', '600'),
                color: getThemeValue('colors.textPrimary', '#111827'),
                fontFamily: getThemeValue('typography.fontFamily', 'Inter, sans-serif')
              }}
            >
              <Calendar className="h-5 w-5" style={{ color: getThemeValue('colors.status.warning', '#f59e0b') }} />
              Detailed Expiring Contracts
            </h4>
            
            <div className="space-y-3">
              {expiringContracts.slice(0, 10).map((contract) => (
                <div 
                  key={contract.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border"
                  style={{ 
                    borderColor: getThemeValue('colors.gridLines', '#e5e7eb'),
                    backgroundColor: getThemeValue('colors.background', '#ffffff') + '50'
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        contract.urgency_level === 'Critical' ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: 
                          contract.urgency_level === 'Critical' ? getThemeValue('colors.status.error', '#ef4444') :
                          contract.urgency_level === 'High' ? getThemeValue('colors.status.warning', '#f59e0b') :
                          contract.urgency_level === 'Medium' ? getThemeValue('colors.status.info', '#3b82f6') :
                          getThemeValue('colors.status.success', '#10b981')
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p 
                        className="font-medium dark:text-white truncate"
                        style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
                      >
                        {contract.contractor_name}
                      </p>
                      <p 
                        className="text-sm line-clamp-1"
                        style={{ color: getThemeValue('colors.textSecondary', '#6B7280') }}
                      >
                        {contract.service_provided}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: getThemeValue('colors.gray.500', '#6b7280') }}
                      >
                        Expires in {contract.days_until_expiry} days ({new Date(contract.end_date).toLocaleDateString()})
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {contract.contract_yearly_amount && (
                      <p 
                        className="text-sm font-medium dark:text-white"
                        style={{ color: getThemeValue('colors.textPrimary', '#111827') }}
                      >
                        OMR {contract.contract_yearly_amount.toLocaleString()}
                      </p>
                    )}
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 
                          contract.urgency_level === 'Critical' ? `${getThemeValue('colors.status.error', '#ef4444')}20` :
                          contract.urgency_level === 'High' ? `${getThemeValue('colors.status.warning', '#f59e0b')}20` :
                          contract.urgency_level === 'Medium' ? `${getThemeValue('colors.status.info', '#3b82f6')}20` :
                          `${getThemeValue('colors.status.success', '#10b981')}20`,
                        color: 
                          contract.urgency_level === 'Critical' ? getThemeValue('colors.status.error', '#ef4444') :
                          contract.urgency_level === 'High' ? getThemeValue('colors.status.warning', '#f59e0b') :
                          contract.urgency_level === 'Medium' ? getThemeValue('colors.status.info', '#3b82f6') :
                          getThemeValue('colors.status.success', '#10b981')
                      }}
                    >
                      {contract.urgency_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};