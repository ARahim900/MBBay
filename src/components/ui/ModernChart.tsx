import React from 'react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Card } from './Card';
import { theme } from '../../lib/theme';

// Chart Configuration Type
export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Modern Chart Container
interface ChartContainerProps {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  config, 
  className = "aspect-auto h-[400px] w-full", 
  children 
}) => {
  // Inject CSS variables for chart colors
  const chartVars = Object.entries(config).reduce((vars, [key, value]) => ({
    ...vars,
    [`--color-${key}`]: value.color,
  }), {});

  return (
    <div className={className} style={chartVars}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

// Modern Chart Tooltip
interface ChartTooltipContentProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  labelFormatter?: (value: any) => string;
  indicator?: 'dot' | 'line' | 'none';
}

export const ChartTooltipContent: React.FC<ChartTooltipContentProps> = ({
  active,
  payload,
  label,
  labelFormatter,
  indicator = 'dot'
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const formatLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div 
      className="backdrop-blur-sm p-4 rounded-xl shadow-2xl border"
      style={{
        backgroundColor: `${theme.colors.background}F2`,
        borderColor: theme.colors.gridLines,
        fontSize: theme.typography.tooltipSize
      }}
    >
      {formatLabel && (
        <p 
          className="font-semibold mb-3"
          style={{ 
            color: theme.colors.textPrimary,
            fontSize: theme.typography.labelSize 
          }}
        >
          {formatLabel}
        </p>
      )}
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3">
            {indicator === 'dot' && (
              <div 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
            )}
            {indicator === 'line' && (
              <div 
                className="w-4 h-0.5 flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
            )}
            <span className="min-w-0" style={{ color: theme.colors.textSecondary }}>
              {entry.name}
            </span>
            <span className="font-medium ml-auto" style={{ color: theme.colors.textPrimary }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartTooltip = ({ content, cursor = false, ...props }: any) => (
  <Tooltip 
    content={content} 
    cursor={cursor}
    {...props}
  />
);

// Modern Chart Legend
interface ChartLegendContentProps {
  payload?: any[];
  verticalAlign?: 'top' | 'middle' | 'bottom';
  align?: 'left' | 'center' | 'right';
}

export const ChartLegendContent: React.FC<ChartLegendContentProps> = ({
  payload = []
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span style={{ 
            fontSize: theme.typography.labelSize,
            color: theme.colors.textSecondary 
          }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export const ChartLegend = ({ content, ...props }: any) => (
  <Legend 
    content={content} 
    {...props}
  />
);

// Enhanced Area Chart Component
interface ModernAreaChartProps {
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
  timeRangeOptions?: { label: string; value: string }[];
  onTimeRangeChange?: (value: string) => void;
  selectedTimeRange?: string;
  className?: string;
  height?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
  curved?: boolean;
}

export const ModernAreaChart: React.FC<ModernAreaChartProps> = ({
  data,
  config,
  title,
  description,
  timeRangeOptions,
  onTimeRangeChange,
  selectedTimeRange,
  className = "",
  height = "h-[400px]",
  showLegend = true,
  showGrid = true,
  stacked = false,
  curved = true
}) => {
  // Safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className={`pt-0 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </Card>
    );
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <Card className={`pt-0 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Chart configuration missing</p>
        </div>
      </Card>
    );
  }

  const dataKeys = Object.keys(config);

  return (
    <Card className={`pt-0 ${className}`}>
      {(title || description || timeRangeOptions) && (
        <div className="flex items-center gap-2 space-y-0 border-b py-5 px-6 sm:flex-row">
          <div className="grid flex-1 gap-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {timeRangeOptions && onTimeRangeChange && (
            <select
              value={selectedTimeRange}
              onChange={(e) => onTimeRangeChange(e.target.value)}
              className="hidden w-[160px] rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm sm:flex"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className={`aspect-auto ${height} w-full`}
        >
          <AreaChart data={data}>
            <defs>
              {dataKeys.map((key) => (
                <linearGradient key={key} id={`fill${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />}
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ 
                fill: theme.colors.textSecondary,
                fontSize: theme.typography.labelSize,
                fontFamily: theme.typography.fontFamily
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ 
                fill: theme.colors.textSecondary,
                fontSize: theme.typography.labelSize,
                fontFamily: theme.typography.fontFamily
              }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                />
              }
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type={curved ? "natural" : "monotone"}
                fill={`url(#fill${key})`}
                stroke={config[key]?.color || theme.charts.colors[index % theme.charts.colors.length]}
                strokeWidth={theme.charts.line.strokeWidth}
                stackId={stacked ? "a" : undefined}
                animationDuration={800}
                animationBegin={index * 100}
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </AreaChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

// Enhanced Bar Chart Component
interface ModernBarChartProps {
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
  className?: string;
  height?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  horizontal?: boolean;
  stacked?: boolean;
}

export const ModernBarChart: React.FC<ModernBarChartProps> = ({
  data,
  config,
  title,
  description,
  className = "",
  height = "h-[400px]",
  showLegend = true,
  showGrid = true,
  horizontal = false,
  stacked = false
}) => {
  // Safety checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className={`pt-0 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </Card>
    );
  }

  if (!config || Object.keys(config).length === 0) {
    return (
      <Card className={`pt-0 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Chart configuration missing</p>
        </div>
      </Card>
    );
  }

  const dataKeys = Object.keys(config);
  
  // Generate CSS variables for chart colors
  const chartVars = Object.entries(config).reduce((vars, [key, value]) => ({
    ...vars,
    [`--color-${key}`]: value.color,
  }), {});

  return (
    <Card className={`pt-0 ${className}`}>
      {(title || description) && (
        <div className="border-b py-5 px-6">
          {title && (
            <h3 className="font-semibold" style={{ 
              fontSize: theme.typography.titleSize,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily
            }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1" style={{ 
              fontSize: theme.typography.labelSize,
              color: theme.colors.textSecondary 
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className={`${height} w-full`} style={chartVars}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              {showGrid && <CartesianGrid 
                strokeDasharray={theme.charts.grid.strokeDasharray} 
                stroke={theme.colors.gridLines} 
                opacity={theme.charts.grid.opacity} 
              />}
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                className="text-gray-500 dark:text-gray-400"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tick={{ fill: 'currentColor' }}
                className="text-gray-500 dark:text-gray-400"
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={config[key]?.color || theme.charts.colors[index % theme.charts.colors.length]}
                  radius={[theme.charts.bar.borderRadius, theme.charts.bar.borderRadius, 0, 0]}
                  animationDuration={600}
                  animationBegin={index * 100}
                  stackId={stacked ? "a" : undefined}
                  onMouseEnter={(e: any) => {
                    if (e && e.target) {
                      e.target.style.opacity = theme.charts.bar.hoverOpacity;
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (e && e.target) {
                      e.target.style.opacity = 1;
                    }
                  }}
                />
              ))}
              {showLegend && <Legend content={<ChartLegendContent />} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

// Enhanced Line Chart Component
interface ModernLineChartProps {
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
  className?: string;
  height?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  curved?: boolean;
  showDots?: boolean;
}

export const ModernLineChart: React.FC<ModernLineChartProps> = ({
  data,
  config,
  title,
  description,
  className = "",
  height = "h-[400px]",
  showLegend = true,
  showGrid = true,
  curved = true,
  showDots = true
}) => {
  const dataKeys = Object.keys(config);

  return (
    <Card className={`pt-0 ${className}`}>
      {(title || description) && (
        <div className="border-b py-5 px-6">
          {title && (
            <h3 className="font-semibold" style={{ 
              fontSize: theme.typography.titleSize,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily
            }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1" style={{ 
              fontSize: theme.typography.labelSize,
              color: theme.colors.textSecondary 
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className={`aspect-auto ${height} w-full`}
        >
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />}
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ 
                fill: theme.colors.textSecondary,
                fontSize: theme.typography.labelSize,
                fontFamily: theme.typography.fontFamily
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ 
                fill: theme.colors.textSecondary,
                fontSize: theme.typography.labelSize,
                fontFamily: theme.typography.fontFamily
              }}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
            />
            <ChartTooltip
              cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                dataKey={key}
                stroke={config[key]?.color || theme.charts.colors[index % theme.charts.colors.length]}
                strokeWidth={theme.charts.line.strokeWidth}
                type={curved ? "natural" : "monotone"}
                dot={showDots ? { 
                  r: theme.charts.line.dotSize, 
                  fill: config[key]?.color || theme.charts.colors[index % theme.charts.colors.length],
                  strokeWidth: theme.charts.line.dotBorderWidth,
                  stroke: theme.colors.background
                } : false}
                activeDot={{ 
                  r: theme.charts.line.dotSize + 2, 
                  fill: config[key]?.color || theme.charts.colors[index % theme.charts.colors.length], 
                  strokeWidth: theme.charts.line.dotBorderWidth, 
                  stroke: theme.colors.background 
                }}
                animationDuration={800}
                animationBegin={index * 100}
              />
            ))}
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </LineChart>
        </ChartContainer>
      </div>
    </Card>
  );
};

// Enhanced Donut Chart Component
interface ModernDonutChartProps {
  data: any[];
  config: ChartConfig;
  title?: string;
  description?: string;
  className?: string;
  height?: string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export const ModernDonutChart: React.FC<ModernDonutChartProps> = ({
  data,
  config,
  title,
  description,
  className = "",
  height = "h-[400px]",
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100
}) => {
  const dataKeys = Object.keys(config);
  const colors = dataKeys.map(key => config[key].color || theme.charts.colors[0]);
  
  // Calculate inner radius based on theme ratio for doughnut style
  const calculatedInnerRadius = outerRadius * theme.charts.pie.innerRadiusRatio;

  return (
    <Card className={`pt-0 ${className}`}>
      {(title || description) && (
        <div className="border-b py-5 px-6">
          {title && (
            <h3 className="font-semibold" style={{ 
              fontSize: theme.typography.titleSize,
              color: theme.colors.textPrimary,
              fontFamily: theme.typography.fontFamily
            }}>
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1" style={{ 
              fontSize: theme.typography.labelSize,
              color: theme.colors.textSecondary 
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className={`aspect-auto ${height} w-full`}
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={calculatedInnerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              animationDuration={800}
              strokeWidth={theme.charts.pie.strokeWidth}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          </PieChart>
        </ChartContainer>
      </div>
    </Card>
  );
};