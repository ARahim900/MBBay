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

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: any[], label?: string | number }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-gray-200 dark:border-slate-600">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {entry.name}: <span className="font-medium text-gray-900 dark:text-white">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Chart Container Component
interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  actions?: React.ReactNode;
  loading?: boolean;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  height = 300,
  actions,
  loading = false
}) => {
  return (
    <Card loading={loading}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div style={{ height }}>
        {children}
      </div>
    </Card>
  );
};

// Modern Area Chart
interface ModernAreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
    stackId?: string;
  }>;
  height?: number;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ModernAreaChart: React.FC<ModernAreaChartProps> = ({
  data,
  areas,
  height = 300,
  title,
  subtitle,
  actions
}) => {
  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} actions={actions}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {areas.map(area => (
              <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={area.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={area.color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-600" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            className="dark:stroke-slate-400"
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            className="dark:stroke-slate-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          {areas.map(area => (
            <Area 
              key={area.dataKey}
              type="monotone" 
              dataKey={area.dataKey} 
              stackId={area.stackId}
              stroke={area.color} 
              strokeWidth={2}
              fill={`url(#gradient-${area.dataKey})`} 
              name={area.name}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Modern Bar Chart
interface ModernBarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  height?: number;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export const ModernBarChart: React.FC<ModernBarChartProps> = ({
  data,
  bars,
  height = 300,
  title,
  subtitle,
  actions,
  layout = 'vertical'
}) => {
  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} actions={actions}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout={layout}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-600" />
          <XAxis 
            type={layout === 'horizontal' ? 'number' : 'category'}
            dataKey={layout === 'horizontal' ? undefined : 'name'}
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            className="dark:stroke-slate-400"
          />
          <YAxis 
            type={layout === 'horizontal' ? 'category' : 'number'}
            dataKey={layout === 'horizontal' ? 'name' : undefined}
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            className="dark:stroke-slate-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          {bars.map(bar => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              fill={bar.color}
              name={bar.name}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Modern Line Chart
interface ModernLineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    strokeWidth?: number;
  }>;
  height?: number;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ModernLineChart: React.FC<ModernLineChartProps> = ({
  data,
  lines,
  height = 300,
  title,
  subtitle,
  actions
}) => {
  return (
    <ChartContainer title={title} subtitle={subtitle} height={height} actions={actions}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-600" />
          <XAxis 
            dataKey="name" 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            className="dark:stroke-slate-400"
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            className="dark:stroke-slate-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          {lines.map(line => (
            <Line 
              key={line.dataKey}
              type="monotone" 
              dataKey={line.dataKey} 
              stroke={line.color} 
              strokeWidth={line.strokeWidth || 2}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Donut Chart Component
interface DonutChartProps {
  value: number;
  maxValue?: number;
  color: string;
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DonutChart: React.FC<DonutChartProps> = ({
  value,
  maxValue = 100,
  color,
  title,
  subtitle,
  size = 'md'
}) => {
  const sizeMap = {
    sm: { width: 120, height: 120, innerRadius: 35, outerRadius: 50 },
    md: { width: 150, height: 150, innerRadius: 50, outerRadius: 70 },
    lg: { width: 200, height: 200, innerRadius: 70, outerRadius: 95 },
  };

  const dimensions = sizeMap[size];
  const percentage = (value / maxValue) * 100;

  const data = [
    { name: 'value', value: percentage },
    { name: 'remaining', value: 100 - percentage }
  ];

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={dimensions.innerRadius}
              outerRadius={dimensions.outerRadius}
              startAngle={90}
              endAngle={450}
              dataKey="value"
            >
              <Cell fill={color} />
              <Cell fill={`${color}20`} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{title}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}%</span>
        </div>
      </div>
      {subtitle && (
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">{subtitle}</p>
      )}
    </div>
  );
};