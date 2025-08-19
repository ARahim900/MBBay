import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { Meter } from '../../types';

interface MetersViewProps {
  allMeters: Meter[];
  uniqueZones: string[];
  onSelectMeter: (meter: Meter) => void;
}

const MetersView: React.FC<MetersViewProps> = ({ allMeters, uniqueZones, onSelectMeter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');

  const filteredMeters = useMemo(() => {
    return allMeters.filter(meter => {
      const matchesSearch = meter.meter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           meter.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone === 'all' || meter.zone === selectedZone;
      const matchesLevel = selectedLevel === 'all' || meter.level === selectedLevel;
      return matchesSearch && matchesZone && matchesLevel;
    });
  }, [allMeters, searchTerm, selectedZone, selectedLevel]);

  const LevelBadge = ({ level }: { level: string }) => {
    const levelColors: { [key: string]: string } = {
        'L1': 'bg-purple-100 text-purple-800',
        'L2': 'bg-blue-100 text-blue-800',
        'L3': 'bg-green-100 text-green-800',
        'L4': 'bg-yellow-100 text-yellow-800',
        'DC': 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[level] || 'bg-gray-100 text-gray-800'}`}>{level}</span>;
  }

  const StatusBadge = ({ status }: { status: string }) => {
      const statusColors: { [key: string]: string } = {
          'High': 'bg-red-100 text-red-800',
          'Normal': 'bg-green-100 text-green-800',
          'Low': 'bg-gray-100 text-gray-800'
      };
      return <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search meters by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="L1">L1 - Main Source</option>
            <option value="L2">L2 - Primary</option>
            <option value="L3">L3 - Secondary</option>
            <option value="L4">L4 - End Users</option>
            <option value="DC">Direct Connections</option>
          </select>

          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Zones</option>
            {uniqueZones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Meter', 'ID', 'Level', 'Zone', 'Type', 'Total Usage', 'Status', 'Actions'].map(header => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMeters.map((meter) => {
                const totalUsage = meter.daily.reduce((sum, val) => sum + val, 0);
                const avgDaily = totalUsage / meter.daily.length;
                const status = avgDaily > 100 ? 'High' : avgDaily > 50 ? 'Normal' : 'Low';
                
                return (
                  <tr key={meter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meter.meter}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meter.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><LevelBadge level={meter.level} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meter.zone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meter.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalUsage.toFixed(1)} m³</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><StatusBadge status={status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => onSelectMeter(meter)} className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetersView;
