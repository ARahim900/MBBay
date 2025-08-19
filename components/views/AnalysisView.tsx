import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { Metrics } from '../../types';

interface AnalysisViewProps {
  metrics: Metrics;
}

const FlowCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
  <div className={`bg-${color}-100 rounded-lg p-4 mb-2`}>
    <p className={`text-sm text-${color}-600 font-medium`}>{title}</p>
    <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
  </div>
);

const AnalysisView: React.FC<AnalysisViewProps> = ({ metrics }) => {
  const lossData = [
    { name: 'Stage 1 Loss', value: metrics.stage1Loss, color: '#ef4444' },
    { name: 'Stage 2 Loss', value: metrics.stage2LossIndividual, color: '#f97316' },
    { name: 'Stage 3 Loss', value: metrics.stage3Loss, color: '#eab308' },
    { name: 'Delivered', value: metrics.a3Individual, color: '#22c55e' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Distribution Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="text-center">
            <FlowCard title="A1: Main Source" value={`${(metrics.a1 / 1000).toFixed(1)}k m³`} color="purple" />
          </div>
          <ChevronRight className="h-8 w-8 text-gray-400 mx-auto hidden md:block" />
          <div className="text-center">
            <FlowCard title="A2: Primary" value={`${(metrics.a2 / 1000).toFixed(1)}k m³`} color="blue" />
          </div>
          <ChevronRight className="h-8 w-8 text-gray-400 mx-auto hidden md:block" />
          <div className="text-center">
            <FlowCard title="A3: Bulk" value={`${(metrics.a3Bulk / 1000).toFixed(1)}k m³`} color="green" />
          </div>
          <ChevronRight className="h-8 w-8 text-gray-400 mx-auto hidden md:block" />
          <div className="text-center">
            <FlowCard title="A3: Individual" value={`${(metrics.a3Individual / 1000).toFixed(1)}k m³`} color="yellow" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-red-700">Stage 1 Loss: {((metrics.stage1Loss / metrics.a1) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-orange-700">Stage 2 Loss: {((metrics.stage2LossIndividual / metrics.a2) * 100).toFixed(1)}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-yellow-700">Stage 3 Loss: {((metrics.stage3Loss / metrics.a3Bulk) * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loss Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={lossData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {lossData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${(value / 1000).toFixed(1)}k m³`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Loss Areas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center"><AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <div><p className="font-medium text-gray-900">Sales Center Zone</p><p className="text-sm text-gray-600">Critical loss detected</p></div>
              </div>
              <div className="text-right"><p className="text-lg font-bold text-red-600">45% loss</p><p className="text-sm text-gray-600">Immediate action</p></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center"><AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                <div><p className="font-medium text-gray-900">Zone 3A Network</p><p className="text-sm text-gray-600">High loss rate</p></div>
              </div>
              <div className="text-right"><p className="text-lg font-bold text-orange-600">28% loss</p><p className="text-sm text-gray-600">Investigate</p></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center"><AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                <div><p className="font-medium text-gray-900">Building D-52</p><p className="text-sm text-gray-600">Internal losses</p></div>
              </div>
              <div className="text-right"><p className="text-lg font-bold text-yellow-600">22% loss</p><p className="text-sm text-gray-600">Monitor closely</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisView;
