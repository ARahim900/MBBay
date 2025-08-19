import React from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplet, Activity, AlertTriangle, Users } from 'lucide-react';
import { Metrics, DailyTrend, ZonePerformance } from '../../types';
import KpiCard from '../KpiCard';

interface OverviewProps {
  metrics: Metrics;
  dailyTrends: DailyTrend[];
  zonePerformance: ZonePerformance[];
  activeMetersCount: number;
}

const Overview: React.FC<OverviewProps> = ({ metrics, dailyTrends, zonePerformance, activeMetersCount }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Input (A1)"
          value={`${(metrics.a1 / 1000).toFixed(1)}k m³`}
          subtext={<p className="text-gray-500">Main source</p>}
          icon={<Droplet className="h-10 w-10 text-blue-500" />}
        />
        <KpiCard
          title="System Efficiency"
          value={`${metrics.efficiency.toFixed(1)}%`}
          subtext={
            <p className={metrics.efficiency > 85 ? 'text-green-600' : 'text-orange-600'}>
              {metrics.efficiency > 85 ? '↑ Good' : '↓ Needs improvement'}
            </p>
          }
          icon={<Activity className="h-10 w-10 text-green-500" />}
        />
        <KpiCard
          title="Total Loss"
          value={`${(metrics.totalLoss / 1000).toFixed(1)}k m³`}
          subtext={<p className="text-red-600">{`${metrics.lossPercentage.toFixed(1)}% of input`}</p>}
          icon={<AlertTriangle className="h-10 w-10 text-red-500" />}
        />
        <KpiCard
          title="Active Meters"
          value={activeMetersCount.toString()}
          subtext={<p className="text-gray-500">Across all zones</p>}
          icon={<Users className="h-10 w-10 text-purple-500" />}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loss Analysis by Stage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600">Stage 1 Loss</p>
            <p className="text-xl font-bold text-gray-900">{(metrics.stage1Loss / 1000).toFixed(1)}k m³</p>
            <p className="text-sm text-gray-500">Main line losses</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <p className="text-sm text-gray-600">Stage 2 Loss</p>
            <p className="text-xl font-bold text-gray-900">{(metrics.stage2LossIndividual / 1000).toFixed(1)}k m³</p>
            <p className="text-sm text-gray-500">Network losses</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-sm text-gray-600">Stage 3 Loss</p>
            <p className="text-xl font-bold text-gray-900">{(metrics.stage3Loss / 1000).toFixed(1)}k m³</p>
            <p className="text-sm text-gray-500">Building internal</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Consumption Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="consumption" stroke="#3b82f6" fill="#93c5fd" name="Total Input" />
            <Area type="monotone" dataKey="distributed" stroke="#22c55e" fill="#86efac" name="Distributed" />
            <Area type="monotone" dataKey="loss" stroke="#ef4444" fill="#fca5a5" name="Loss" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zone Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={zonePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zone" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="input" fill="#3b82f6" name="Input" />
            <Bar dataKey="output" fill="#22c55e" name="Output" />
            <Bar dataKey="loss" fill="#ef4444" name="Loss" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Overview;