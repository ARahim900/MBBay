import React from 'react';
import { ZonePerformance } from '../../types';

const getStatusColor = (lossPercent: number): string => {
  if (lossPercent < 10) return '#22c55e'; // green-500
  if (lossPercent < 20) return '#eab308'; // yellow-500
  if (lossPercent < 30) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};

const getStatusIcon = (lossPercent: number): string => {
  if (lossPercent < 10) return '🟢';
  if (lossPercent < 20) return '🟡';
  if (lossPercent < 30) return '🟠';
  return '🔴';
};

const ZoneCard: React.FC<{ zone: ZonePerformance }> = ({ zone }) => {
  const efficiency = 100 - zone.lossPercent;
  const statusColor = getStatusColor(zone.lossPercent);

  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{zone.zone.replace(/_/g, ' ')}</h3>
        <span className="text-2xl" role="img" aria-label="status icon">{getStatusIcon(zone.lossPercent)}</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Input</span><span className="text-sm font-medium text-gray-900">{zone.input.toLocaleString()} m³</span></div>
        <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Output</span><span className="text-sm font-medium text-gray-900">{zone.output.toLocaleString()} m³</span></div>
        <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Loss</span><span className="text-sm font-medium text-red-600">{zone.loss.toLocaleString()} m³</span></div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Loss Rate</span>
            <span className="text-lg font-bold" style={{ color: statusColor }}>{zone.lossPercent}%</span>
          </div>
        </div>
        
        <div className="pt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{ width: `${efficiency}%`, backgroundColor: statusColor }} />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">Efficiency: {efficiency}%</p>
        </div>
      </div>
    </div>
  );
};

interface ZonesViewProps {
  zonePerformance: ZonePerformance[];
}

const ZonesView: React.FC<ZonesViewProps> = ({ zonePerformance }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {zonePerformance.map((zone) => (
        <ZoneCard key={zone.zone} zone={zone} />
      ))}
    </div>
  );
};

export default ZonesView;
