import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { X } from 'lucide-react';
import { Meter } from '../types';

interface MeterDetailModalProps {
  meter: Meter;
  onClose: () => void;
}

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className={`bg-${color}-50 rounded-lg p-4`}>
        <p className={`text-sm text-${color}-600`}>{title}</p>
        <p className={`text-xl font-bold text-${color}-900`}>{value}</p>
    </div>
);

const MeterDetailModal: React.FC<MeterDetailModalProps> = ({ meter, onClose }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const chartData = meter.daily.map((val, idx) => ({ name: months[idx], consumption: val || 0 }));
  
  const totalUsage = meter.daily.reduce((sum, val) => sum + (val || 0), 0);
  const monthlyAverage = totalUsage / meter.daily.length;
  const peakMonth = Math.max(...meter.daily);
  const minMonth = Math.min(...meter.daily);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">{meter.meter}</h2>
                <p className="text-sm text-gray-500">Details and Consumption Trend</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 border-t border-b border-gray-200 py-4">
            <div><p className="text-sm text-gray-600">Meter ID</p><p className="font-medium text-gray-900">{meter.id}</p></div>
            <div><p className="text-sm text-gray-600">Level</p><p className="font-medium text-gray-900">{meter.level}</p></div>
            <div><p className="text-sm text-gray-600">Zone</p><p className="font-medium text-gray-900">{meter.zone}</p></div>
            <div><p className="text-sm text-gray-600">Type</p><p className="font-medium text-gray-900">{meter.type}</p></div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Consumption (m³)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Usage" value={`${totalUsage.toFixed(1)} m³`} color="blue" />
            <StatCard title="Monthly Average" value={`${monthlyAverage.toFixed(1)} m³`} color="green" />
            <StatCard title="Peak Month" value={`${peakMonth.toFixed(1)} m³`} color="yellow" />
            <StatCard title="Min Month" value={`${minMonth.toFixed(1)} m³`} color="red" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeterDetailModal;