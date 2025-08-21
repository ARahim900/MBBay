import React from 'react';
import { theme } from '../../lib/theme';
import { 
  ModernAreaChart, 
  ModernBarChart, 
  ModernLineChart, 
  ModernDonutChart 
} from './ModernChart';
import { 
  ModernAreaChart as SimpleAreaChart,
  ModernBarChart as SimpleBarChart,
  ModernLineChart as SimpleLineChart,
  DonutChart
} from './Chart';

// Example data for charts
const monthlyData = [
  { month: 'Jan', value1: 400, value2: 240, value3: 100 },
  { month: 'Feb', value1: 300, value2: 139, value3: 220 },
  { month: 'Mar', value1: 200, value2: 980, value3: 220 },
  { month: 'Apr', value1: 278, value2: 390, value3: 200 },
  { month: 'May', value1: 189, value2: 480, value3: 218 },
  { month: 'Jun', value1: 239, value2: 380, value3: 250 },
];

const pieData = [
  { name: 'Residential', value: 400 },
  { name: 'Commercial', value: 300 },
  { name: 'Industrial', value: 200 },
];

/**
 * Unified Chart Examples using the centralized theme configuration
 * 
 * This component demonstrates how to use the theme object for consistent styling
 * across all chart types. All colors, fonts, and sizes are derived from the theme.
 */
export const UnifiedChartExamples: React.FC = () => {
  // Chart configurations using theme colors
  const areaChartConfig = {
    primary: {
      label: 'Primary Series',
      color: theme.colors.primary
    },
    secondary: {
      label: 'Secondary Series',
      color: theme.colors.secondary
    },
    accent: {
      label: 'Accent Series',
      color: theme.colors.accent
    }
  };

  const barChartConfig = {
    residential: {
      label: 'Residential',
      color: theme.colors.primary
    },
    commercial: {
      label: 'Commercial',
      color: theme.colors.secondary
    },
    industrial: {
      label: 'Industrial',
      color: theme.colors.accent
    }
  };

  const lineChartConfig = {
    revenue: {
      label: 'Revenue',
      color: theme.colors.primary
    },
    expenses: {
      label: 'Expenses',
      color: theme.colors.secondary
    },
    profit: {
      label: 'Profit',
      color: theme.colors.accent
    }
  };

  const donutChartConfig = {
    residential: {
      label: 'Residential',
      color: theme.colors.primary
    },
    commercial: {
      label: 'Commercial',
      color: theme.colors.secondary
    },
    industrial: {
      label: 'Industrial',
      color: theme.colors.accent
    }
  };

  // Transform data for charts
  const areaChartData = monthlyData.map(item => ({
    month: item.month,
    primary: item.value1,
    secondary: item.value2,
    accent: item.value3
  }));

  const barChartData = monthlyData.map(item => ({
    month: item.month,
    residential: item.value1,
    commercial: item.value2,
    industrial: item.value3
  }));

  const lineChartData = monthlyData.map(item => ({
    month: item.month,
    revenue: item.value1 + item.value2,
    expenses: item.value2,
    profit: item.value1
  }));

  return (
    <div className="p-8 space-y-8" style={{ backgroundColor: theme.colors.background }}>
      <div className="text-center mb-8">
        <h1 
          className="font-bold mb-2" 
          style={{
            fontSize: '2rem',
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Unified Chart Theme Examples
        </h1>
        <p 
          style={{
            fontSize: theme.typography.labelSize,
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          All charts below use the centralized theme configuration for consistent styling
        </p>
      </div>

      {/* Area Chart with Gradient Fill */}
      <div className="mb-8">
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Area Chart with Smooth Curves
        </h2>
        <ModernAreaChart
          data={areaChartData}
          config={areaChartConfig}
          title="Monthly Performance Metrics"
          description="Showing primary, secondary, and accent data series"
          curved={true}
          stacked={false}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Bar Chart with Hover Effects */}
      <div className="mb-8">
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Bar Chart with Rounded Corners
        </h2>
        <ModernBarChart
          data={barChartData}
          config={barChartConfig}
          title="Consumption by Type"
          description="Monthly breakdown by customer category"
          showGrid={true}
          showLegend={true}
          stacked={false}
        />
      </div>

      {/* Line Chart with Smooth Splines */}
      <div className="mb-8">
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Line Chart with Data Points
        </h2>
        <ModernLineChart
          data={lineChartData}
          config={lineChartConfig}
          title="Financial Overview"
          description="Revenue, expenses, and profit trends"
          curved={true}
          showDots={true}
          showGrid={true}
          showLegend={true}
        />
      </div>

      {/* Donut Chart */}
      <div className="mb-8">
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Donut Chart (Doughnut Style)
        </h2>
        <ModernDonutChart
          data={pieData}
          config={donutChartConfig}
          title="Distribution by Category"
          description="Percentage breakdown of total consumption"
          showLegend={true}
        />
      </div>

      {/* Gauge/Progress Chart */}
      <div className="mb-8">
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Gauge Charts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DonutChart
            value={75}
            maxValue={100}
            color={theme.colors.primary}
            title="75%"
            subtitle="Primary Metric"
            size="md"
          />
          <DonutChart
            value={60}
            maxValue={100}
            color={theme.colors.secondary}
            title="60%"
            subtitle="Secondary Metric"
            size="md"
          />
          <DonutChart
            value={90}
            maxValue={100}
            color={theme.colors.accent}
            title="90%"
            subtitle="Accent Metric"
            size="md"
          />
        </div>
      </div>

      {/* Theme Color Palette Display */}
      <div className="mt-12 p-6 rounded-lg" style={{ backgroundColor: theme.colors.gridLines }}>
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Theme Color Palette
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.primary }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Primary<br/>{theme.colors.primary}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Secondary<br/>{theme.colors.secondary}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.accent }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Accent<br/>{theme.colors.accent}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2 border" 
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.gridLines }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Background<br/>{theme.colors.background}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.textPrimary }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Text Primary<br/>{theme.colors.textPrimary}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.textSecondary }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Text Secondary<br/>{theme.colors.textSecondary}
            </p>
          </div>
          <div className="text-center">
            <div 
              className="w-full h-20 rounded-lg mb-2" 
              style={{ backgroundColor: theme.colors.gridLines }}
            />
            <p style={{ fontSize: theme.typography.tooltipSize, color: theme.colors.textSecondary }}>
              Grid Lines<br/>{theme.colors.gridLines}
            </p>
          </div>
        </div>
      </div>

      {/* Typography Examples */}
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: theme.colors.gridLines }}>
        <h2 
          className="font-semibold mb-4"
          style={{
            fontSize: theme.typography.titleSize,
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}
        >
          Typography Scale
        </h2>
        <div className="space-y-2">
          <p style={{ 
            fontSize: theme.typography.titleSize, 
            color: theme.colors.textPrimary,
            fontFamily: theme.typography.fontFamily
          }}>
            Title Size (1.25rem / 20px): Chart titles and main headings
          </p>
          <p style={{ 
            fontSize: theme.typography.labelSize, 
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamily
          }}>
            Label Size (0.875rem / 14px): Axis labels, legends, and subtitles
          </p>
          <p style={{ 
            fontSize: theme.typography.tooltipSize, 
            color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamily
          }}>
            Tooltip Size (0.75rem / 12px): Tooltip content and small annotations
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedChartExamples;